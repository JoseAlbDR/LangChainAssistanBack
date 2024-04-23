import { Controller, Get, Post, Body, Put } from '@nestjs/common';
import { OpenaiConfigService } from './openai-config.service';
import { CreateOpenaiConfigDto } from './dto/create-openai-config.dto';
import { UpdateOpenaiConfigDto } from './dto/update-openai-config.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from '@prisma/client';
// import { UpdateOpenaiConfigDto } from './dto/update-openai-config.dto';

@Controller('openai-config')
export class OpenaiConfigController {
  constructor(private readonly openaiConfigService: OpenaiConfigService) {}

  @Auth()
  @Post('')
  async createConfig(
    @Body() chatConfig: CreateOpenaiConfigDto,
    @GetUser('id') user: User,
  ) {
    await this.openaiConfigService.saveConfig(chatConfig, user.id);

    return 'Config saved successfully';
  }

  @Auth()
  @Get('')
  async getConfig(@GetUser('id') user: User) {
    const config = await this.openaiConfigService.getConfig(user.id);

    const isKeyPresent = config?.openAIApiKey ? true : false;

    delete config?.openAIApiKey;

    return { config, isKeyPresent };
  }

  @Auth()
  @Put('')
  async updateConfig(
    @Body() config: UpdateOpenaiConfigDto,
    @GetUser('id') user: User,
  ) {
    if (!config) return 'Nothing to update';
    await this.openaiConfigService.updateConfig(config, user.id);

    return 'Config updated successfully';
  }
}
