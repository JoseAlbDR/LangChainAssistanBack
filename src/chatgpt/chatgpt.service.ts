import { Inject, Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { OpenAIConfig } from 'src/shared/interfaces/openai.interface';
// import { ConversationChain } from 'langchain/chains';
import { MemoryService } from 'src/shared/services/memory/memory.service';
import { BufferMemory } from 'langchain/memory';
import { MongoDBChatMessageHistory } from '@langchain/mongodb';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

@Injectable()
export class ChatgptService {
  private readonly model: ChatOpenAI;
  private readonly stringOutputParser = new StringOutputParser();
  constructor(
    private readonly memoryService: MemoryService,
    @Inject('OPENAI_CONFIG') private readonly openAIConfig: OpenAIConfig,
  ) {
    this.model = new ChatOpenAI(this.openAIConfig);
  }

  async getChatHistory(name: string) {
    return await this.memoryService.getHistory(name);
  }

  private async createMemory() {
    const collection = await this.memoryService.getCollection();

    // Session id for chatbot
    const sessionId = 'chatgptbot';

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

  private createPrompt() {
    // Chatbot prompt with instructions
    const prompt = ChatPromptTemplate.fromTemplate(`
      You are an AI assistant called Max. You are here to help answer questions and provide information to the best of your ability.
      Chat History: {history}
      {input}
    `);

    return prompt;
  }

  private createChain(prompt: ChatPromptTemplate, memory: BufferMemory) {
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
      this.model,
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

  async getChatgptAnswer(question: string) {
    const memory = await this.createMemory();

    const prompt = this.createPrompt();

    const chain = this.createChain(prompt, memory);

    // Get response
    const response = await chain.invoke({
      input: question,
    });

    await this.updateMemory(memory, question, response);

    return response;
  }
}
