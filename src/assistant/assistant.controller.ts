import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { Response } from 'express';
import { AssistantQuestionDto } from './dtos/assistant-question.dto';
import { ChainValues } from '@langchain/core/utils/types';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  private async getStream(
    res: Response,
    stream: IterableReadableStream<ChainValues>,
  ) {
    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      if (chunk && chunk.output) res.write(chunk.output);
    }

    res.end();
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
    );

    return this.getStream(res, stream);
  }
}
