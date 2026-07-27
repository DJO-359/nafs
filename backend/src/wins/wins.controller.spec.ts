import { Test, TestingModule } from '@nestjs/testing';
import { WinsController } from './wins.controller';
import { WinsService } from './wins.service';

describe('WinsController', () => {
  let controller: WinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WinsController],
      providers: [WinsService],
    }).compile();

    controller = module.get<WinsController>(WinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
