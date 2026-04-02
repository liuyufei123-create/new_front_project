import { Type } from 'class-transformer';
import { Gender, StudentStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  studentNo!: string;

  @IsString()
  name!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @Type(() => Number)
  @IsInt()
  classId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  enrollYear!: number;

  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @IsOptional()
  @IsString()
  remark?: string;
}
