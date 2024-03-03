import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Documents, Prisma } from '@prisma/client';
import { Document } from 'langchain/document';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as fs from 'fs';
import * as path from 'path';

interface OpenAIConfig {
  openAIApiKey: string;
  temperature: number;
  maxTokens: number;
}

@Injectable()
export class ChatBotService {
  private readonly model: ChatOpenAI;
  private readonly passThrough = new RunnablePassthrough();
  private readonly stringParser = new StringOutputParser();
  private readonly embeddings = new OpenAIEmbeddings();

  constructor(
    private readonly prismaService: PrismaService,
    @Inject('OPENAI_CONFIG') private readonly openAIConfig: OpenAIConfig,
  ) {
    const { openAIApiKey, maxTokens, temperature } = this.openAIConfig;
    this.model = new ChatOpenAI({
      openAIApiKey,
      temperature,
      maxTokens,
    });
  }

  private generateStandAloneQuestionChain() {
    const standAloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question.
    conversation history: {conv_history}
    question: {question}
    standalone question:`;

    const standAloneQuestionPrompt = PromptTemplate.fromTemplate(
      standAloneQuestionTemplate,
    );

    const standAloneQuestionChain = standAloneQuestionPrompt
      .pipe(this.model)
      .pipe(this.stringParser);

    return standAloneQuestionChain;
  }

  private generateRetrieverChain() {
    const vectorStore = new PrismaVectorStore(this.embeddings, {
      db: this.prismaService,
      prisma: Prisma,
      tableName: 'Documents',
      vectorColumnName: 'vector',
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
    });

    const retriever = vectorStore.asRetriever();

    const retrieverChain = RunnableSequence.from([
      (prevResult) => prevResult.standalone_question,
      retriever,
      (prevResult) => {
        console.log({ prevResult });
        return prevResult;
      },
      this.combineDocuments,
    ]);

    return retrieverChain;
  }

  private combineDocuments(docs: Document[]) {
    return docs.map((doc) => doc.pageContent).join('\n\n');
  }

  private generateAnswerChain() {
    const answerTemplate = `You are a helpful and enthusiastic support bot that can answer a given question based on the provided context and conversation history. 
    Try to find the answer in the context. If the answer is not provided in the context, look for the answer in the conversation history if possible. 
    If you really don't know the answer, say 'I'm sorry, I can't answer that, try reformulating the question or checking the provided documentation.' 
    Do not attempt to make up an answer. 
    Always speak as if you were chatting with a friend. 
    If asked about the document, respond based on the context. 
    If you can't find the answer to the given question, try looking for synonyms in the question and search again in the context and conversation history.
    Always answer in the same language you were asked.

    context: {context}
    conversation history: {conv_history}
    question: {question}
    answer: `;

    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);
    const answerChain = answerPrompt.pipe(this.model).pipe(this.stringParser);

    return answerChain;
  }

  private formatConvHistory(messages: string[]) {
    return messages
      .map((message, i) => {
        if (i % 2 === 0) {
          return `Human: ${message}`;
        } else {
          return `AI: ${message}`;
        }
      })
      .join('\n');
  }

  async getChatBotAnswer(question: string, convHistory: string[]) {
    const standAloneQuestionChain = this.generateStandAloneQuestionChain();
    const retrieverChain = this.generateRetrieverChain();
    const answerChain = this.generateAnswerChain();

    const chain = RunnableSequence.from([
      {
        standalone_question: standAloneQuestionChain,
        originalInput: this.passThrough,
      },
      {
        context: retrieverChain,
        question: ({ originalInput }) => originalInput.question,
        conv_history: ({ originalInput }) => originalInput.conv_history,
      },
      answerChain,
    ]);

    const stream = await chain.stream({
      question,
      conv_history: this.formatConvHistory(convHistory),
    });

    convHistory.push(question);

    return stream;
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

  private saveFile(file: Express.Multer.File) {
    const filePath = path.resolve('data', file.originalname);

    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, file.buffer);

    return filePath;
  }

  async feedDocument(document: Express.Multer.File) {
    try {
      const filePath = this.saveFile(document);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
      });

      let output: Document[];

      if (document.mimetype === 'application/pdf')
        output = await this.loadPdfDocument(filePath, splitter);

      if (document.mimetype === 'text/plain')
        output = await this.loadTextDocument(filePath, splitter);

      console.log({ output });

      //* Store output in a prisma vector store
      const vectorStore = PrismaVectorStore.withModel<Documents>(
        this.prismaService,
      ).create(
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

      await this.prismaService.documents.deleteMany();

      await vectorStore.addModels(
        await this.prismaService.$transaction(
          output.map((chunk) =>
            this.prismaService.documents.create({
              data: {
                content: chunk.pageContent,
              },
            }),
          ),
        ),
      );
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('There was an error, check logs');
    } finally {
      await this.prismaService.$disconnect();
    }
  }
}
