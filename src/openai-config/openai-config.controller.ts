import { Controller, Get, Post, Body, Put } from '@nestjs/common';
import { OpenaiConfigService } from './openai-config.service';
import { CreateOpenaiConfigDto } from './dto/create-openai-config.dto';
import { UpdateOpenaiConfigDto } from './dto/update-openai-config.dto';
// import { UpdateOpenaiConfigDto } from './dto/update-openai-config.dto';

@Controller('openai-config')
export class OpenaiConfigController {
  constructor(private readonly openaiConfigService: OpenaiConfigService) {}

  @Post('')
  async createConfig(@Body() chatConfig: CreateOpenaiConfigDto) {
    await this.openaiConfigService.saveConfig(chatConfig);

    return 'Config saved successfully';
  }

  @Get('')
  async getConfig() {
    const config = await this.openaiConfigService.getConfig();

    return config;
  }

  @Put('')
  async updateConfig(@Body() config: UpdateOpenaiConfigDto) {
    if (!config) return 'Nothing to update';
    await this.openaiConfigService.updateConfig(config);

    return 'Config updated successfully';
  }
}
