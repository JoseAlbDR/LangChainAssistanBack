import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { CreateChatgptDto } from './dto/user-question.dto';
import { UpdateChatgptDto } from './dto/update-chatgpt.dto';

@Controller('chatgpt')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  @Post()
  create(@Body() createChatgptDto: CreateChatgptDto) {
    return this.chatgptService.create(createChatgptDto);
  }

  @Get()
  findAll() {
    return this.chatgptService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatgptService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatgptDto: UpdateChatgptDto) {
    return this.chatgptService.update(+id, updateChatgptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatgptService.remove(+id);
  }
}
