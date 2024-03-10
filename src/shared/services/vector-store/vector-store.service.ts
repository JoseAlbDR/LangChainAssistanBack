import { Injectable } from '@nestjs/common';
import {
  PrismaSqlFilter,
  PrismaVectorStore,
} from '@langchain/community/vectorstores/prisma';
import { Embedding, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Document } from 'langchain/document';
import { OpenaiConfigService } from 'src/openai-config/openai-config.service';
import { OpenAIEmbeddings } from '@langchain/openai';

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
  PrismaSqlFilter<any>
>;

@Injectable()
export class VectorStoreService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly openAIConfigService: OpenaiConfigService,
  ) {}

  async createVectorStore(id?: string): Promise<VectorStoreType> {
    const config = await this.openAIConfigService.getConfig();

    const filter = id
      ? {
          documentId: {
            equals: id,
          },
        }
      : {};

    const vectorStore = PrismaVectorStore.withModel<Embedding>(
      this.prismaService,
    ).create(new OpenAIEmbeddings({ openAIApiKey: config.openAIApiKey }), {
      prisma: Prisma,
      tableName: 'Embedding',
      vectorColumnName: 'vector',
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
      filter,
    });

    return vectorStore;
  }

  async addModels(
    vectorStore: VectorStoreType,
    documents: Document[],
    id: string,
  ) {
    console.log('addmodels');
    console.log(documents.length);

    await vectorStore.addModels(
      await this.prismaService.$transaction(
        documents.map((chunk) => {
          // console.log(`Chunk: ${index}`);
          return this.prismaService.embedding.create({
            data: {
              content: chunk.pageContent,
              metadata: chunk.metadata,
              documentId: id,
            },
          });
        }),
      ),
    );

    console.log('addmodels finished');
  }
}
