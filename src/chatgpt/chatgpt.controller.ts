import { Controller, Post, Body, Res, HttpStatus, Get } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { Response } from 'express';
import { ChatGptQuestionDto } from './dtos/chatgpt-question.dto';
import { ChainValues } from '@langchain/core/utils/types';
import { Readable } from 'stream';

@Controller('chatgpt')
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
    @Res() res: Response,
  ) {
    const { question } = userQuestionDto;

    const stream = await this.chatgptService.getChatgptAnswer(question);

    return this.returnStream(res, stream);
  }

  @Get('chat-history/')
  async getChatHistory() {
    const memory = this.chatgptService.getChatHistory('chatgptbot');

    return memory;
  }
}
