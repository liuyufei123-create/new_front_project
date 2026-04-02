import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  gradeYear!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  headTeacherId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
