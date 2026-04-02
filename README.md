# 学生管理系统

基于 `Vue 3 + Vite + Element Plus + Pinia + Vue Router` 前端，以及 `NestJS + Prisma + MySQL` 后端实现的学生管理系统课程项目。

## 项目结构

- `frontend`：后台管理前端，默认运行在 `http://localhost:5173`
- `backend`：NestJS API 服务，默认运行在 `http://localhost:3000`

## 功能模块

- 登录认证：JWT 登录，管理员和教师双角色
- 统计看板：学生数、班级数、课程数、成绩录入数、班级分布、课程平均分、及格率
- 学生管理：列表、筛选、分页、新增、编辑、详情、删除
- 班级管理：列表、筛选、新增、编辑、删除、查看班级学生
- 课程管理：列表、筛选、新增、编辑、删除、分配任课教师
- 成绩管理：按学生/课程/学期筛选，录入、编辑、删除，自动计算总评
- 用户管理：管理员可创建教师账号、停用账号、重置密码

## 本地启动

### 1. 配置数据库

确保本机已经安装 MySQL，并先创建数据库：

```sql
CREATE DATABASE student_management_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

后端默认数据库连接在 [backend/.env](/G:/NewProject/new_front_project/backend/.env)：

```env
DATABASE_URL="mysql://root:123456@localhost:3306/student_management_system"
JWT_SECRET="student-management-secret"
PORT=3000
```

如果你的 MySQL 用户名或密码不同，修改这一文件即可。

### 2. 初始化后端

在 [backend](/G:/NewProject/new_front_project/backend) 目录执行：

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run start:dev
```

### 3. 启动前端

在 [frontend](/G:/NewProject/new_front_project/frontend) 目录执行：

```bash
npm install
npm run dev
```

## 演示账号

- 管理员：`admin / admin123`
- 教师：`zhangsan / teacher123`
- 教师：`lisi / teacher123`

## 已完成验证

- 前端 `npm run build` 通过
- 后端 `npx prisma generate` 通过
- 后端 `npm run build` 通过

说明：由于当前环境没有实际连接你的本地 MySQL，我没有在这里直接执行迁移和种子写库；按上面的步骤在你的机器上执行即可。
