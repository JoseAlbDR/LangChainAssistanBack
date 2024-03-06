import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { OpenAIConfig } from 'src/shared/interfaces/openai.interface';

@Injectable()
export class ModelInitService {
  private model: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;

  constructor() {}

  async initModel(config: OpenAIConfig) {
    this.model = new ChatOpenAI({
      openAIApiKey: config.openAIApiKey || process.env.OPENAI_API_KEY,
      ...config,
    });

    console.log('Model initialized');
    return this.model;
  }

  async initEmbedding(openAIApiKey: string) {
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small',
      openAIApiKey: openAIApiKey || process.env.OPENAI_API_KEY,
    });

    console.log('Embeddings initialized');
    return this.embeddings;
  }

  getModel() {
    return this.model;
  }

  getEmbeddings() {
    return this.embeddings;
  }
}
