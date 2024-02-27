import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { Documents, Prisma } from '@prisma/client';
import { OpenAIEmbeddings } from '@langchain/openai';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PrismaService } from 'src/prisma/prisma.service';

(async () => {
  await seed();
})();

async function seed() {
  const prisma = new PrismaService();

  try {
    //* Read File and Split
    const filePath = path.resolve(__dirname, 'adoptaunpeludo.txt');
    const text = await fs.readFile(filePath, 'utf-8');

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const output = await splitter.createDocuments([text]);

    console.log({ output });

    //* Store output in a prisma vector store
    const vectorStore = PrismaVectorStore.withModel<Documents>(prisma).create(
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      {
        prisma: Prisma,
        tableName: 'Documents',
        vectorColumnName: 'vector',
        columns: {
          id: PrismaVectorStore.IdColumn,
          content: PrismaVectorStore.ContentColumn,
        },
      },
    );

    await prisma.documents.deleteMany();

    await vectorStore.addModels(
      await prisma.$transaction(
        output.map((chunk) =>
          prisma.documents.create({
            data: {
              content: chunk.pageContent,
            },
          }),
        ),
      ),
    );
  } catch (err) {
    console.log(err);
  } finally {
    await prisma.$disconnect();
  }
}
