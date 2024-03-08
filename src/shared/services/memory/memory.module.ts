import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { OpenaiConfigService } from 'src/openai-config/openai-config.service';
import { SharedModule } from '../shared.module';

@Module({
  imports: [SharedModule],
  providers: [PrismaService, OpenaiConfigService],
})
export class MemoryModule {}
