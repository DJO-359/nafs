import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { IntentionController } from './intention.controller';
import { IntentionService } from './intention.service';
import { Intention } from './models/intention.model';

@Module({
  imports: [SequelizeModule.forFeature([Intention])],
  controllers: [IntentionController],
  providers: [IntentionService],
  exports: [IntentionService],
})
export class IntentionModule {}
