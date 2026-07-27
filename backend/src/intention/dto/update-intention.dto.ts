import { PartialType } from '@nestjs/mapped-types';
import { CreateIntentionDto } from './create-intention.dto';

export class UpdateIntentionDto extends PartialType(CreateIntentionDto) {}
