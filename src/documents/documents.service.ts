import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { Document } from 'langchain/document';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { Embedding, Prisma } from '@prisma/client';
import { OpenAIEmbeddings } from '@langchain/openai';

@Injectable()
export class DocumentsService {
  private readonly embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
  });
  constructor(private readonly prismaService: PrismaService) {}

  private saveFile(file: Express.Multer.File) {
    const filePath = path.resolve('data', file.originalname);

    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, file.buffer);

    return filePath;
  }

  private async loadTextDocument(
    filePath: string,
    splitter: RecursiveCharacterTextSplitter,
  ) {
    const text = fs.readFileSync(filePath, 'utf-8');

    console.log({ text });

    const output = await splitter.createDocuments([text]);

    return output;
  }

  private async loadPdfDocument(
    file: string,
    splitter: RecursiveCharacterTextSplitter,
  ) {
    const loader = new PDFLoader(file, {
      parsedItemSeparator: '',
    });

    const docs = await loader.load();

    const output = await splitter.splitDocuments(docs);

    return output;
  }

  private createVectorStore(id: string) {
    const vectorStore = PrismaVectorStore.withModel<Embedding>(
      this.prismaService,
    ).create(this.embeddings, {
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
    });

    return vectorStore;
  }

  async create(document: Express.Multer.File) {
    try {
      const filePath = this.saveFile(document);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 20,
      });

      let output: Document[];

      if (document.mimetype === 'application/pdf')
        output = await this.loadPdfDocument(filePath, splitter);

      if (document.mimetype === 'text/plain')
        output = await this.loadTextDocument(filePath, splitter);

      console.log({ output });

      const exist = await this.prismaService.document.findUnique({
        where: {
          name: document.originalname,
        },
      });

      if (exist)
        throw new BadRequestException(
          `Document ${document.originalname} already exists`,
        );

      const newDocument = await this.prismaService.document.create({
        data: {
          name: document.originalname,
        },
      });

      //* Store output in a prisma vector store

      const vectorStore = this.createVectorStore(newDocument.id);

      await vectorStore.addModels(
        await this.prismaService.$transaction(
          output.map((chunk) =>
            this.prismaService.embedding.create({
              data: {
                content: chunk.pageContent,
                documentId: newDocument.id,
              },
            }),
          ),
        ),
      );
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findAll() {
    const documents = await this.prismaService.document.findMany({
      select: {
        name: true,
      },
    });

    return documents;
  }

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  // update(id: number, updateDocumentDto: UpdateDocumentDto) {
  //   return `This action updates a #${id} document`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} document`;
  // }
}
