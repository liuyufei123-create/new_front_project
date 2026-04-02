import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useAuthStore } from '../stores/auth'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { title: '统计看板' },
      },
      {
        path: 'students',
        name: 'students',
        component: () => import('../views/StudentsView.vue'),
        meta: { title: '学生管理' },
      },
      {
        path: 'classes',
        name: 'classes',
        component: () => import('../views/ClassesView.vue'),
        meta: { title: '班级管理' },
      },
      {
        path: 'courses',
        name: 'courses',
        component: () => import('../views/CoursesView.vue'),
        meta: { title: '课程管理' },
      },
      {
        path: 'grades',
        name: 'grades',
        component: () => import('../views/GradesView.vue'),
        meta: { title: '成绩管理' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('../views/UsersView.vue'),
        meta: { title: '用户管理', roles: ['ADMIN'] },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { public: true, title: '页面未找到' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const isPublic = Boolean(to.meta.public)

  if (!isPublic && !authStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchProfile()
    } catch {
      authStore.logout()
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }

  if (to.path === '/login' && authStore.token) {
    return '/dashboard'
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles?.length && authStore.user && !roles.includes(authStore.user.role)) {
    return '/dashboard'
  }

  if (typeof to.meta.title === 'string') {
    document.title = `${to.meta.title} - 学生管理系统`
  }

  return true
})
