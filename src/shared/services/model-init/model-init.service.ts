import { ChatOpenAI } from '@langchain/openai';
import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIConfig } from 'src/shared/interfaces/openai.interface';

interface ModelState {
  model: ChatOpenAI;
}

@Injectable()
export class ModelInitService {
  private modelStates: Map<string, ModelState> = new Map();

  constructor() {}

  private async updateModelState(
    userId: string,
    model: ModelState,
  ): Promise<void> {
    this.modelStates.set(userId, model);
  }

  public getModel(userId: string): ChatOpenAI {
    return this.modelStates.get(userId).model;
  }

  async initModel(config: OpenAIConfig, userId: string) {
    try {
      const model = new ChatOpenAI({
        openAIApiKey: config.openAIApiKey || process.env.OPENAI_API_KEY,
        ...config,
      });

      if (!model)
        throw new BadRequestException(
          'Error generando el modelo de IA, posiblemente API Key invalida',
        );

      this.updateModelState(userId, { model });

      console.log('Model initialized');
      return model;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Error creando el modelo, ¿es tu API Key valida?',
      );
    }
  }
}
