import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import { Win } from './models/win.model';
import { CreateWinDto } from './dto/create-win.dto';
import { Category } from '../categories/models/category.model';

@Injectable()
export class WinsService {
  constructor(
    @InjectModel(Win)
    private readonly winModel: typeof Win,
  ) {}

  async create(userId: string, dto: CreateWinDto) {
    return this.winModel.create({
      userId,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description ?? null,
    });
  }

  async findAll(userId: string) {
    return this.winModel.findAll({
      where: {
        userId,
      },

      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'icon', 'color'],
        },
      ],

      order: [['createdAt', 'DESC']],
    });
  }

  async update(userId: string, id: string, dto: CreateWinDto) {
    const win = await this.winModel.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!win) {
      throw new NotFoundException('Win not found');
    }

    return win.update({
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description ?? null,
    });
  }

  async remove(userId: string, id: string) {
    const win = await this.winModel.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!win) {
      throw new NotFoundException('Win not found');
    }

    await win.destroy();

    return {
      message: 'Win deleted',
    };
  }
}
