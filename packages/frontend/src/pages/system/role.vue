<route>
  {
    meta: {
      title: '角色管理',
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

interface Role {
  roleId: number
  roleKey: string
  roleName: string
  status: '0' | '1'
  dataScope: '1' | '2' | '3' | '4' | '5'
  deptCheckStrictly: '0' | '1'
  deptIds: number[]
}

const message = useMessage()
const tableLoading = ref(false)
const roles = ref<Role[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const roleNameSearch = ref('')
const roleKeySearch = ref('')

const showModal = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const formData = ref({
  roleId: undefined as number | undefined,
  roleKey: '',
  roleName: '',
  status: '0' as '0' | '1',
  dataScope: '1' as '1' | '2' | '3' | '4' | '5',
  deptCheckStrictly: '0' as '0' | '1',
})

const dataScopeOptions = [
  { label: '全部数据权限', value: '1' },
  { label: '自定义数据权限', value: '2' },
  { label: '本部门数据权限', value: '3' },
  { label: '本部门及以下数据权限', value: '4' },
  { label: '仅本人数据权限', value: '5' },
]

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
]

const formRules: FormRules = {
  roleKey: { required: true, message: '请输入角色标识', trigger: 'blur' },
  roleName: { required: true, message: '请输入角色名称', trigger: 'blur' },
}

const columns: DataTableColumns<Role> = [
  { title: '角色ID', key: 'roleId', width: 80 },
  { title: '角色标识', key: 'roleKey', width: 150 },
  { title: '角色名称', key: 'roleName', width: 150 },
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
    title: '数据权限',
    key: 'dataScope',
    width: 150,
    render: (row) => {
      const option = dataScopeOptions.find((o) => o.value === row.dataScope)
      return h(NTag, { size: 'small', type: 'info' }, () => option?.label || row.dataScope)
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
            onPositiveClick: () => handleDelete(row.roleId),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', text: true, type: 'error' }, () => '删除'),
            default: () => '确认删除该角色？',
          },
        ),
      ]),
  },
]

const fetchRoles = async () => {
  tableLoading.value = true
  try {
    const res = await api.api.system.role.list.get({
      $query: {
        pageNum: page.value,
        pageSize: pageSize.value,
        roleName: roleNameSearch.value || undefined,
        roleKey: roleKeySearch.value || undefined,
      },
    })
    if (res.data?.code === 200) {
      roles.value = res.data.data.rows
      total.value = res.data.data.total
    }
  } finally {
    tableLoading.value = false
  }
}

const handlePageChange = (p: number) => {
  page.value = p
  fetchRoles()
}

const handlePageSizeChange = (ps: number) => {
  pageSize.value = ps
  page.value = 1
  fetchRoles()
}

const handleSearch = () => {
  page.value = 1
  fetchRoles()
}

const openAdd = () => {
  isEdit.value = false
  formData.value = {
    roleId: undefined,
    roleKey: '',
    roleName: '',
    status: '0',
    dataScope: '1',
    deptCheckStrictly: '0',
  }
  showModal.value = true
}

const openEdit = (role: Role) => {
  isEdit.value = true
  formData.value = {
    roleId: role.roleId,
    roleKey: role.roleKey,
    roleName: role.roleName,
    status: role.status,
    dataScope: role.dataScope,
    deptCheckStrictly: role.deptCheckStrictly,
  }
  showModal.value = true
}

const handleSubmit = async () => {
  modalLoading.value = true
  try {
    if (isEdit.value) {
      const res = await api.api.system.role.edit.put({
        roleId: formData.value.roleId!,
        roleName: formData.value.roleName,
        status: formData.value.status,
        dataScope: formData.value.dataScope,
        deptCheckStrictly: formData.value.deptCheckStrictly,
      })
      if (res.data?.code === 200) {
        message.success('修改成功')
        showModal.value = false
        fetchRoles()
      } else {
        message.error(res.data?.msg || '修改失败')
      }
    } else {
      const res = await api.api.system.role.add.post({
        roleKey: formData.value.roleKey,
        roleName: formData.value.roleName,
        status: formData.value.status,
        dataScope: formData.value.dataScope,
        deptCheckStrictly: formData.value.deptCheckStrictly,
      })
      if (res.data?.code === 200) {
        message.success('新增成功')
        showModal.value = false
        fetchRoles()
      } else {
        message.error(res.data?.msg || '新增失败')
      }
    }
  } finally {
    modalLoading.value = false
  }
}

const handleDelete = async (roleId: number) => {
  const res = await api.api.system.role["batch"].delete({
    ids: [roleId],
  })
  if (res.data?.code === 200) {
    message.success('删除成功')
    fetchRoles()
  } else {
    message.error(res.data?.msg || '删除失败')
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

<template>
  <n-card title="角色管理" :bordered="false" class="role-page">
    <template #header-extra>
      <n-space>
        <n-input
          v-model:value="roleNameSearch"
          placeholder="搜索角色名称"
          clearable
          style="width: 150px"
          @keyup.enter="handleSearch"
        />
        <n-input
          v-model:value="roleKeySearch"
          placeholder="搜索角色标识"
          clearable
          style="width: 150px"
          @keyup.enter="handleSearch"
        />
        <n-button type="primary" @click="handleSearch">查询</n-button>
        <n-button type="primary" @click="openAdd">新增角色</n-button>
      </n-space>
    </template>

    <n-data-table
      :columns="columns"
      :data="roles"
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
      :row-key="(row: Role) => row.roleId"
      striped
    />
  </n-card>

  <n-modal
    v-model:show="showModal"
    :title="isEdit ? '编辑角色' : '新增角色'"
    preset="card"
    style="width: 500px"
    :mask-closable="false"
  >
    <n-form :model="formData" :rules="formRules" label-placement="left" label-width="100">
      <n-form-item v-if="!isEdit" label="角色标识" path="roleKey">
        <n-input v-model:value="formData.roleKey" placeholder="如: admin, editor" />
      </n-form-item>
      <n-form-item label="角色名称" path="roleName">
        <n-input v-model:value="formData.roleName" placeholder="请输入角色名称" />
      </n-form-item>
      <n-form-item label="状态" path="status">
        <n-select v-model:value="formData.status" :options="statusOptions" />
      </n-form-item>
      <n-form-item label="数据权限" path="dataScope">
        <n-select v-model:value="formData.dataScope" :options="dataScopeOptions" />
      </n-form-item>
      <n-form-item label="部门严格检查" path="deptCheckStrictly">
        <n-select
          v-model:value="formData.deptCheckStrictly"
          :options="[
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ]"
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
.role-page {
  height: 100%;
}
</style>
