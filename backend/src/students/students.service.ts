import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StudentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryStudentsDto) {
    const { page = 1, pageSize = 10, keyword, classId, status } = query;
    const where: Prisma.StudentWhereInput = {
      ...(classId ? { classId } : {}),
      ...(status ? { status } : {}),
      ...(keyword
        ? {
            OR: [
              { studentNo: { contains: keyword } },
              { name: { contains: keyword } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        include: {
          class: {
            select: { id: true, name: true, gradeYear: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.student.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        grades: {
          include: {
            course: {
              select: { id: true, name: true, code: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found.');
    }

    return student;
  }

  async create(dto: CreateStudentDto) {
    try {
      return await this.prisma.student.create({
        data: {
          ...dto,
          status: dto.status ?? StudentStatus.ACTIVE,
        },
        include: {
          class: {
            select: { id: true, name: true, gradeYear: true },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Student number already exists.');
      }

      throw error;
    }
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.ensureExists(id);
    try {
      return await this.prisma.student.update({
        where: { id },
        data: dto,
        include: {
          class: {
            select: { id: true, name: true, gradeYear: true },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Student number already exists.');
      }

      throw error;
    }
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.student.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new NotFoundException('Student not found.');
    }
  }
}
