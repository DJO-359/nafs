import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WinsController } from './wins.controller';
import { WinsService } from './wins.service';
import { Win } from './models/win.model';
import { Category } from '../categories/models/category.model';

@Module({
  imports: [SequelizeModule.forFeature([Win, Category])],
  controllers: [WinsController],
  providers: [WinsService],
  exports: [WinsService],
})
export class WinsModule {}
