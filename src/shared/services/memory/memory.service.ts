import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Collection, MongoClient } from 'mongodb';
import 'dotenv/config';
import { PrismaService } from '../prisma/prisma.service';
import { BufferMemory } from 'langchain/memory';
import { MongoDBChatMessageHistory } from '@langchain/mongodb';
import { CheckPermissions } from 'src/utils/check-permissions.util';
import { User } from '@prisma/client';

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

  async getHistory(document: string, user: User) {
    const exist = await this.prismaService.document.findUnique({
      where: {
        name: document,
      },
    });

    if (!exist)
      throw new NotFoundException(`Documento ${document} no encontrado`);
    CheckPermissions.check(user, exist.createdBy);

    const collection = await this.connectToCollection();

    const memory = await collection.findOne({
      sessionId: `${user.username}-${document}`,
    });
    return memory;
  }

  async createMemory(document: string, user: User) {
    const foundDoc = await this.prismaService.document.findUnique({
      where: {
        name: document,
      },
    });

    if (!foundDoc)
      throw new NotFoundException(`Documento ${document} no encontrado`);

    CheckPermissions.check(user, foundDoc.createdBy);

    const collection = await this.getCollection();

    const memory = new BufferMemory({
      returnMessages: true,
      memoryKey: 'chat_history',
      inputKey: 'input',
      outputKey: 'output',
      chatHistory: new MongoDBChatMessageHistory({
        collection,
        sessionId: `${user.username}-${document}`,
      }),
    });

    return { memory, id: foundDoc.id };
  }

  async removeHistory(document: string, user: User) {
    try {
      const { memory } = await this.createMemory(document, user);
      await memory.chatHistory.clear();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error borrando historial de chat',
      );
    }
  }
}
