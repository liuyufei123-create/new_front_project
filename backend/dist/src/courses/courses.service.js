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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let CoursesService = class CoursesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page = 1, pageSize = 10, keyword, teacherId } = query;
        const where = {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Course not found.');
        }
        return item;
    }
    async create(dto) {
        try {
            return await this.prisma.course.create({
                data: dto,
                include: {
                    teacher: {
                        select: { id: true, name: true, username: true },
                    },
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Course code already exists.');
            }
            throw error;
        }
    }
    async update(id, dto) {
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('Course code already exists.');
            }
            throw error;
        }
    }
    async remove(id) {
        await this.ensureExists(id);
        return this.prisma.course.delete({ where: { id } });
    }
    async ensureExists(id) {
        const item = await this.prisma.course.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('Course not found.');
        }
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map