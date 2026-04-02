<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { getErrorMessage, http } from '../api/http'
import { useAuthStore } from '../stores/auth'
import type { ApiListResponse, CourseItem, GradeItem, StudentItem } from '../types/models'

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const grades = ref<GradeItem[]>([])
const students = ref<StudentItem[]>([])
const courses = ref<CourseItem[]>([])
const total = ref(0)
const editingId = ref<number | null>(null)

const query = reactive({
  keyword: '',
  studentId: undefined as number | undefined,
  courseId: undefined as number | undefined,
  semester: '',
  page: 1,
  pageSize: 10,
})

const form = reactive({
  studentId: undefined as number | undefined,
  courseId: undefined as number | undefined,
  semester: '2025-2026-1',
  usualScore: 80,
  examScore: 80,
})

const totalScore = computed(() =>
  Math.round((form.usualScore * 0.4 + form.examScore * 0.6) * 100) / 100,
)

const availableCourses = computed(() =>
  authStore.user?.role === 'TEACHER'
    ? courses.value.filter((item) => item.teacherId === authStore.user?.id)
    : courses.value,
)

const resetForm = () => {
  editingId.value = null
  form.studentId = undefined
  form.courseId = undefined
  form.semester = '2025-2026-1'
  form.usualScore = 80
  form.examScore = 80
}

const loadOptions = async () => {
  const courseParams =
    authStore.user?.role === 'TEACHER' ? { teacherId: authStore.user.id } : {}
  const [studentRes, courseRes] = await Promise.all([
    http.get<ApiListResponse<StudentItem>>('/students', { params: { page: 1, pageSize: 100 } }),
    http.get<ApiListResponse<CourseItem>>('/courses', {
      params: { page: 1, pageSize: 100, ...courseParams },
    }),
  ])
  students.value = studentRes.data.items
  courses.value = courseRes.data.items
}

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await http.get<ApiListResponse<GradeItem>>('/grades', {
      params: {
        ...query,
        keyword: query.keyword || undefined,
        studentId: query.studentId || undefined,
        courseId: query.courseId || undefined,
        semester: query.semester || undefined,
      },
    })
    grades.value = data.items
    total.value = data.total
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row: GradeItem) => {
  editingId.value = row.id
  form.studentId = row.studentId
  form.courseId = row.courseId
  form.semester = row.semester
  form.usualScore = row.usualScore
  form.examScore = row.examScore
  dialogVisible.value = true
}

const submit = async () => {
  saving.value = true
  try {
    const payload = {
      studentId: form.studentId,
      courseId: form.courseId,
      semester: form.semester,
      usualScore: form.usualScore,
      examScore: form.examScore,
    }
    if (editingId.value) {
      await http.put(`/grades/${editingId.value}`, payload)
      ElMessage.success('成绩更新成功')
    } else {
      await http.post('/grades', payload)
      ElMessage.success('成绩录入成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: GradeItem) => {
  try {
    await ElMessageBox.confirm(
      `确认删除 ${row.student?.name || '该学生'} 在 ${row.course?.name || '该课程'} 的成绩吗？`,
      '删除成绩',
      { type: 'warning' },
    )
    await http.delete(`/grades/${row.id}`)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(getErrorMessage(error))
    }
  }
}

onMounted(async () => {
  await Promise.all([loadOptions(), loadData()])
})
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2>成绩管理</h2>
        <div class="page-subtitle">支持按学生、课程、学期筛选，并自动计算总评成绩</div>
      </div>
      <el-button type="primary" @click="openCreate">录入成绩</el-button>
    </div>

    <div class="panel-card page-panel">
      <div class="toolbar">
        <div class="toolbar-group">
          <el-input v-model="query.keyword" clearable placeholder="搜索学生或课程" style="width: 220px" />
          <el-select v-model="query.studentId" clearable placeholder="学生" style="width: 200px">
            <el-option v-for="item in students" :key="item.id" :label="`${item.name} (${item.studentNo})`" :value="item.id" />
          </el-select>
          <el-select v-model="query.courseId" clearable placeholder="课程" style="width: 200px">
            <el-option v-for="item in availableCourses" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-input v-model="query.semester" clearable placeholder="学期，例如 2025-2026-1" style="width: 200px" />
        </div>
        <div class="toolbar-group">
          <el-button @click="loadData">查询</el-button>
          <el-button
            @click="
              query.keyword = '';
              query.studentId = undefined;
              query.courseId = undefined;
              query.semester = '';
              query.page = 1;
              loadData();
            "
          >
            重置
          </el-button>
        </div>
      </div>

      <el-table :data="grades" v-loading="loading" border style="margin-top: 18px">
        <el-table-column label="学生" min-width="160">
          <template #default="{ row }">{{ row.student?.name }} ({{ row.student?.studentNo }})</template>
        </el-table-column>
        <el-table-column label="课程" min-width="150">
          <template #default="{ row }">{{ row.course?.name }}</template>
        </el-table-column>
        <el-table-column prop="semester" label="学期" min-width="130" />
        <el-table-column prop="usualScore" label="平时成绩" min-width="100" />
        <el-table-column prop="examScore" label="考试成绩" min-width="100" />
        <el-table-column prop="totalScore" label="总评成绩" min-width="100" />
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button link type="warning" @click="openEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          layout="total, prev, pager, next, sizes"
          :total="total"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑成绩' : '录入成绩'" width="560px">
      <el-form label-position="top">
        <el-form-item label="学生">
          <el-select v-model="form.studentId" filterable style="width: 100%">
            <el-option v-for="item in students" :key="item.id" :label="`${item.name} (${item.studentNo})`" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select v-model="form.courseId" filterable style="width: 100%">
            <el-option v-for="item in availableCourses" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-input v-model="form.semester" />
        </el-form-item>
        <div class="score-grid">
          <el-form-item label="平时成绩">
            <el-input-number v-model="form.usualScore" :min="0" :max="100" style="width: 100%" />
          </el-form-item>
          <el-form-item label="考试成绩">
            <el-input-number v-model="form.examScore" :min="0" :max="100" style="width: 100%" />
          </el-form-item>
        </div>
        <div class="total-box">总评成绩：{{ totalScore }}</div>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-panel {
  padding: 20px;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.total-box {
  margin-top: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
}
</style>
