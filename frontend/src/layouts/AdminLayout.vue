<script setup lang="ts">
import {
  DataBoard,
  Document,
  Histogram,
  Reading,
  School,
  User,
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const menuItems = computed(() => {
  const base = [
    { path: '/dashboard', label: '统计看板', icon: DataBoard, roles: ['ADMIN', 'TEACHER'] },
    { path: '/students', label: '学生管理', icon: School, roles: ['ADMIN', 'TEACHER'] },
    { path: '/classes', label: '班级管理', icon: Reading, roles: ['ADMIN', 'TEACHER'] },
    { path: '/courses', label: '课程管理', icon: Document, roles: ['ADMIN', 'TEACHER'] },
    { path: '/grades', label: '成绩管理', icon: Histogram, roles: ['ADMIN', 'TEACHER'] },
    { path: '/users', label: '用户管理', icon: User, roles: ['ADMIN'] },
  ]

  return base.filter((item) => item.roles.includes(authStore.user?.role || 'TEACHER'))
})

const pageTitle = computed(() => (route.meta.title as string) || '学生管理系统')

const handleLogout = async () => {
  await ElMessageBox.confirm('确认退出当前账号吗？', '退出登录', {
    type: 'warning',
  })
  authStore.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="layout-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">SMS</div>
        <div>
          <div class="brand-title">学生管理系统</div>
          <div class="brand-subtitle">Vue + NestJS</div>
        </div>
      </div>

      <el-menu :default-active="route.path" router class="menu">
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <div class="content-shell">
      <header class="topbar panel-card">
        <div>
          <div class="topbar-title">{{ pageTitle }}</div>
          <div class="topbar-subtitle">课程项目演示版，支持管理员与教师双角色</div>
        </div>

        <div class="topbar-actions">
          <el-tag type="success">{{ authStore.user?.role === 'ADMIN' ? '管理员' : '教师' }}</el-tag>
          <span class="user-name">{{ authStore.user?.name }}</span>
          <el-button type="primary" plain @click="handleLogout">退出登录</el-button>
        </div>
      </header>

      <main class="page-container">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
}

.sidebar {
  padding: 24px 16px;
  background: linear-gradient(180deg, #0f172a, #172554 55%, #0f766e);
  color: #fff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  padding: 6px 8px 20px;
}

.brand-mark {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #38bdf8, #34d399);
  color: #082f49;
  font-weight: 800;
}

.brand-title {
  font-size: 20px;
  font-weight: 700;
}

.brand-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.menu {
  border-right: none;
  background: transparent;
}

.menu :deep(.el-menu-item) {
  margin-bottom: 6px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.88);
}

.menu :deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.content-shell {
  padding: 24px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 22px;
}

.topbar-title {
  font-size: 22px;
  font-weight: 700;
}

.topbar-subtitle {
  margin-top: 6px;
  color: #64748b;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-weight: 600;
}

.page-container {
  margin-top: 22px;
}
</style>
