<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { ElMessage } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { getErrorMessage, http } from '../api/http'
import ChartPanel from '../components/ChartPanel.vue'
import StatCard from '../components/StatCard.vue'
import type { DashboardSummary } from '../types/models'

const loading = ref(false)
const summary = ref<DashboardSummary>({
  studentCount: 0,
  classCount: 0,
  courseCount: 0,
  gradeCount: 0,
})
const classDistribution = ref<{ className: string; studentCount: number }[]>([])
const courseAverage = ref<{ courseName: string; averageScore: number }[]>([])
const passRate = ref<{ courseName: string; passRate: number }[]>([])

const loadData = async () => {
  loading.value = true
  try {
    const [summaryRes, classRes, courseRes, passRes] = await Promise.all([
      http.get<DashboardSummary>('/dashboard/summary'),
      http.get<{ className: string; studentCount: number }[]>('/dashboard/class-distribution'),
      http.get<{ courseName: string; averageScore: number }[]>('/dashboard/course-average'),
      http.get<{ courseName: string; passRate: number }[]>('/dashboard/pass-rate'),
    ])
    summary.value = summaryRes.data
    classDistribution.value = classRes.data
    courseAverage.value = courseRes.data
    passRate.value = passRes.data
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const classOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item' },
  legend: {
    bottom: 0,
    left: 'center',
  },
  series: [
    {
      name: '班级学生分布',
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['50%', '44%'],
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 3,
      },
      label: {
        formatter: '{b}\n{d}%',
      },
      data: classDistribution.value.map((item) => ({
        name: item.className,
        value: item.studentCount,
      })),
      color: ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6'],
    },
  ],
}))

const averageOption = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: courseAverage.value.map((item) => item.courseName),
    axisLabel: { interval: 0, rotate: 15 },
  },
  yAxis: { type: 'value', max: 100 },
  series: [
    {
      type: 'line',
      smooth: true,
      data: courseAverage.value.map((item) => item.averageScore),
      itemStyle: { color: '#10b981' },
      areaStyle: { color: 'rgba(16, 185, 129, 0.15)' },
    },
  ],
}))

const passOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    valueFormatter: (value) => `${value}%`,
  },
  legend: {
    bottom: 0,
    left: 'center',
  },
  series: [
    {
      name: '课程及格率',
      type: 'pie',
      radius: '70%',
      center: ['50%', '44%'],
      label: {
        formatter: '{b}\n{c}%',
      },
      data: passRate.value.map((item) => ({
        name: item.courseName,
        value: item.passRate,
      })),
      color: ['#f59e0b', '#fb7185', '#34d399', '#38bdf8', '#a78bfa', '#f97316'],
    },
  ],
}))

onMounted(loadData)
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2>统计看板</h2>
        <div class="page-subtitle">实时展示学生、班级、课程与成绩录入概况</div>
      </div>
      <el-button type="primary" :loading="loading" @click="loadData">刷新数据</el-button>
    </div>

    <div class="stats-grid">
      <StatCard title="学生总数" :value="summary.studentCount" accent="#0284c7" />
      <StatCard title="班级总数" :value="summary.classCount" accent="#0f766e" />
      <StatCard title="课程总数" :value="summary.courseCount" accent="#7c3aed" />
      <StatCard title="成绩录入数" :value="summary.gradeCount" accent="#ea580c" />
    </div>

    <div class="chart-grid">
      <ChartPanel title="班级学生分布" :option="classOption" />
      <ChartPanel title="课程平均分" :option="averageOption" />
      <ChartPanel title="课程及格率" :option="passOption" />
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
</style>
