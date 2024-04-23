import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { OpenaiConfigService } from 'src/openai-config/openai-config.service';
import { SharedModule } from '../shared.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  providers: [PrismaService, OpenaiConfigService],
})
export class VectorStoreModule {}
