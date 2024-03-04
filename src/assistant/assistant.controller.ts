import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { Response } from 'express';
import { AssistantQuestionDto } from './dtos/assistant-question.dto';

@Controller('assistant')
export class AssistantController {
  private readonly convHistory: string[] = [];
  constructor(private readonly assistantService: AssistantService) {}

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

  @Get('documents')
  async getDocuments() {
    return this.assistantService.getDocuments();
  }

  @Post('user-question')
  async userQuestion(
    @Body() userQuestionDto: AssistantQuestionDto,
    @Res() res: Response,
  ) {
    const { question, document } = userQuestionDto;

    const stream = await this.assistantService.getAssistantAnswer(
      document,
      question,
      this.convHistory,
    );

    return this.getStream(res, stream);
  }
}
