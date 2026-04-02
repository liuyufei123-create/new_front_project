<script setup lang="ts">
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    option: EChartsOption
    height?: number
  }>(),
  {
    height: 320,
  },
)

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const styleHeight = computed(() => `${props.height}px`)

const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  chart.setOption(props.option)
}

const handleResize = () => chart?.resize()

onMounted(() => {
  renderChart()
  window.addEventListener('resize', handleResize)
})

watch(
  () => props.option,
  () => renderChart(),
  { deep: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<template>
  <div class="chart-card panel-card">
    <div class="chart-title">{{ title }}</div>
    <div ref="chartRef" class="chart-body" :style="{ height: styleHeight }" />
  </div>
</template>

<style scoped>
.chart-card {
  padding: 18px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 14px;
}

.chart-body {
  width: 100%;
}
</style>
