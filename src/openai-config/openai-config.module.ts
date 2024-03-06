import { Module } from '@nestjs/common';
import { OpenaiConfigService } from './openai-config.service';
import { OpenaiConfigController } from './openai-config.controller';
import { PrismaService } from 'src/shared/services/prisma/prisma.service';

@Module({
  controllers: [OpenaiConfigController],
  providers: [OpenaiConfigService, PrismaService],
})
export class OpenaiConfigModule {}
