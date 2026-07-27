import { PartialType } from '@nestjs/mapped-types';
import { CreateWinDto } from './create-win.dto';

export class UpdateWinDto extends PartialType(CreateWinDto) {}
