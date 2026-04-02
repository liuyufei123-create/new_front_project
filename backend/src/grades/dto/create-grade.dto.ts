import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateGradeDto {
  @Type(() => Number)
  @IsInt()
  studentId!: number;

  @Type(() => Number)
  @IsInt()
  courseId!: number;

  @IsString()
  semester!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  usualScore!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  examScore!: number;
}
