import { Test, TestingModule } from '@nestjs/testing';
import { OpenaiConfigService } from './openai-config.service';

describe('OpenaiConfigService', () => {
  let service: OpenaiConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenaiConfigService],
    }).compile();

    service = module.get<OpenaiConfigService>(OpenaiConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
