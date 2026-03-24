<route>
  {
    meta: {
      title: '用户管理',
    }
  }
</route>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import {
  NCard,
  NDataTable,
  NButton,
  NSpace,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NPopconfirm,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns, FormRules } from 'naive-ui'
import { api } from '@/api'

interface User {
  userId: number
  username: string
  nickName: string
  status: '0' | '1'
  roleIds: number[]
  deptId?: number
}

interface Role {
  roleId: number
  roleKey: string
  roleName: string
}

const message = useMessage()
const tableLoading = ref(false)
const users = ref<User[]>([])
const roles = ref<Role[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const usernameSearch = ref('')

const showModal = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const formData = ref({
  userId: undefined as number | undefined,
  username: '',
  nickName: '',
  password: '',
  status: '0' as '0' | '1',
  roleIds: [] as number[],
})

const formRules: FormRules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  nickName: { required: true, message: '请输入昵称', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
  roleIds: { type: 'array', required: true, message: '请选择角色', trigger: 'change' },
}

const columns: DataTableColumns<User> = [
  { title: '用户ID', key: 'userId', width: 80 },
  { title: '用户名', key: 'username', width: 120 },
  { title: '昵称', key: 'nickName', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) =>
      h(
        NTag,
        { type: row.status === '0' ? 'success' : 'error', size: 'small' },
        () => (row.status === '0' ? '正常' : '停用'),
      ),
  },
  {
    title: '角色',
    key: 'roles',
    ellipsis: { tooltip: true },
    render: (row) => {
      const userRoles = roles.value.filter((r) => row.roleIds.includes(r.roleId))
      return h(
        NSpace,
        { size: 4 },
        () =>
          userRoles.map((r) =>
            h(NTag, { size: 'small', type: 'info' }, () => r.roleName),
          ),
      )
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 4 }, () => [
        h(
          NButton,
          { size: 'small', text: true, type: 'primary', onClick: () => openEdit(row) },
          () => '编辑',
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.userId),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', text: true, type: 'error' }, () => '删除'),
            default: () => '确认删除该用户？',
          },
        ),
      ]),
  },
]

const roleOptions = ref<{ label: string; value: number }[]>([])

const fetchUsers = async () => {
  tableLoading.value = true
  try {
    const res = await api.api.system.user.list.get({
      $query: {
        pageNum: page.value,
        pageSize: pageSize.value,
        username: usernameSearch.value || undefined,
      },
    })
    if (res.data?.code === 200) {
      users.value = res.data.data.rows
      total.value = res.data.data.total
    }
  } finally {
    tableLoading.value = false
  }
}

const fetchRoles = async () => {
  const res = await api.api.system.role.list.get({ $query: { pageSize: 100 } })
  if (res.data?.code === 200) {
    roles.value = res.data.data.rows
    roleOptions.value = res.data.data.rows.map((r) => ({
      label: r.roleName,
      value: r.roleId,
    }))
  }
}

const handlePageChange = (p: number) => {
  page.value = p
  fetchUsers()
}

const handlePageSizeChange = (ps: number) => {
  pageSize.value = ps
  page.value = 1
  fetchUsers()
}

const handleSearch = () => {
  page.value = 1
  fetchUsers()
}

const openAdd = () => {
  isEdit.value = false
  formData.value = {
    userId: undefined,
    username: '',
    nickName: '',
    password: '',
    status: '0',
    roleIds: [],
  }
  showModal.value = true
}

const openEdit = (user: User) => {
  isEdit.value = true
  formData.value = {
    userId: user.userId,
    username: user.username,
    nickName: user.nickName,
    password: '',
    status: user.status,
    roleIds: [...user.roleIds],
  }
  showModal.value = true
}

const handleSubmit = async () => {
  modalLoading.value = true
  try {
    if (isEdit.value) {
      const res = await api.api.system.user.edit.put({
        userId: formData.value.userId!,
        nickName: formData.value.nickName,
        status: formData.value.status,
        roleIds: formData.value.roleIds,
      })
      if (res.data?.code === 200) {
        message.success('修改成功')
        showModal.value = false
        fetchUsers()
      } else {
        message.error(res.data?.msg || '修改失败')
      }
    } else {
      const res = await api.api.system.user.add.post({
        username: formData.value.username,
        nickName: formData.value.nickName,
        password: formData.value.password,
        status: formData.value.status,
        roleIds: formData.value.roleIds,
      })
      if (res.data?.code === 200) {
        message.success('新增成功')
        showModal.value = false
        fetchUsers()
      } else {
        message.error(res.data?.msg || '新增失败')
      }
    }
  } finally {
    modalLoading.value = false
  }
}

const handleDelete = async (userId: number) => {
  const res = await api.api.system.user["batch"].delete({
    ids: [userId],
  })
  if (res.data?.code === 200) {
    message.success('删除成功')
    fetchUsers()
  } else {
    message.error(res.data?.msg || '删除失败')
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>

<template>
  <n-card title="用户管理" :bordered="false" class="user-page">
    <template #header-extra>
      <n-space>
        <n-input
          v-model:value="usernameSearch"
          placeholder="搜索用户名"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <n-button type="primary" @click="handleSearch">查询</n-button>
        <n-button type="primary" @click="openAdd">新增用户</n-button>
      </n-space>
    </template>

    <n-data-table
      :columns="columns"
      :data="users"
      :loading="tableLoading"
      :pagination="{
        page: page,
        pageSize: pageSize,
        pageSizes: [10, 20, 50],
        itemCount: total,
        showSizePicker: true,
        onUpdatePage: handlePageChange,
        onUpdatePageSize: handlePageSizeChange,
      }"
      :row-key="(row: User) => row.userId"
      striped
    />
  </n-card>

  <n-modal
    v-model:show="showModal"
    :title="isEdit ? '编辑用户' : '新增用户'"
    preset="card"
    style="width: 500px"
    :mask-closable="false"
  >
    <n-form
      :model="formData"
      :rules="isEdit ? {} : formRules"
      label-placement="left"
      label-width="80"
    >
      <n-form-item v-if="!isEdit" label="用户名" path="username">
        <n-input v-model:value="formData.username" placeholder="请输入用户名" />
      </n-form-item>
      <n-form-item label="昵称" path="nickName">
        <n-input v-model:value="formData.nickName" placeholder="请输入昵称" />
      </n-form-item>
      <n-form-item v-if="!isEdit" label="密码" path="password">
        <n-input
          v-model:value="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item label="状态" path="status">
        <n-select
          v-model:value="formData.status"
          :options="[
            { label: '正常', value: '0' },
            { label: '停用', value: '1' },
          ]"
          placeholder="请选择状态"
        />
      </n-form-item>
      <n-form-item label="角色" path="roleIds">
        <n-select
          v-model:value="formData.roleIds"
          :options="roleOptions"
          multiple
          placeholder="请选择角色"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" :loading="modalLoading" @click="handleSubmit">
          确定
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.user-page {
  height: 100%;
}
</style>
