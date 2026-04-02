<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { getErrorMessage, http } from '../api/http'
import { useAuthStore } from '../stores/auth'
import type { ApiListResponse, ClassItem, UserItem } from '../types/models'

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const classes = ref<ClassItem[]>([])
const teachers = ref<UserItem[]>([])
const classDetail = ref<ClassItem | null>(null)
const total = ref(0)
const editingId = ref<number | null>(null)

const query = reactive({
  keyword: '',
  gradeYear: undefined as number | undefined,
  page: 1,
  pageSize: 10,
})

const form = reactive({
  name: '',
  gradeYear: new Date().getFullYear(),
  headTeacherId: undefined as number | undefined,
  description: '',
})

const canManage = computed(() => authStore.isAdmin)

const resetForm = () => {
  editingId.value = null
  form.name = ''
  form.gradeYear = new Date().getFullYear()
  form.headTeacherId = undefined
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
    const { data } = await http.get<ApiListResponse<ClassItem>>('/classes', {
      params: {
        ...query,
        keyword: query.keyword || undefined,
        gradeYear: query.gradeYear || undefined,
      },
    })
    classes.value = data.items
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

const openEdit = (row: ClassItem) => {
  editingId.value = row.id
  form.name = row.name
  form.gradeYear = row.gradeYear
  form.headTeacherId = row.headTeacherId || undefined
  form.description = row.description || ''
  dialogVisible.value = true
}

const showDetail = async (row: ClassItem) => {
  try {
    const { data } = await http.get<ClassItem>(`/classes/${row.id}`)
    classDetail.value = data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  }
}

const submit = async () => {
  saving.value = true
  try {
    const payload = {
      name: form.name,
      gradeYear: form.gradeYear,
      headTeacherId: form.headTeacherId,
      description: form.description || undefined,
    }

    if (editingId.value) {
      await http.put(`/classes/${editingId.value}`, payload)
      ElMessage.success('班级更新成功')
    } else {
      await http.post('/classes', payload)
      ElMessage.success('班级创建成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: ClassItem) => {
  try {
    await ElMessageBox.confirm(`确认删除班级 ${row.name} 吗？`, '删除班级', { type: 'warning' })
    await http.delete(`/classes/${row.id}`)
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
        <h2>班级管理</h2>
        <div class="page-subtitle">查看班级结构、班主任信息以及班级学生分布</div>
      </div>
      <el-button v-if="canManage" type="primary" @click="openCreate">新增班级</el-button>
    </div>

    <div class="panel-card page-panel">
      <div class="toolbar">
        <div class="toolbar-group">
          <el-input v-model="query.keyword" clearable placeholder="搜索班级名称" style="width: 220px" />
          <el-input-number v-model="query.gradeYear" :min="2000" :max="2100" placeholder="年级" />
        </div>
        <div class="toolbar-group">
          <el-button @click="loadData">查询</el-button>
          <el-button
            @click="
              query.keyword = '';
              query.gradeYear = undefined;
              query.page = 1;
              loadData();
            "
          >
            重置
          </el-button>
        </div>
      </div>

      <el-table :data="classes" v-loading="loading" border style="margin-top: 18px">
        <el-table-column prop="name" label="班级名称" min-width="220" />
        <el-table-column prop="gradeYear" label="年级" min-width="100" />
        <el-table-column label="班主任" min-width="140">
          <template #default="{ row }">{{ row.headTeacher?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="学生人数" min-width="100">
          <template #default="{ row }">{{ row._count?.students ?? 0 }}</template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="240" show-overflow-tooltip />
        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button link type="primary" @click="showDetail(row)">查看学生</el-button>
              <el-button v-if="canManage" link type="warning" @click="openEdit(row)">编辑</el-button>
              <el-button v-if="canManage" link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑班级' : '新增班级'" width="560px">
      <el-form label-position="top">
        <el-form-item label="班级名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input-number v-model="form.gradeYear" :min="2000" :max="2100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="班主任">
          <el-select v-model="form.headTeacherId" clearable style="width: 100%">
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

    <el-drawer v-model="detailVisible" title="班级学生信息" size="40%">
      <template v-if="classDetail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="班级名称">{{ classDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="年级">{{ classDetail.gradeYear }}</el-descriptions-item>
          <el-descriptions-item label="班主任">{{ classDetail.headTeacher?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="说明">{{ classDetail.description || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-table :data="classDetail.students || []" border style="margin-top: 20px">
          <el-table-column prop="studentNo" label="学号" min-width="120" />
          <el-table-column prop="name" label="姓名" min-width="120" />
          <el-table-column label="性别" min-width="80">
            <template #default="{ row }">{{ row.gender === 'MALE' ? '男' : '女' }}</template>
          </el-table-column>
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              {{ row.status === 'ACTIVE' ? '在读' : row.status === 'INACTIVE' ? '休学' : '毕业' }}
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.page-panel {
  padding: 20px;
}
</style>
