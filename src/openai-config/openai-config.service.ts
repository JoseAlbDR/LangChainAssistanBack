import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOpenaiConfigDto } from './dto/create-openai-config.dto';
// import { UpdateOpenaiConfigDto } from './dto/update-openai-config.dto';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { UpdateOpenaiConfigDto } from './dto/update-openai-config.dto';
import { ModelInitService } from 'src/shared/services/model-init/model-init.service';
import { EncryptService } from 'src/shared/services/encrypt/encrypt.service';
import { Config } from '@prisma/client';

@Injectable()
export class OpenaiConfigService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly modelInitService: ModelInitService,
    private readonly encryptService: EncryptService,
  ) {}

  async saveConfig(
    createOpenaiConfigDto: CreateOpenaiConfigDto,
    userId: string,
  ) {
    try {
      const config = await this.prismaService.config.create({
        data: {
          id: userId,
          ...createOpenaiConfigDto,
          openAIApiKey:
            this.encryptService.encrypt(createOpenaiConfigDto.openAIApiKey) ||
            this.encryptService.encrypt(process.env.OPENAI_API_KEY),
        },
        select: {
          maxTokens: true,
          modelName: true,
          openAIApiKey: true,
          temperature: true,
        },
      });

      if (config.openAIApiKey)
        await this.modelInitService.initModel(
          {
            ...config,
            openAIApiKey: this.encryptService.decrypt(config.openAIApiKey),
          },
          userId,
        );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'There was an error creating chat config, check server logs',
      );
    }
  }

  async getConfig(userId: string): Promise<Config> {
    try {
      const config = await this.prismaService.config.findUnique({
        where: {
          id: userId,
        },
      });

      return config;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error getting config, check server logs',
      );
    }
  }

  async updateConfig(config: UpdateOpenaiConfigDto, userId: string) {
    const updates = config.openAIApiKey
      ? {
          ...config,
          openAIApiKey: this.encryptService.encrypt(config.openAIApiKey),
        }
      : {
          maxTokens: config.maxTokens,
          modelName: config.modelName,
          temperature: config.temperature,
        };

    const updatedConfig = await this.prismaService.config.update({
      where: { id: userId },
      data: {
        ...updates,
      },
      select: {
        maxTokens: true,
        modelName: true,
        openAIApiKey: true,
        temperature: true,
      },
    });

    await this.modelInitService.initModel(updatedConfig, userId);

    return updatedConfig;
  }
}
