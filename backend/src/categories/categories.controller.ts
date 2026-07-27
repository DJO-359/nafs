import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';

import type { AuthRequest } from '../auth/types/auth-request';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: AuthRequest, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: AuthRequest) {
    return this.categoriesService.findAll(req.user.id);
  }
}
