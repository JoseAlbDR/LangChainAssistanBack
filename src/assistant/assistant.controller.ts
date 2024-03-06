import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { Response } from 'express';
import { AssistantQuestionDto } from './dtos/assistant-question.dto';
import { ChainValues } from '@langchain/core/utils/types';
import { Readable } from 'stream';

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
    @Body() userQuestionDto: AssistantQuestionDto,
    @Res() res: Response,
  ) {
    const { question, document } = userQuestionDto;

    const response = await this.assistantService.getAssistantAnswer(
      document,
      question,
    );

    return this.returnStream(res, response);
  }

  @Get('chat-history/:document')
  async getChatHistory(@Param('document') document: string) {
    const memory = this.assistantService.getChatHistory(document);

    return memory;
  }
}
