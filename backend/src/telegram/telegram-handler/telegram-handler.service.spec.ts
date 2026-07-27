import { Test, TestingModule } from '@nestjs/testing';
import { TelegramHandlerService } from './telegram-handler.service';

describe('TelegramHandlerService', () => {
  let service: TelegramHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramHandlerService],
    }).compile();

    service = module.get<TelegramHandlerService>(TelegramHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
