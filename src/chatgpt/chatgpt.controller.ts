import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Get,
  Delete,
} from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { Response } from 'express';
import { ChatGptQuestionDto } from './dtos/chatgpt-question.dto';
import { ChainValues } from '@langchain/core/utils/types';
import { Readable } from 'stream';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from '@prisma/client';

@Controller('chatgpt')
@Auth()
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  private async getStream(
    res: Response,
    stream: IterableReadableStream<ChainValues>,
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      console.log({ chunk });
      res.write(chunk.response);
    }

    res.end();
  }

  private async returnStream(res: Response, response: string) {
    function* chunkText(text: string, chunkSize: number) {
      for (let i = 0; i < text.length; i += chunkSize) {
        yield text.slice(i, i + chunkSize);
      }
    }

    const chunkSize = 10;
    const chunkGenerator = chunkText(response, chunkSize);

    const readable = Readable.from(chunkGenerator);

    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await (const chunk of readable) {
      res.write(chunk);
      await new Promise((resolve) => setTimeout(resolve, 50)); // Esperar un breve período antes de enviar el siguiente chunk
    }

    res.end();
  }

  @Post('user-question')
  async userQuestion(
    @Body() userQuestionDto: ChatGptQuestionDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    const { question } = userQuestionDto;

    console.log(user);

    const stream = await this.chatgptService.getChatgptAnswer(question, user);

    return this.returnStream(res, stream);
  }

  @Get('chat-history')
  async getChatHistory(@GetUser() user: User) {
    console.log('Chat history');

    const memory = await this.chatgptService.getChatHistory('chatgptbot', user);

    return memory || { history: { messages: null } };
  }

  @Delete('chat-history')
  async deleteChatHistory(@GetUser() user: User) {
    await this.chatgptService.deleteMemory(user);

    return { message: 'Historial de chat borrado.' };
  }
}
