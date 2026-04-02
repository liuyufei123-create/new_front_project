<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found panel-card">
    <div>
      <h1>404</h1>
      <p>页面不存在，可能已经被移动或删除。</p>
      <el-button type="primary" @click="router.push('/dashboard')">返回首页</el-button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  margin: 24px;
  display: grid;
  place-items: center;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 96px;
}

p {
  margin: 12px 0 20px;
  color: #64748b;
}
</style>
