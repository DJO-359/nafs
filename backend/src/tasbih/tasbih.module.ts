import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { TasbihCounter } from './models/tasbih-counter.model';
import { TasbihService } from './tasbih.service';
import { TasbihController } from './tasbih.controller';
import { User } from '../users/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([TasbihCounter, User])],
  controllers: [TasbihController],
  providers: [TasbihService],
  exports: [TasbihService],
})
export class TasbihModule {}
