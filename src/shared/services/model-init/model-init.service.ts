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

  getModel() {
    return this.model;
  }
}
