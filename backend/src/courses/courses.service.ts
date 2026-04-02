import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { QueryCoursesDto } from './dto/query-courses.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryCoursesDto) {
    const { page = 1, pageSize = 10, keyword, teacherId } = query;
    const where: Prisma.CourseWhereInput = {
      ...(teacherId ? { teacherId } : {}),
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword } },
              { code: { contains: keyword } },
              { description: { contains: keyword } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        include: {
          teacher: {
            select: { id: true, name: true, username: true },
          },
          _count: {
            select: { grades: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.course.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const item = await this.prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { id: true, name: true, username: true },
        },
        grades: {
          include: {
            student: {
              select: { id: true, studentNo: true, name: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Course not found.');
    }

    return item;
  }

  async create(dto: CreateCourseDto) {
    try {
      return await this.prisma.course.create({
        data: dto,
        include: {
          teacher: {
            select: { id: true, name: true, username: true },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Course code already exists.');
      }

      throw error;
    }
  }

  async update(id: number, dto: UpdateCourseDto) {
    await this.ensureExists(id);
    try {
      return await this.prisma.course.update({
        where: { id },
        data: dto,
        include: {
          teacher: {
            select: { id: true, name: true, username: true },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Course code already exists.');
      }

      throw error;
    }
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.course.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const item = await this.prisma.course.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Course not found.');
    }
  }
}
