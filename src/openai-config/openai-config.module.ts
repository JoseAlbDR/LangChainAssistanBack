import { Module } from '@nestjs/common';
import { OpenaiConfigService } from './openai-config.service';
import { OpenaiConfigController } from './openai-config.controller';
import { SharedModule } from 'src/shared/services/shared.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [SharedModule, AuthModule],
  controllers: [OpenaiConfigController],
  providers: [OpenaiConfigService],
})
export class OpenaiConfigModule {}
