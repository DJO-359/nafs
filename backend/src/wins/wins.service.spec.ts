import { Test, TestingModule } from '@nestjs/testing';
import { WinsService } from './wins.service';

describe('WinsService', () => {
  let service: WinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WinsService],
    }).compile();

    service = module.get<WinsService>(WinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
