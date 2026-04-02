<script setup lang="ts">
defineProps<{
  title: string
  value: number
  accent: string
}>()
</script>

<template>
  <div class="stat-card panel-card">
    <div class="stat-label">{{ title }}</div>
    <div class="stat-value" :style="{ color: accent }">{{ value }}</div>
  </div>
</template>

<style scoped>
.stat-card {
  padding: 22px;
}

.stat-label {
  color: #64748b;
  font-size: 14px;
}

.stat-value {
  margin-top: 10px;
  font-size: 34px;
  font-weight: 700;
}
</style>
