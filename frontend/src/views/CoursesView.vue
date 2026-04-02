<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { getErrorMessage, http } from '../api/http'
import { useAuthStore } from '../stores/auth'
import type { ApiListResponse, CourseItem, UserItem } from '../types/models'

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const courses = ref<CourseItem[]>([])
const teachers = ref<UserItem[]>([])
const total = ref(0)
const editingId = ref<number | null>(null)

const query = reactive({
  keyword: '',
  page: 1,
  pageSize: 10,
})

const form = reactive({
  name: '',
  code: '',
  credit: 2,
  teacherId: undefined as number | undefined,
  description: '',
})

const canManage = computed(() => authStore.isAdmin)

const resetForm = () => {
  editingId.value = null
  form.name = ''
  form.code = ''
  form.credit = 2
  form.teacherId = undefined
  form.description = ''
}

const loadTeachers = async () => {
  if (!canManage.value) return
  const { data } = await http.get<ApiListResponse<UserItem>>('/users', {
    params: { role: 'TEACHER', page: 1, pageSize: 100 },
  })
  teachers.value = data.items
}

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await http.get<ApiListResponse<CourseItem>>('/courses', {
      params: {
        keyword: query.keyword || undefined,
        page: query.page,
        pageSize: query.pageSize,
      },
    })
    courses.value = data.items
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

const openEdit = (row: CourseItem) => {
  editingId.value = row.id
  form.name = row.name
  form.code = row.code
  form.credit = row.credit
  form.teacherId = row.teacherId || undefined
  form.description = row.description || ''
  dialogVisible.value = true
}

const submit = async () => {
  saving.value = true
  try {
    const payload = {
      name: form.name,
      code: form.code,
      credit: form.credit,
      teacherId: form.teacherId,
      description: form.description || undefined,
    }

    if (editingId.value) {
      await http.put(`/courses/${editingId.value}`, payload)
      ElMessage.success('课程更新成功')
    } else {
      await http.post('/courses', payload)
      ElMessage.success('课程创建成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: CourseItem) => {
  try {
    await ElMessageBox.confirm(`确认删除课程 ${row.name} 吗？`, '删除课程', { type: 'warning' })
    await http.delete(`/courses/${row.id}`)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(getErrorMessage(error))
    }
  }
}

onMounted(async () => {
  await Promise.all([loadData(), loadTeachers()])
})
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2>课程管理</h2>
        <div class="page-subtitle">维护课程信息并为课程分配任课教师</div>
      </div>
      <el-button v-if="canManage" type="primary" @click="openCreate">新增课程</el-button>
    </div>

    <div class="panel-card page-panel">
      <div class="toolbar">
        <div class="toolbar-group">
          <el-input v-model="query.keyword" clearable placeholder="搜索课程名或课程编码" style="width: 260px" />
        </div>
        <div class="toolbar-group">
          <el-button @click="loadData">查询</el-button>
          <el-button
            @click="
              query.keyword = '';
              query.page = 1;
              loadData();
            "
          >
            重置
          </el-button>
        </div>
      </div>

      <el-table :data="courses" v-loading="loading" border style="margin-top: 18px">
        <el-table-column prop="name" label="课程名称" min-width="180" />
        <el-table-column prop="code" label="课程编码" min-width="120" />
        <el-table-column prop="credit" label="学分" min-width="90" />
        <el-table-column label="任课教师" min-width="140">
          <template #default="{ row }">{{ row.teacher?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="成绩条数" min-width="100">
          <template #default="{ row }">{{ row._count?.grades ?? 0 }}</template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="240" show-overflow-tooltip />
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-space wrap v-if="canManage">
              <el-button link type="warning" @click="openEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </el-space>
            <span v-else>-</span>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑课程' : '新增课程'" width="560px">
      <el-form label-position="top">
        <el-form-item label="课程名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="课程编码">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="学分">
          <el-input-number v-model="form.credit" :min="1" :max="20" style="width: 100%" />
        </el-form-item>
        <el-form-item label="任课教师">
          <el-select v-model="form.teacherId" clearable style="width: 100%">
            <el-option v-for="item in teachers" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
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
</style>
