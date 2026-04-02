import { PrismaClient, Role, UserStatus, Gender, StudentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.grade.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashTeacher = await bcrypt.hash('teacher123', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      name: '系统管理员',
      passwordHash: passwordHashAdmin,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const teacherZhang = await prisma.user.create({
    data: {
      username: 'zhangsan',
      name: '张三老师',
      passwordHash: passwordHashTeacher,
      role: Role.TEACHER,
      status: UserStatus.ACTIVE,
    },
  });

  const teacherLi = await prisma.user.create({
    data: {
      username: 'lisi',
      name: '李四老师',
      passwordHash: passwordHashTeacher,
      role: Role.TEACHER,
      status: UserStatus.ACTIVE,
    },
  });

  const classOne = await prisma.class.create({
    data: {
      name: '软件工程 2023-1 班',
      gradeYear: 2023,
      description: '软件工程专业核心班级',
      headTeacherId: teacherZhang.id,
    },
  });

  const classTwo = await prisma.class.create({
    data: {
      name: '计算机科学 2023-2 班',
      gradeYear: 2023,
      description: '计算机科学专业实验班',
      headTeacherId: teacherLi.id,
    },
  });

  const courseMath = await prisma.course.create({
    data: {
      name: '高等数学',
      code: 'MATH101',
      credit: 4,
      description: '基础数学课程',
      teacherId: teacherZhang.id,
    },
  });

  const courseDatabase = await prisma.course.create({
    data: {
      name: '数据库原理',
      code: 'DB201',
      credit: 3,
      description: '数据库设计与实践',
      teacherId: teacherLi.id,
    },
  });

  const courseFrontend = await prisma.course.create({
    data: {
      name: '前端开发基础',
      code: 'WEB202',
      credit: 2,
      description: 'Web 界面开发入门',
      teacherId: teacherZhang.id,
    },
  });

  const students = await Promise.all([
    prisma.student.create({
      data: {
        studentNo: '2023001',
        name: '王小明',
        gender: Gender.MALE,
        classId: classOne.id,
        phone: '13800000001',
        email: 'wangxiaoming@example.com',
        enrollYear: 2023,
        status: StudentStatus.ACTIVE,
        remark: '班级学习委员',
      },
    }),
    prisma.student.create({
      data: {
        studentNo: '2023002',
        name: '李小红',
        gender: Gender.FEMALE,
        classId: classOne.id,
        phone: '13800000002',
        email: 'lixiaohong@example.com',
        enrollYear: 2023,
        status: StudentStatus.ACTIVE,
      },
    }),
    prisma.student.create({
      data: {
        studentNo: '2023003',
        name: '赵一帆',
        gender: Gender.MALE,
        classId: classTwo.id,
        phone: '13800000003',
        email: 'zhaoyifan@example.com',
        enrollYear: 2023,
        status: StudentStatus.ACTIVE,
      },
    }),
    prisma.student.create({
      data: {
        studentNo: '2023004',
        name: '陈思雨',
        gender: Gender.FEMALE,
        classId: classTwo.id,
        phone: '13800000004',
        email: 'chensiyu@example.com',
        enrollYear: 2023,
        status: StudentStatus.ACTIVE,
      },
    }),
  ]);

  const calcTotal = (usualScore: number, examScore: number) =>
    Math.round((usualScore * 0.4 + examScore * 0.6) * 100) / 100;

  await prisma.grade.createMany({
    data: [
      {
        studentId: students[0].id,
        courseId: courseMath.id,
        semester: '2025-2026-1',
        usualScore: 88,
        examScore: 90,
        totalScore: calcTotal(88, 90),
      },
      {
        studentId: students[1].id,
        courseId: courseMath.id,
        semester: '2025-2026-1',
        usualScore: 82,
        examScore: 85,
        totalScore: calcTotal(82, 85),
      },
      {
        studentId: students[2].id,
        courseId: courseDatabase.id,
        semester: '2025-2026-1',
        usualScore: 76,
        examScore: 80,
        totalScore: calcTotal(76, 80),
      },
      {
        studentId: students[3].id,
        courseId: courseDatabase.id,
        semester: '2025-2026-1',
        usualScore: 91,
        examScore: 94,
        totalScore: calcTotal(91, 94),
      },
      {
        studentId: students[0].id,
        courseId: courseFrontend.id,
        semester: '2025-2026-1',
        usualScore: 86,
        examScore: 89,
        totalScore: calcTotal(86, 89),
      },
    ],
  });

  console.log(`Seed complete. Admin ID: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
