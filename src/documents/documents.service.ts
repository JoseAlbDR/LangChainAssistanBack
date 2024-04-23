import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { Document } from 'langchain/document';
import { VectorStoreService } from 'src/shared/services/vector-store/vector-store.service';
import { MemoryService } from 'src/shared/services/memory/memory.service';
import { DocumentOptionsDto } from './dtos/document-options.dto';
import { CheckPermissions } from 'src/utils/check-permissions.util';
import { User } from '@prisma/client';

@Injectable()
export class DocumentsService {
  private document: { id: string; name: string };

  constructor(
    private readonly prismaService: PrismaService,
    private readonly vectorStoreService: VectorStoreService,
    private readonly memoryService: MemoryService,
  ) {}

  public combineDocuments(docs: Document[]) {
    return docs.map((doc) => doc.pageContent).join('\n\n');
  }

  private saveFile(file: Express.Multer.File) {
    const filePath = path.resolve('data', file.originalname);

    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, file.buffer);

    return filePath;
  }

  private async loadTextDocument(
    content: Buffer,
    splitter: RecursiveCharacterTextSplitter,
  ) {
    const text = content.toString('utf-8');

    const output = await splitter.createDocuments([text]);

    return output;
  }

  private async loadPdfDocument(
    content: Buffer,
    splitter: RecursiveCharacterTextSplitter,
  ) {
    const blob = new Blob([content], { type: 'application/pdf' });

    const loader = new PDFLoader(blob, {
      parsedItemSeparator: '',
    });

    const docs = await loader.load();

    const output = await splitter.splitDocuments(docs);

    return output;
  }

  private checkIfDocumentExist = async (document: string) => {
    const exist = await this.prismaService.document.findUnique({
      where: {
        name: document,
      },
    });

    if (exist)
      throw new BadRequestException(`Document ${document} already exists`);
  };

  async create(
    document: Express.Multer.File,
    documentOptions: DocumentOptionsDto,
    userId: string,
  ) {
    const { chunkSize, chunkOverlap } = documentOptions;

    await this.checkIfDocumentExist(document.originalname);
    try {
      const splitter = new RecursiveCharacterTextSplitter({
        separators: ['\n'],
        chunkSize,
        chunkOverlap,
      });

      let documents: Document[];

      if (document.mimetype === 'application/pdf')
        documents = await this.loadPdfDocument(document.buffer, splitter);

      if (document.mimetype === 'text/plain')
        documents = await this.loadTextDocument(document.buffer, splitter);

      this.document = await this.prismaService.document.create({
        data: {
          name: document.originalname,
        },
      });

      const vectorStore =
        await this.vectorStoreService.createVectorStore(userId);

      await this.vectorStoreService.addModels(
        vectorStore,
        documents,
        this.document.id,
      );
    } catch (err) {
      console.log(err);
      await this.prismaService.document.delete({
        where: { id: this.document.id },
      });
      throw err;
    } finally {
      await this.prismaService.$disconnect();
    }
  }

  async findAll(userId: string) {
    const documents = await this.prismaService.document.findMany({
      where: {
        userId,
      },
      select: {
        name: true,
      },
    });

    return documents;
  }

  async findOne(document: string, user: User) {
    const foundDocument = await this.prismaService.document.findUnique({
      where: {
        name: document,
      },
    });

    if (!foundDocument)
      throw new NotFoundException(`Documento ${document} no encontrado`);

    CheckPermissions.check(user, foundDocument.userId);

    return foundDocument;
  }

  // update(id: number, updateDocumentDto: UpdateDocumentDto) {
  //   return `This action updates a #${id} document`;
  // }

  async remove(name: string, user: User) {
    try {
      const document = await this.prismaService.document.findUnique({
        where: {
          name,
        },
      });

      if (!document)
        throw new NotFoundException(`Documento ${name} no encontrado`);

      CheckPermissions.check(user, document.userId);

      await this.memoryService.removeHistory(name);
      await this.prismaService.$transaction([
        this.prismaService.embedding.deleteMany({
          where: {
            documentId: document.id,
          },
        }),
        this.prismaService.document.delete({
          where: {
            name,
          },
        }),
      ]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
