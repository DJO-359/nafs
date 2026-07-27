import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './models/category.model';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private readonly categoryModel: typeof Category,
  ) {}

  async create(userId: string, dto: CreateCategoryDto) {
    return this.categoryModel.create({
      userId,
      ...dto,
    });
  }

  async findAll(userId: string) {
    return this.categoryModel.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'ASC']],
    });
  }
}
