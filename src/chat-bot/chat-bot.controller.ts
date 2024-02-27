import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ChatBotService } from './chat-bot.service';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { Response } from 'express';
import { UserQuestionDto } from './dto/user-question.dto';

@Controller('chat-bot')
export class ChatBotController {
  private readonly convHistory: string[] = [];
  constructor(private readonly chatBotService: ChatBotService) {}

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
    @Body('question') userQuestionDto: UserQuestionDto,
    @Res() res: Response,
  ) {
    const { question } = userQuestionDto;

    const stream = await this.chatBotService.getChatBotAnswer(
      question,
      this.convHistory,
    );

    this.getStream(res, stream);
  }

  @Post('feed-document')
  async feedDocument(@Body('path') path: string) {
    console.log(path);
  }
}
