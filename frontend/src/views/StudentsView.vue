<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { getErrorMessage, http } from '../api/http'
import { useAuthStore } from '../stores/auth'
import type {
  ApiListResponse,
  ClassItem,
  Gender,
  GradeItem,
  StudentItem,
  StudentStatus,
} from '../types/models'

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const students = ref<StudentItem[]>([])
const classes = ref<ClassItem[]>([])
const studentDetail = ref<StudentItem | null>(null)
const total = ref(0)
const editingId = ref<number | null>(null)

const query = reactive({
  keyword: '',
  classId: undefined as number | undefined,
  status: '' as '' | StudentStatus,
  page: 1,
  pageSize: 10,
})

const form = reactive({
  studentNo: '',
  name: '',
  gender: 'MALE' as Gender,
  classId: undefined as number | undefined,
  phone: '',
  email: '',
  enrollYear: new Date().getFullYear(),
  status: 'ACTIVE' as StudentStatus,
  remark: '',
})

const canManage = computed(() => authStore.isAdmin)

const resetForm = () => {
  editingId.value = null
  form.studentNo = ''
  form.name = ''
  form.gender = 'MALE'
  form.classId = undefined
  form.phone = ''
  form.email = ''
  form.enrollYear = new Date().getFullYear()
  form.status = 'ACTIVE'
  form.remark = ''
}

const loadClasses = async () => {
  const { data } = await http.get<ApiListResponse<ClassItem>>('/classes', {
    params: { page: 1, pageSize: 100 },
  })
  classes.value = data.items
}

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await http.get<ApiListResponse<StudentItem>>('/students', {
      params: {
        ...query,
        classId: query.classId || undefined,
        status: query.status || undefined,
        keyword: query.keyword || undefined,
      },
    })
    students.value = data.items
    total.value = data.total
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const showDetail = async (row: StudentItem) => {
  try {
    const { data } = await http.get<StudentItem>(`/students/${row.id}`)
    studentDetail.value = data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  }
}

const openCreate = () => {
  resetForm()
  dialogVisible.value = true
}

const openEdit = (row: StudentItem) => {
  editingId.value = row.id
  form.studentNo = row.studentNo
  form.name = row.name
  form.gender = row.gender
  form.classId = row.classId
  form.phone = row.phone || ''
  form.email = row.email || ''
  form.enrollYear = row.enrollYear
  form.status = row.status
  form.remark = row.remark || ''
  dialogVisible.value = true
}

const submit = async () => {
  saving.value = true
  try {
    const payload = {
      studentNo: form.studentNo,
      name: form.name,
      gender: form.gender,
      classId: form.classId,
      phone: form.phone || undefined,
      email: form.email || undefined,
      enrollYear: form.enrollYear,
      status: form.status,
      remark: form.remark || undefined,
    }

    if (editingId.value) {
      await http.put(`/students/${editingId.value}`, payload)
      ElMessage.success('学生信息更新成功')
    } else {
      await http.post('/students', payload)
      ElMessage.success('学生创建成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: StudentItem) => {
  try {
    await ElMessageBox.confirm(`确认删除学生 ${row.name} 吗？`, '删除学生', {
      type: 'warning',
    })
    await http.delete(`/students/${row.id}`)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(getErrorMessage(error))
    }
  }
}

const formatGender = (value: Gender) => (value === 'MALE' ? '男' : '女')
const formatStatus = (value: StudentStatus) =>
  ({
    ACTIVE: '在读',
    INACTIVE: '休学',
    GRADUATED: '毕业',
  })[value]

const formatGradeRow = (grade: GradeItem) =>
  `${grade.course?.name || '-'} / ${grade.semester} / 总评 ${grade.totalScore}`

onMounted(async () => {
  await Promise.all([loadClasses(), loadData()])
})
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2>学生管理</h2>
        <div class="page-subtitle">维护学生档案信息，支持查看学生详情与成绩记录</div>
      </div>
      <el-button v-if="canManage" type="primary" @click="openCreate">新增学生</el-button>
    </div>

    <div class="panel-card page-panel">
      <div class="toolbar">
        <div class="toolbar-group">
          <el-input v-model="query.keyword" clearable placeholder="搜索学号或姓名" style="width: 220px" />
          <el-select v-model="query.classId" clearable placeholder="班级" style="width: 220px">
            <el-option v-for="item in classes" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <el-select v-model="query.status" clearable placeholder="学籍状态" style="width: 140px">
            <el-option label="在读" value="ACTIVE" />
            <el-option label="休学" value="INACTIVE" />
            <el-option label="毕业" value="GRADUATED" />
          </el-select>
        </div>
        <div class="toolbar-group">
          <el-button @click="loadData">查询</el-button>
          <el-button
            @click="
              query.keyword = '';
              query.classId = undefined;
              query.status = '';
              query.page = 1;
              loadData();
            "
          >
            重置
          </el-button>
        </div>
      </div>

      <el-table :data="students" v-loading="loading" border style="margin-top: 18px">
        <el-table-column prop="studentNo" label="学号" min-width="130" />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column label="性别" min-width="80">
          <template #default="{ row }">{{ formatGender(row.gender) }}</template>
        </el-table-column>
        <el-table-column label="班级" min-width="190">
          <template #default="{ row }">{{ row.class?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="enrollYear" label="入学年份" min-width="110" />
        <el-table-column label="学籍状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : row.status === 'INACTIVE' ? 'warning' : 'info'">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" min-width="140" />
        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button link type="primary" @click="showDetail(row)">详情</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑学生' : '新增学生'" width="620px">
      <el-form label-position="top">
        <div class="dialog-grid">
          <el-form-item label="学号">
            <el-input v-model="form.studentNo" />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="form.gender">
              <el-radio value="MALE">男</el-radio>
              <el-radio value="FEMALE">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="班级">
            <el-select v-model="form.classId" style="width: 100%">
              <el-option v-for="item in classes" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.phone" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" />
          </el-form-item>
          <el-form-item label="入学年份">
            <el-input-number v-model="form.enrollYear" :min="2000" :max="2100" style="width: 100%" />
          </el-form-item>
          <el-form-item label="学籍状态">
            <el-select v-model="form.status" style="width: 100%">
              <el-option label="在读" value="ACTIVE" />
              <el-option label="休学" value="INACTIVE" />
              <el-option label="毕业" value="GRADUATED" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="学生详情" size="42%">
      <template v-if="studentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学号">{{ studentDetail.studentNo }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ studentDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ formatGender(studentDetail.gender) }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ studentDetail.class?.name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ studentDetail.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ studentDetail.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="入学年份">{{ studentDetail.enrollYear }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ formatStatus(studentDetail.status) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ studentDetail.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-block">
          <h3>成绩记录</h3>
          <el-empty v-if="!studentDetail.grades?.length" description="暂无成绩记录" />
          <el-timeline v-else>
            <el-timeline-item v-for="grade in studentDetail.grades" :key="grade.id" :timestamp="grade.semester">
              {{ formatGradeRow(grade) }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.page-panel {
  padding: 20px;
}

.dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.detail-block {
  margin-top: 24px;
}

.detail-block h3 {
  margin: 0 0 16px;
}
</style>
