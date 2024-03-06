import { Test, TestingModule } from '@nestjs/testing';
import { ModelInitService } from './model-init.service';

describe('ModelInitService', () => {
  let service: ModelInitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModelInitService],
    }).compile();

    service = module.get<ModelInitService>(ModelInitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
