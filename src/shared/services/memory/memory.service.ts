import { Injectable } from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import 'dotenv/config';

@Injectable()
export class MemoryService {
  private async connectToCollection(): Promise<Collection> {
    const client: MongoClient = new MongoClient(process.env.MONGO_DB_URL);
    await client.connect();
    return client.db('chatbot').collection('memory');
  }

  async getCollection(): Promise<Collection> {
    return await this.connectToCollection();
  }

  async getHistory(document: string) {
    const collection = await this.connectToCollection();
    const memory = await collection.findOne({ sessionId: document });
    return memory;
  }
}
