import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Embedding, Prisma } from '@prisma/client';
import { Document } from 'langchain/document';
import { OpenAIConfig } from 'src/shared/interfaces/openai.interface';

@Injectable()
export class AssistantService {
  private readonly model: ChatOpenAI;
  private readonly passThrough = new RunnablePassthrough();
  private readonly stringParser = new StringOutputParser();
  private readonly embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-small',
  });

  constructor(
    private readonly prismaService: PrismaService,
    @Inject('OPENAI_CONFIG') private readonly openAIConfig: OpenAIConfig,
  ) {
    this.model = new ChatOpenAI(this.openAIConfig);
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

  private async generateRetrieverChain(document: string) {
    const { id } = await this.prismaService.document.findUnique({
      where: {
        name: document,
      },
      select: {
        id: true,
      },
    });

    if (!id)
      throw new BadRequestException(
        `Document ${document} does not exist, please first upload`,
      );

    const vectorStore = this.createVectorStore(id);

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

  async getAssistantAnswer(
    document: string,
    question: string,
    convHistory: string[],
  ) {
    const standAloneQuestionChain = this.generateStandAloneQuestionChain();
    const retrieverChain = await this.generateRetrieverChain(document);
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

  async getDocuments() {
    const documents = await this.prismaService.document.findMany({
      select: {
        name: true,
      },
    });

    return documents;
  }
}
