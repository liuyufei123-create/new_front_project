<script setup lang="ts">
import { Lock, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getErrorMessage } from '../api/http'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: 'admin123',
})

const submit = async () => {
  loading.value = true
  try {
    await authStore.login(form)
    ElMessage.success('登录成功')
    router.replace((route.query.redirect as string) || '/dashboard')
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-shell">
    <section class="hero">
      <div class="hero-badge">Student Management System</div>
      <h1>课程项目可直接演示的学生管理系统</h1>
      <p>
        包含管理员与教师双角色、学生班级课程成绩管理，以及真实数据库驱动的统计看板。
      </p>

      <div class="hero-tips">
        <div class="tip-card panel-card">
          <strong>管理员账号</strong>
          <span>admin / admin123</span>
        </div>
        <div class="tip-card panel-card">
          <strong>教师账号</strong>
          <span>zhangsan / teacher123</span>
        </div>
      </div>
    </section>

    <section class="login-card panel-card">
      <div class="card-title">欢迎登录</div>
      <div class="card-subtitle">使用系统预置账号快速进入演示环境</div>

      <el-form label-position="top" @submit.prevent="submit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :prefix-icon="User" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            :prefix-icon="Lock"
            show-password
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>

        <el-button class="submit-btn" type="primary" :loading="loading" @click="submit">
          登录系统
        </el-button>
      </el-form>
    </section>
  </div>
</template>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  padding: 32px;
  gap: 24px;
}

.hero,
.login-card {
  border-radius: 28px;
}

.hero {
  padding: 48px;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.32), transparent 30%),
    linear-gradient(145deg, #082f49, #0f766e);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-badge {
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 18px 0 12px;
  max-width: 10ch;
  font-size: 54px;
  line-height: 1.05;
}

.hero p {
  max-width: 520px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 17px;
}

.hero-tips {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 36px;
}

.tip-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #0f172a;
}

.login-card {
  padding: 42px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  font-size: 30px;
  font-weight: 700;
}

.card-subtitle {
  margin: 10px 0 22px;
  color: #64748b;
}

.submit-btn {
  width: 100%;
  height: 44px;
  margin-top: 8px;
}
</style>
