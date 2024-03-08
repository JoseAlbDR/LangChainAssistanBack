import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import 'dotenv/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MemoryService {
  constructor(private readonly prismaService: PrismaService) {}

  private async connectToCollection(): Promise<Collection> {
    try {
      const client: MongoClient = new MongoClient(process.env.MONGO_DB_URL);
      await client.connect();
      return client.db('chatbot').collection('memory');
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Error connecting to MongoDB');
    }
  }

  async getCollection(): Promise<Collection> {
    return await this.connectToCollection();
  }

  async getHistory(document: string) {
    if (document !== 'chatgptbot') {
      const exist = await this.prismaService.document.findUnique({
        where: {
          name: document,
        },
      });

      if (!exist)
        throw new NotFoundException(`Documento ${document} no encontrado`);
    }

    const collection = await this.connectToCollection();

    const memory = await collection.findOne({ sessionId: document });
    return memory;
  }
}
