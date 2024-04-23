import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
// import { ConversationChain } from 'langchain/chains';
import { MemoryService } from 'src/shared/services/memory/memory.service';
import { BufferMemory } from 'langchain/memory';
import { MongoDBChatMessageHistory } from '@langchain/mongodb';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ModelInitService } from 'src/shared/services/model-init/model-init.service';
import { User } from '@prisma/client';

@Injectable()
export class ChatgptService {
  private readonly stringOutputParser = new StringOutputParser();
  constructor(
    private readonly memoryService: MemoryService,
    private readonly modelInitService: ModelInitService,
    // @Inject('OPENAI_CONFIG') private readonly openAIConfig: OpenAIConfig,
  ) {}

  async getChatHistory(name: string, user: User) {
    return await this.memoryService.getHistory(name, user);
  }

  private async createMemory(user: User) {
    const collection = await this.memoryService.getCollection();

    // Session id for chatbot
    const sessionId = `${user.username}-chatgptbot`;

    // Create buffer memory
    const memory = new BufferMemory({
      memoryKey: 'history',
      chatHistory: new MongoDBChatMessageHistory({
        collection,
        sessionId,
      }),
    });

    return memory;
  }

  public async deleteMemory(user: User) {
    try {
      const memory = await this.createMemory(user);
      await memory.chatHistory.clear();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error clearing memory, check server logs',
      );
    }
  }

  private createPrompt() {
    // Chatbot prompt with instructions
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are an AI assistant called Max. You are here to help answer questions and provide information to the best of your ability.
      Always answer in the language you were initially asked.
      If possible, answer in markdown format.
      Chat History: {history}
      {input}
    `);

    return prompt;
  }

  private createChain(
    prompt: ChatPromptTemplate,
    memory: BufferMemory,
    model: ChatOpenAI,
  ) {
    // Using Chain Class
    // const chain = new ConversationChain({ llm: this.model, prompt, memory });

    // Using LCEL
    const chain = RunnableSequence.from([
      // Get initial input and memory
      {
        input: (initialInput) => initialInput.input,
        memory: () => memory.loadMemoryVariables({}),
      },
      // Provide input and memory to prompt
      {
        input: (previousOutput) => previousOutput.input,
        history: (previousOutput) => previousOutput.memory.history,
      },
      // Chain prompt, model and output parser
      prompt,
      model,
      this.stringOutputParser,
    ]);

    return chain;
  }

  private async updateMemory(
    memory: BufferMemory,
    question: string,
    response: string,
  ) {
    //Update memory
    await memory.saveContext(
      {
        input: question,
      },
      {
        output: response,
      },
    );
  }

  async getChatgptAnswer(question: string, user: User) {
    // const config = await this.openAiConfigService.getConfig();

    // const model = await this.modelInitService.initModel(config);

    const model = this.modelInitService.getModel(user.id);

    if (!model)
      throw new BadRequestException(
        'Error creando el modelo, ¿Es tu API Key válida?',
      );

    const memory = await this.createMemory(user);

    const prompt = this.createPrompt();

    const chain = this.createChain(prompt, memory, model);

    // Get response
    const response = await chain.invoke({
      input: question,
    });

    await this.updateMemory(memory, question, response);

    return response;
  }
}
