import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { AuthUser } from '../auth/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { QueryGradesDto } from './dto/query-grades.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryGradesDto, user: AuthUser) {
    const { page = 1, pageSize = 10, keyword, studentId, courseId, semester } =
      query;
    const where: Prisma.GradeWhereInput = {
      ...(studentId ? { studentId } : {}),
      ...(courseId ? { courseId } : {}),
      ...(semester ? { semester } : {}),
      ...(keyword
        ? {
            OR: [
              { student: { name: { contains: keyword } } },
              { student: { studentNo: { contains: keyword } } },
              { course: { name: { contains: keyword } } },
              { course: { code: { contains: keyword } } },
            ],
          }
        : {}),
      ...(user.role === Role.TEACHER
        ? { course: { teacherId: user.userId } }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.grade.findMany({
        where,
        include: {
          student: {
            select: { id: true, studentNo: true, name: true },
          },
          course: {
            select: { id: true, name: true, code: true, teacherId: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.grade.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async create(dto: CreateGradeDto, user: AuthUser) {
    await this.assertCoursePermission(dto.courseId, user);

    try {
      return await this.prisma.grade.create({
        data: {
          ...dto,
          totalScore: this.calculateTotalScore(dto.usualScore, dto.examScore),
        },
        include: {
          student: {
            select: { id: true, studentNo: true, name: true },
          },
          course: {
            select: { id: true, name: true, code: true, teacherId: true },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A grade already exists for this student, course, and semester.',
        );
      }

      throw error;
    }
  }

  async update(id: number, dto: UpdateGradeDto, user: AuthUser) {
    const grade = await this.ensureExists(id);
    await this.assertCoursePermission(dto.courseId ?? grade.courseId, user);

    try {
      const usualScore = dto.usualScore ?? grade.usualScore;
      const examScore = dto.examScore ?? grade.examScore;

      return await this.prisma.grade.update({
        where: { id },
        data: {
          ...dto,
          totalScore: this.calculateTotalScore(usualScore, examScore),
        },
        include: {
          student: {
            select: { id: true, studentNo: true, name: true },
          },
          course: {
            select: { id: true, name: true, code: true, teacherId: true },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A grade already exists for this student, course, and semester.',
        );
      }

      throw error;
    }
  }

  async remove(id: number, user: AuthUser) {
    const grade = await this.ensureExists(id);
    await this.assertCoursePermission(grade.courseId, user);
    return this.prisma.grade.delete({ where: { id } });
  }

  private calculateTotalScore(usualScore: number, examScore: number) {
    return Math.round((usualScore * 0.4 + examScore * 0.6) * 100) / 100;
  }

  private async assertCoursePermission(courseId: number, user: AuthUser) {
    if (user.role === Role.ADMIN) {
      return;
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    if (course.teacherId !== user.userId) {
      throw new ForbiddenException(
        'Teachers can only manage grades for their assigned courses.',
      );
    }
  }

  private async ensureExists(id: number) {
    const grade = await this.prisma.grade.findUnique({ where: { id } });
    if (!grade) {
      throw new NotFoundException('Grade not found.');
    }

    return grade;
  }
}
