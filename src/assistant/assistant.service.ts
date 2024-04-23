import { BadRequestException, Injectable } from '@nestjs/common';

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  // PromptTemplate,
} from '@langchain/core/prompts';
// import { OpenAIConfig } from 'src/shared/interfaces/openai.interface';
import { VectorStoreService } from 'src/shared/services/vector-store/vector-store.service';
// import { DocumentsService } from 'src/documents/documents.service';
// import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
// import { createRetrievalChain } from 'langchain/chains/retrieval';
import { BufferMemory } from 'langchain/memory';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import { createRetrieverTool } from 'langchain/tools/retriever';
import { MemoryService } from 'src/shared/services/memory/memory.service';
import { ModelInitService } from 'src/shared/services/model-init/model-init.service';
import { ChatOpenAI } from '@langchain/openai';
import { User } from '@prisma/client';

@Injectable()
export class AssistantService {
  // private readonly passThrough = new RunnablePassthrough();
  // private readonly stringParser = new StringOutputParser();

  constructor(
    private readonly vectorStoreService: VectorStoreService,
    private readonly memoryService: MemoryService,
    private readonly modelInitService: ModelInitService,
    // @Inject('OPENAI_CONFIG') private readonly openAIConfig: OpenAIConfig,
  ) {}

  // private generateStandAloneQuestionChain() {
  //   const standAloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question.
  //   conversation history: {conv_history}
  //   question: {question}
  //   standalone question:`;

  //   const standAloneQuestionPrompt = PromptTemplate.fromTemplate(
  //     standAloneQuestionTemplate,
  //   );

  //   const standAloneQuestionChain = standAloneQuestionPrompt
  //     .pipe(this.model)
  //     .pipe(this.stringParser);

  //   return standAloneQuestionChain;
  // }

  // private async generateRetrieverChain(
  //   document: string,
  //   answerChain: RunnableSequence,
  // ) {
  //   const { id } = await this.documentsService.findOne(document);

  //   if (!id)
  //     throw new BadRequestException(
  //       `Document ${document} does not exist, please first upload`,
  //     );

  //   const vectorStore = await this.vectorStoreService.createVectorStore(id);

  //   const retriever = vectorStore.asRetriever();

  // const retrieverChain = RunnableSequence.from([
  //   (prevResult) => prevResult.standalone_question,
  //   retriever,
  //   this.documentsService.combineDocuments
  // ]);

  //   const retrievalChain = await createRetrievalChain({
  //     combineDocsChain: answerChain,
  //     retriever,
  //   });

  //   return retrievalChain;
  // }

  // private async generateAnswerChain() {
  //   const answerTemplate = `You are a helpful and enthusiastic support bot that can answer a given question based on the provided context and conversation history.
  //   Try to find the answer in the context. If the answer is not provided in the context, look for the answer in the conversation history if possible.
  //   If you really don't know the answer, say 'I'm sorry, I can't answer that, try reformulating the question or checking the provided documentation.'
  //   Do not attempt to make up an answer.
  //   Always speak as if you were chatting with a friend.
  //   If asked about the document, respond based on the context.
  //   If you can't find the answer to the given question, try looking for synonyms in the question and search again in the context and conversation history.
  //   Always answer in the same language you were asked.
  //   Use the metadata in the context to tell the user where did you found the answer.

  //   context: {context}
  //   conversation history: {chat_history}
  //   question: {input}
  //   answer: `;

  //   const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

  //   // const answerChain = answerPrompt.pipe(this.model).pipe(this.stringParser)

  //   const answerChain = await createStuffDocumentsChain({
  //     llm: this.model,
  //     prompt: answerPrompt,
  //   });

  //   return answerChain;
  // }

  // private formatConvHistory(messages: string[]) {
  //   return messages
  //     .map((message, i) => {
  //       if (i % 2 === 0) {
  //         return `Human: ${message}`;
  //       } else {
  //         return `AI: ${message}`;
  //       }
  //     })
  //     .join('\n');
  // }

  public async deleteMemory(document: string, user: User) {
    await this.memoryService.removeHistory(document, user);
  }

  private createPrompt(document: string) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an intelligent AI assistant designed to interpret and answer questions and instructions based on specific provided document: ${document}. The context from these documents has been processed and made accessible to you. 
        Your mission is to generate answers that are accurate, succinct, and comprehensive, drawing upon the information contained in the context of the documents. If the answer isn't readily found in the documents, you should make use of your training data and understood context to infer and provide the most plausible response.
        You are also capable of evaluating, comparing and providing opinions based on the content of these documents. Hence, if asked to compare or analyze the documents, use your AI understanding to deliver an insightful response.
        If the query isn't related to the document context, kindly inform the user that your primary task is to answer questions specifically related to the document context.
        Always answer in the language you were initially asked.
        Provide your response in markdown format.`,
      ],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    return prompt;
  }

  private async createRetrieverTool(id: string, document: string) {
    const vectorStore = await this.vectorStoreService.createVectorStore(id);

    const retriever = vectorStore.asRetriever();

    const retrieverTool = createRetrieverTool(retriever, {
      name: id,
      description: `Tool to search information about ${document}`,
    });

    return retrieverTool;
  }

  private async createAgentExecutor(
    tools: any,
    prompt: ChatPromptTemplate,
    memory: BufferMemory,
    model: ChatOpenAI,
  ) {
    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      memory,
    });

    return agentExecutor;
  }

  async getAssistantAnswer(document: string, question: string, user: User) {
    const model = this.modelInitService.getModel(user.id);

    if (!model)
      throw new BadRequestException(
        'Error creando el modelo, ¿Es tu API Key válida?',
      );

    const { memory, id } = await this.memoryService.createMemory(
      document,
      user,
    );

    const prompt = this.createPrompt(document);

    const retrieverTool = await this.createRetrieverTool(id, document);

    const tools = [retrieverTool];

    const agentExecutor = await this.createAgentExecutor(
      tools,
      prompt,
      memory,
      model,
    );

    const chat_history = await memory.chatHistory.getMessages();

    const response = await agentExecutor.invoke({
      outputKey: 'output',
      input: question,
      chat_history,
    });

    return response.output;
  }

  async getChatHistory(document: string, user: User) {
    const memory = await this.memoryService.getHistory(document, user);
    return memory;
  }
}
