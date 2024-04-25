import { ChatOpenAI } from '@langchain/openai';
import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAIConfig } from 'src/shared/interfaces/openai.interface';
import { EncryptService } from '../encrypt/encrypt.service';

@Injectable()
export class ModelInitService {
  private modelStates: Map<string, ChatOpenAI> = new Map();

  constructor(private readonly encryptService: EncryptService) {}

  private async updateModelState(
    userId: string,
    model: ChatOpenAI,
  ): Promise<void> {
    this.modelStates.set(userId, model);
  }

  public getModel(userId: string): ChatOpenAI {
    return this.modelStates.get(userId);
  }

  async initModel(config: OpenAIConfig, userId: string) {
    const model = new ChatOpenAI({
      ...config,
      openAIApiKey:
        this.encryptService.decrypt(config.openAIApiKey) ||
        this.encryptService.decrypt(process.env.OPENAI_API_KEY),
    });

    if (!model)
      throw new BadRequestException(
        'Error generando el modelo de IA, posiblemente API Key invalida',
      );

    this.updateModelState(userId, model);

    console.log('Model initialized');

    return model;
  }
}
