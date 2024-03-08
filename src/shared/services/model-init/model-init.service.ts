import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIConfig } from 'src/shared/interfaces/openai.interface';

@Injectable()
export class ModelInitService {
  private model: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;

  constructor() {}

  async initModel(config: OpenAIConfig) {
    try {
      this.model = new ChatOpenAI({
        openAIApiKey: config.openAIApiKey || process.env.OPENAI_API_KEY,
        ...config,
      });

      console.log('Model initialized');
      return this.model;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error creando el modelo, ¿es tu API Key valida?',
      );
    }
  }

  getModel() {
    return this.model;
  }
}
