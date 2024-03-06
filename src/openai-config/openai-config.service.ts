import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOpenaiConfigDto } from './dto/create-openai-config.dto';
// import { UpdateOpenaiConfigDto } from './dto/update-openai-config.dto';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';
import { UpdateOpenaiConfigDto } from './dto/update-openai-config.dto';

@Injectable()
export class OpenaiConfigService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveConfig(createOpenaiConfigDto: CreateOpenaiConfigDto) {
    try {
      await this.prismaService.chatConfig.create({
        data: {
          id: 'chatgptconfig',
          openAIApiKey:
            createOpenaiConfigDto.openAIApiKey || process.env.OPENAI_API_KEY,
          ...createOpenaiConfigDto,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'There was an error creating chat config, check server logs',
      );
    }
  }

  async getConfig() {
    try {
      const config = await this.prismaService.chatConfig.findUnique({
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
    await this.prismaService.chatConfig.update({
      where: { id: 'chatgptconfig' },
      data: config,
    });
  }
}
