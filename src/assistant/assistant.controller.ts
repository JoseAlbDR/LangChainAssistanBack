import {
  Body,
  Controller,
  Delete,
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
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from '@prisma/client';

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

  @Auth()
  @Post('user-question')
  async userQuestion(
    @Body() userQuestionDto: AssistantQuestionDto,
    @GetUser('id') user: User,
    @Res() res: Response,
  ) {
    const { question, document } = userQuestionDto;

    const response = await this.assistantService.getAssistantAnswer(
      document,
      question,
      user.id,
    );

    return this.returnStream(res, response);
  }

  @Get('chat-history/:document')
  async getChatHistory(@Param('document') document: string) {
    const memory = await this.assistantService.getChatHistory(document);

    return memory || [];
  }

  @Delete('chat-history/:document')
  async deleteChatHistory(@Param('document') document: string) {
    await this.assistantService.deleteMemory(document);

    return { message: `Historial del chat ${document} borrado.` };
  }
}
