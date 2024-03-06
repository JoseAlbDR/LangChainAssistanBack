import { Injectable } from '@nestjs/common';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { Embedding, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Document } from 'langchain/document';
import { ModelInitService } from '../model-init/model-init.service';

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
  constructor(
    private readonly prismaService: PrismaService,
    private readonly embeddingInitService: ModelInitService,
  ) {}

  async createVectorStore(id: string): Promise<VectorStoreType> {
    const embeddings = this.embeddingInitService.getEmbeddings();

    return PrismaVectorStore.withModel<Embedding>(this.prismaService).create(
      embeddings,
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
