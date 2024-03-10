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

@Injectable()
export class DocumentsService {
  private document: { id: string; name: string };

  constructor(
    private readonly prismaService: PrismaService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  public combineDocuments(docs: Document[]) {
    return docs.map((doc) => doc.pageContent).join('\n\n');
  }

  private saveFile(file: Express.Multer.File) {
    const filePath = path.resolve('data', file.originalname);

    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, file.buffer);

    return filePath;
  }

  private async loadTextDocument(filePath: string) {
    const text = fs.readFileSync(filePath, 'utf-8');

    return text;
  }

  private async loadPdfDocument(file: string) {
    const loader = new PDFLoader(file, {
      parsedItemSeparator: '',
    });

    const docs = await loader.load();

    return docs;
  }

  async create(document: Express.Multer.File) {
    try {
      const filePath = this.saveFile(document);

      let documents;

      if (document.mimetype === 'application/pdf')
        documents = await this.loadPdfDocument(filePath);

      if (document.mimetype === 'text/plain')
        documents = await this.loadTextDocument(filePath);

      const chunkSize = documents.length / 3;
      const chunkOverlap = chunkSize * 0.1;

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
      });

      const output = await splitter.splitDocuments(documents);

      const exist = await this.prismaService.document.findUnique({
        where: {
          name: document.originalname,
        },
      });

      if (exist)
        throw new BadRequestException(
          `Document ${document.originalname} already exists`,
        );

      this.document = await this.prismaService.document.create({
        data: {
          name: document.originalname,
        },
      });

      const vectorStore = await this.vectorStoreService.createVectorStore();

      await this.vectorStoreService.addModels(
        vectorStore,
        output,
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

  async findAll() {
    const documents = await this.prismaService.document.findMany({
      select: {
        name: true,
      },
    });

    return documents;
  }

  async findOne(document: string) {
    const foundDocument = await this.prismaService.document.findUnique({
      where: {
        name: document,
      },
    });

    if (!foundDocument)
      throw new NotFoundException(`Document ${document} not found`);

    return foundDocument;
  }

  // update(id: number, updateDocumentDto: UpdateDocumentDto) {
  //   return `This action updates a #${id} document`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} document`;
  // }
}
