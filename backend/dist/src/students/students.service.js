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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let StudentsService = class StudentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page = 1, pageSize = 10, keyword, classId, status } = query;
        const where = {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Student not found.');
        }
        return student;
    }
    async create(dto) {
        try {
            return await this.prisma.student.create({
                data: {
                    ...dto,
                    status: dto.status ?? client_1.StudentStatus.ACTIVE,
                },
                include: {
                    class: {
                        select: { id: true, name: true, gradeYear: true },
                    },
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Student number already exists.');
            }
            throw error;
        }
    }
    async update(id, dto) {
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Student number already exists.');
            }
            throw error;
        }
    }
    async remove(id) {
        await this.ensureExists(id);
        return this.prisma.student.delete({ where: { id } });
    }
    async ensureExists(id) {
        const student = await this.prisma.student.findUnique({ where: { id } });
        if (!student) {
            throw new common_1.NotFoundException('Student not found.');
        }
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map