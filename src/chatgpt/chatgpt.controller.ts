import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { Response } from 'express';
import { ChatGptQuestionDto } from './dtos/chatgpt-question.dto';

@Controller('chatgpt')
export class ChatgptController {
  private readonly convHistory: string[] = [];
  constructor(private readonly chatgptService: ChatgptService) {}

  private async getStream(
    res: Response,
    stream: IterableReadableStream<string>,
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    let answer = '';
    for await (const chunk of stream) {
      answer += chunk;
      res.write(chunk);
    }
    this.convHistory.push(answer);

    res.end();
  }

  @Post('user-question')
  async userQuestion(
    @Body() userQuestionDto: ChatGptQuestionDto,
    @Res() res: Response,
  ) {
    const { question } = userQuestionDto;

    const stream = await this.chatgptService.getChatgptAnswer(question);

    return this.getStream(res, stream);
  }
}
