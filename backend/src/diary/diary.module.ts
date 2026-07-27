import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { DiaryEntry } from './models/diary-entry.model';

@Module({
  imports: [SequelizeModule.forFeature([DiaryEntry])],

  controllers: [DiaryController],

  providers: [DiaryService],

  exports: [DiaryService],
})
export class DiaryModule {}
