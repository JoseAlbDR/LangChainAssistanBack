import { Test, TestingModule } from '@nestjs/testing';
import { OpenaiConfigController } from './openai-config.controller';
import { OpenaiConfigService } from './openai-config.service';

describe('OpenaiConfigController', () => {
  let controller: OpenaiConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenaiConfigController],
      providers: [OpenaiConfigService],
    }).compile();

    controller = module.get<OpenaiConfigController>(OpenaiConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
