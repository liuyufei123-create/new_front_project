export type Role = 'ADMIN' | 'TEACHER'
export type UserStatus = 'ACTIVE' | 'DISABLED'
export type Gender = 'MALE' | 'FEMALE'
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED'

export interface AuthUser {
  id: number
  username: string
  name: string
  role: Role
  status: UserStatus
}

export interface ApiListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface UserItem extends AuthUser {
  createdAt: string
  updatedAt: string
}

export interface ClassItem {
  id: number
  name: string
  gradeYear: number
  description?: string | null
  headTeacherId?: number | null
  headTeacher?: Pick<UserItem, 'id' | 'name' | 'username'> | null
  students?: StudentItem[]
  _count?: {
    students: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface StudentItem {
  id: number
  studentNo: string
  name: string
  gender: Gender
  classId: number
  class?: Pick<ClassItem, 'id' | 'name' | 'gradeYear'>
  phone?: string | null
  email?: string | null
  enrollYear: number
  status: StudentStatus
  remark?: string | null
  grades?: GradeItem[]
  createdAt?: string
  updatedAt?: string
}

export interface CourseItem {
  id: number
  name: string
  code: string
  credit: number
  teacherId?: number | null
  teacher?: Pick<UserItem, 'id' | 'name' | 'username'> | null
  description?: string | null
  grades?: GradeItem[]
  _count?: {
    grades: number
  }
  createdAt?: string
  updatedAt?: string
}

export interface GradeItem {
  id: number
  studentId: number
  courseId: number
  semester: string
  usualScore: number
  examScore: number
  totalScore: number
  student?: Pick<StudentItem, 'id' | 'studentNo' | 'name'>
  course?: Pick<CourseItem, 'id' | 'name' | 'code' | 'teacherId'>
  createdAt?: string
  updatedAt?: string
}

export interface DashboardSummary {
  studentCount: number
  classCount: number
  courseCount: number
  gradeCount: number
}
