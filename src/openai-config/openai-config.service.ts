import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOpenaiConfigDto } from './dto/create-openai-config.dto';
// import { UpdateOpenaiConfigDto } from './dto/update-openai-config.dto';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { UpdateOpenaiConfigDto } from './dto/update-openai-config.dto';
import { ModelInitService } from 'src/shared/services/model-init/model-init.service';

@Injectable()
export class OpenaiConfigService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly modelInitService: ModelInitService,
  ) {}

  async saveConfig(createOpenaiConfigDto: CreateOpenaiConfigDto) {
    try {
      const config = await this.prismaService.config.create({
        data: {
          id: 'chatgptconfig',
          openAIApiKey:
            createOpenaiConfigDto.openAIApiKey || process.env.OPENAI_API_KEY,
          ...createOpenaiConfigDto,
        },
        select: {
          maxTokens: true,
          modelName: true,
          openAIApiKey: true,
          temperature: true,
        },
      });

      await this.modelInitService.initModel(config);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'There was an error creating chat config, check server logs',
      );
    }
  }

  async getConfig() {
    try {
      const config = await this.prismaService.config.findUnique({
        where: {
          id: 'chatgptconfig',
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

  async updateConfig(config: UpdateOpenaiConfigDto) {
    const updatedConfig = await this.prismaService.config.update({
      where: { id: 'chatgptconfig' },
      data: config,
      select: {
        maxTokens: true,
        modelName: true,
        openAIApiKey: true,
        temperature: true,
      },
    });

    await this.modelInitService.initModel(updatedConfig);

    return updatedConfig;
  }
}
