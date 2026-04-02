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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClassesService = class ClassesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page = 1, pageSize = 10, keyword, gradeYear } = query;
        const where = {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Class not found.');
        }
        return item;
    }
    async create(dto) {
        return this.prisma.class.create({
            data: dto,
            include: {
                headTeacher: {
                    select: { id: true, name: true, username: true },
                },
            },
        });
    }
    async update(id, dto) {
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
    async remove(id) {
        await this.ensureExists(id);
        return this.prisma.class.delete({ where: { id } });
    }
    async ensureExists(id) {
        const item = await this.prisma.class.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('Class not found.');
        }
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map