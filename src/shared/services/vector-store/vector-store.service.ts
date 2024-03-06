import { Injectable } from '@nestjs/common';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Embedding, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Document } from 'langchain/document';

// Define the return type of the method
type VectorStoreType = PrismaVectorStore<
  {
    id: string;
    content: string;
    documentId: string;
    metadata: Prisma.JsonValue;
  },
  'Embedding' | 'Document',
  {
    id: typeof PrismaVectorStore.IdColumn;
    content: typeof PrismaVectorStore.ContentColumn;
  },
  {
    documentId: {
      equals: string;
    };
  }
>;

@Injectable()
export class VectorStoreService {
  private embeddings: OpenAIEmbeddings;
  constructor(private readonly prismaService: PrismaService) {}

  private async initEmbeddings() {
    try {
      const openAIConfig = await this.prismaService.chatConfig.findUnique({
        where: {
          id: 'chatgptbot',
        },
        select: {
          openAIApiKey: true,
        },
      });

      if (openAIConfig?.openAIApiKey || process.env.OPENAI_API_KEY) {
        console.log('Embeddings Model initialized successfully');
        this.embeddings = new OpenAIEmbeddings({
          modelName: 'text-embedding-3-small',
          openAIApiKey:
            openAIConfig?.openAIApiKey || process.env.OPENAI_API_KEY,
        });
      }
    } catch (error) {}
  }

  async createVectorStore(id: string): Promise<VectorStoreType> {
    if (!this.embeddings) await this.initEmbeddings();

    return PrismaVectorStore.withModel<Embedding>(this.prismaService).create(
      this.embeddings,
      {
        prisma: Prisma,
        tableName: 'Embedding',
        vectorColumnName: 'vector',
        columns: {
          id: PrismaVectorStore.IdColumn,
          content: PrismaVectorStore.ContentColumn,
        },
        filter: {
          documentId: {
            equals: id,
          },
        },
      },
    );
  }

  async addModels(
    vectorStore: VectorStoreType,
    documents: Document[],
    id: string,
  ) {
    if (!this.embeddings) await this.initEmbeddings();

    await vectorStore.addModels(
      await this.prismaService.$transaction(
        documents.map((chunk) =>
          this.prismaService.embedding.create({
            data: {
              content: chunk.pageContent,
              metadata: chunk.metadata,
              documentId: id,
            },
          }),
        ),
      ),
    );
  }
}
