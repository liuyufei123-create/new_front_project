import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryClassesDto) {
    const { page = 1, pageSize = 10, keyword, gradeYear } = query;
    const where: Prisma.ClassWhereInput = {
      ...(gradeYear ? { gradeYear } : {}),
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword } },
              { description: { contains: keyword } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.class.findMany({
        where,
        include: {
          headTeacher: {
            select: { id: true, name: true, username: true },
          },
          _count: {
            select: { students: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.class.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const item = await this.prisma.class.findUnique({
      where: { id },
      include: {
        headTeacher: {
          select: { id: true, name: true, username: true },
        },
        students: {
          select: {
            id: true,
            studentNo: true,
            name: true,
            gender: true,
            status: true,
          },
          orderBy: { studentNo: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Class not found.');
    }

    return item;
  }

  async create(dto: CreateClassDto) {
    return this.prisma.class.create({
      data: dto,
      include: {
        headTeacher: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  async update(id: number, dto: UpdateClassDto) {
    await this.ensureExists(id);
    return this.prisma.class.update({
      where: { id },
      data: dto,
      include: {
        headTeacher: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.class.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const item = await this.prisma.class.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Class not found.');
    }
  }
}
