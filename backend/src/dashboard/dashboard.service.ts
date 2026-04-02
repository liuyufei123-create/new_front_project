import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [studentCount, classCount, courseCount, gradeCount] =
      await this.prisma.$transaction([
        this.prisma.student.count(),
        this.prisma.class.count(),
        this.prisma.course.count(),
        this.prisma.grade.count(),
      ]);

    return {
      studentCount,
      classCount,
      courseCount,
      gradeCount,
    };
  }

  async getClassDistribution() {
    const items = await this.prisma.class.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return items.map((item) => ({
      classId: item.id,
      className: item.name,
      studentCount: item._count.students,
    }));
  }

  async getCourseAverage() {
    const averages = await this.prisma.grade.groupBy({
      by: ['courseId'],
      _avg: { totalScore: true },
      orderBy: { courseId: 'asc' },
    });
    const courseIds = averages.map((item) => item.courseId);
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, name: true, code: true },
    });
    const courseMap = new Map(courses.map((course) => [course.id, course]));

    return averages.map((item) => ({
      courseId: item.courseId,
      courseName: courseMap.get(item.courseId)?.name ?? 'Unknown',
      courseCode: courseMap.get(item.courseId)?.code ?? '',
      averageScore: Math.round((item._avg.totalScore ?? 0) * 100) / 100,
    }));
  }

  async getPassRate() {
    const grades = await this.prisma.grade.findMany({
      select: {
        totalScore: true,
        courseId: true,
        course: {
          select: { name: true, code: true },
        },
      },
    });

    const groups = new Map<
      number,
      { courseName: string; courseCode: string; total: number; passed: number }
    >();

    for (const grade of grades) {
      const current = groups.get(grade.courseId) ?? {
        courseName: grade.course.name,
        courseCode: grade.course.code,
        total: 0,
        passed: 0,
      };
      current.total += 1;
      if (grade.totalScore >= 60) {
        current.passed += 1;
      }
      groups.set(grade.courseId, current);
    }

    return Array.from(groups.entries()).map(([courseId, item]) => ({
      courseId,
      courseName: item.courseName,
      courseCode: item.courseCode,
      passRate:
        item.total === 0 ? 0 : Math.round((item.passed / item.total) * 10000) / 100,
    }));
  }
}
