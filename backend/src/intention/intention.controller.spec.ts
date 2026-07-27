import { Test, TestingModule } from '@nestjs/testing';
import { IntentionController } from './intention.controller';
import { IntentionService } from './intention.service';

describe('IntentionController', () => {
  let controller: IntentionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntentionController],
      providers: [IntentionService],
    }).compile();

    controller = module.get<IntentionController>(IntentionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
