<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { getErrorMessage, http } from '../api/http'
import type { ApiListResponse, Role, UserItem, UserStatus } from '../types/models'

const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const users = ref<UserItem[]>([])
const total = ref(0)
const editingId = ref<number | null>(null)

const query = reactive({
  keyword: '',
  role: '' as '' | Role,
  status: '' as '' | UserStatus,
  page: 1,
  pageSize: 10,
})

const form = reactive({
  username: '',
  name: '',
  password: '',
  role: 'TEACHER' as Role,
  status: 'ACTIVE' as UserStatus,
})

const resetForm = () => {
  editingId.value = null
  form.username = ''
  form.name = ''
  form.password = ''
  form.role = 'TEACHER'
  form.status = 'ACTIVE'
}

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await http.get<ApiListResponse<UserItem>>('/users', {
      params: {
        ...query,
        role: query.role || undefined,
        status: query.status || undefined,
        keyword: query.keyword || undefined,
      },
    })
    users.value = data.items
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

const openEdit = (row: UserItem) => {
  editingId.value = row.id
  form.username = row.username
  form.name = row.name
  form.password = ''
  form.role = row.role
  form.status = row.status
  dialogVisible.value = true
}

const submit = async () => {
  saving.value = true
  try {
    const payload = {
      username: form.username,
      name: form.name,
      role: form.role,
      status: form.status,
      ...(form.password ? { password: form.password } : {}),
    }

    if (editingId.value) {
      await http.put(`/users/${editingId.value}`, payload)
      ElMessage.success('用户更新成功')
    } else {
      await http.post('/users', { ...payload, password: form.password || 'teacher123' })
      ElMessage.success('用户创建成功')
    }

    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    saving.value = false
  }
}

const handleResetPassword = async (row: UserItem) => {
  try {
    await ElMessageBox.confirm(`确认将 ${row.name} 的密码重置为 teacher123 吗？`, '重置密码', {
      type: 'warning',
    })
    await http.put(`/users/${row.id}`, { password: 'teacher123' })
    ElMessage.success('密码已重置为 teacher123')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(getErrorMessage(error))
    }
  }
}

const handleDelete = async (row: UserItem) => {
  try {
    await ElMessageBox.confirm(`确认删除账号 ${row.username} 吗？`, '删除用户', {
      type: 'warning',
    })
    await http.delete(`/users/${row.id}`)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(getErrorMessage(error))
    }
  }
}

onMounted(loadData)
</script>

<template>
  <div class="page-shell">
    <div class="page-header">
      <div>
        <h2>用户管理</h2>
        <div class="page-subtitle">管理员可以创建教师账号、停用账号以及重置密码</div>
      </div>
      <el-button type="primary" @click="openCreate">新增用户</el-button>
    </div>

    <div class="panel-card page-panel">
      <div class="toolbar">
        <div class="toolbar-group">
          <el-input v-model="query.keyword" clearable placeholder="搜索用户名或姓名" style="width: 220px" />
          <el-select v-model="query.role" clearable placeholder="角色" style="width: 140px">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="教师" value="TEACHER" />
          </el-select>
          <el-select v-model="query.status" clearable placeholder="状态" style="width: 140px">
            <el-option label="启用" value="ACTIVE" />
            <el-option label="停用" value="DISABLED" />
          </el-select>
        </div>

        <div class="toolbar-group">
          <el-button @click="loadData">查询</el-button>
          <el-button
            @click="
              query.keyword = '';
              query.role = '';
              query.status = '';
              query.page = 1;
              loadData();
            "
          >
            重置
          </el-button>
        </div>
      </div>

      <el-table :data="users" v-loading="loading" style="margin-top: 18px" border>
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="name" label="姓名" min-width="140" />
        <el-table-column label="角色" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'success'">
              {{ row.role === 'ADMIN' ? '管理员' : '教师' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="240" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
              <el-button link type="warning" @click="handleResetPassword(row)">重置密码</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑用户' : '新增用户'" width="520px">
      <el-form label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="editingId ? '新密码（留空则不修改）' : '密码'">
          <el-input v-model="form.password" show-password type="password" placeholder="至少 6 位" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="教师" value="TEACHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="ACTIVE">启用</el-radio>
            <el-radio value="DISABLED">停用</el-radio>
          </el-radio-group>
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
