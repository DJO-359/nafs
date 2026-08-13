import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { TasbihCounter } from './models/tasbih-counter.model';
import { TasbihService } from './tasbih.service';
import { TasbihController } from './tasbih.controller';

@Module({
  imports: [SequelizeModule.forFeature([TasbihCounter])],
  controllers: [TasbihController],
  providers: [TasbihService],
  exports: [TasbihService],
})
export class TasbihModule {}
