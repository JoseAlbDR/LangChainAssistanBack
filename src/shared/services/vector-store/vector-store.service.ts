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
  private readonly embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
  });
  constructor(private readonly prismaService: PrismaService) {}

  createVectorStore(id: string): VectorStoreType {
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
    output: Document[],
    id: string,
  ) {
    await vectorStore.addModels(
      await this.prismaService.$transaction(
        output.map((chunk) =>
          this.prismaService.embedding.create({
            data: {
              content: chunk.pageContent,
              documentId: id,
            },
          }),
        ),
      ),
    );
  }
}
