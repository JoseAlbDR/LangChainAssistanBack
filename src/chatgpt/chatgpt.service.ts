import { Inject, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { OpenAIConfig } from 'src/shared/interfaces/openai.interface';

@Injectable()
export class ChatgptService {
  private readonly model: ChatOpenAI;
  private readonly stringParser = new StringOutputParser();

  constructor(
    private readonly prismaService: PrismaService,
    @Inject('OPENAI_CONFIG') private readonly openAIConfig: OpenAIConfig,
  ) {
    this.model = new ChatOpenAI(this.openAIConfig);
  }

  private generateAnswerChain() {
    const answerTemplate = `
      You are a model called PersonalGPT which interacts in a conversational way. The dialogue format makes it possible for you to answer followup questions, admit its mistakes, challenge incorrect premises, and reject inappropriate requests.
      Your task is to answer the given user question 
      Always answer in the same language you were asked in
      Don't make up the answer, if you really don't know the answer to the given question, suggest some resource were the user could find the answer.
      question: {question}
      answer: 
    `;

    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

    const answerChain = answerPrompt.pipe(this.model).pipe(this.stringParser);

    return answerChain;
  }

  async getChatgptAnswer(question: string) {
    const answerChain = this.generateAnswerChain();

    const stream = await answerChain.stream({
      question,
    });

    return stream;
  }
}
