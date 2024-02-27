import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Prisma } from '@prisma/client';
import { Document } from 'langchain/document';

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
    const answerTemplate = `Eres un bot de soporte útil y entusiasta que puede responder a una pregunta dada sobre adoptaunpeludo.com basándose en el contexto proporcionado y en la historia de la conversación. Intenta encontrar la respuesta en el contexto. Si la respuesta no se da en el contexto, busca la respuesta en la historia de la conversación si es posible. Si realmente no sabes la respuesta, di 'Lo siento, no puedo responderte a eso.' y dirige al preguntante a enviar un correo electrónico a adoptaunpeludoapp@gmail.com. No intentes inventar una respuesta. Siempre habla como si estuvieras chateando con un amigo.

    Intenta buscar sinonimos en la pregunta que se te está haciendo para así ampliar la busqueda, por ejemplo, poner un anuncio seria sinonimo de crear un anuncio

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
}
