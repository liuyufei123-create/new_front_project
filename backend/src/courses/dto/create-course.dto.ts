import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  credit!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
