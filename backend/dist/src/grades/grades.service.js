"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let GradesService = class GradesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query, user) {
        const { page = 1, pageSize = 10, keyword, studentId, courseId, semester } = query;
        const where = {
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
            ...(user.role === client_1.Role.TEACHER
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
    async create(dto, user) {
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('A grade already exists for this student, course, and semester.');
            }
            throw error;
        }
    }
    async update(id, dto, user) {
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('A grade already exists for this student, course, and semester.');
            }
            throw error;
        }
    }
    async remove(id, user) {
        const grade = await this.ensureExists(id);
        await this.assertCoursePermission(grade.courseId, user);
        return this.prisma.grade.delete({ where: { id } });
    }
    calculateTotalScore(usualScore, examScore) {
        return Math.round((usualScore * 0.4 + examScore * 0.6) * 100) / 100;
    }
    async assertCoursePermission(courseId, user) {
        if (user.role === client_1.Role.ADMIN) {
            return;
        }
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: { teacherId: true },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found.');
        }
        if (course.teacherId !== user.userId) {
            throw new common_1.ForbiddenException('Teachers can only manage grades for their assigned courses.');
        }
    }
    async ensureExists(id) {
        const grade = await this.prisma.grade.findUnique({ where: { id } });
        if (!grade) {
            throw new common_1.NotFoundException('Grade not found.');
        }
        return grade;
    }
};
exports.GradesService = GradesService;
exports.GradesService = GradesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GradesService);
//# sourceMappingURL=grades.service.js.map