<route>
  {
    meta: {
      title: '操作日志',
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
  NPopconfirm,
  useMessage,
  NSelect,
  NDatePicker,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import dayjs from 'dayjs'
import { api } from '@/api'

interface OperLog {
  operId: number
  title: string
  businessType: 'OTHER' | 'INSERT' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'IMPORT' | 'CLEAN' | 'GRANT' | 'FORCE' | 'LOGIN' | 'LOGOUT'
  operName: string
  method: string
  requestMethod: string
  operUrl: string
  status: '0' | '1'
  operTime: string
}

const message = useMessage()
const loading = ref(false)
const logs = ref<OperLog[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const searchForm = ref({
  operName: '',
  businessType: undefined as string | undefined,
  status: undefined as string | undefined,
  dateRange: null as [number, number] | null,
})

const businessTypeOptions = [
  { label: '其他', value: 'OTHER' },
  { label: '新增', value: 'INSERT' },
  { label: '修改', value: 'UPDATE' },
  { label: '删除', value: 'DELETE' },
  { label: '导出', value: 'EXPORT' },
  { label: '导入', value: 'IMPORT' },
  { label: '清空', value: 'CLEAN' },
  { label: '授权', value: 'GRANT' },
  { label: '强退', value: 'FORCE' },
  { label: '登录', value: 'LOGIN' },
  { label: '退出', value: 'LOGOUT' },
]

const statusOptions = [
  { label: '成功', value: '0' },
  { label: '失败', value: '1' },
]

const getBusinessTypeTagType = (type: string) => {
  switch (type) {
    case 'INSERT':
      return 'success'
    case 'UPDATE':
      return 'warning'
    case 'DELETE':
      return 'error'
    case 'EXPORT':
    case 'IMPORT':
      return 'info'
    case 'LOGIN':
    case 'LOGOUT':
      return 'default'
    default:
      return 'default'
  }
}

const getBusinessTypeLabel = (type: string) => {
  const option = businessTypeOptions.find((o) => o.value === type)
  return option?.label || type
}

const columns: DataTableColumns<OperLog> = [
  { title: '日志ID', key: 'operId', width: 80 },
  { title: '操作模块', key: 'title', width: 150, ellipsis: { tooltip: true } },
  {
    title: '业务类型',
    key: 'businessType',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: getBusinessTypeTagType(row.businessType) as any, size: 'small' },
        () => getBusinessTypeLabel(row.businessType),
      ),
  },
  { title: '操作人员', key: 'operName', width: 120 },
  { title: '请求方法', key: 'method', width: 150, ellipsis: { tooltip: true } },
  { title: '请求方式', key: 'requestMethod', width: 100 },
  { title: '操作地址', key: 'operUrl', width: 150, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) =>
      h(
        NTag,
        { type: row.status === '0' ? 'success' : 'error', size: 'small' },
        () => (row.status === '0' ? '成功' : '失败'),
      ),
  },
  { title: '操作时间', key: 'operTime', width: 180 },
]

const fetchLogs = async () => {
  loading.value = true
  try {
    const query: any = {
      pageNum: page.value,
      pageSize: pageSize.value,
    }
    if (searchForm.value.operName) {
      query.operName = searchForm.value.operName
    }
    if (searchForm.value.businessType) {
      query.businessType = searchForm.value.businessType
    }
    if (searchForm.value.status) {
      query.status = searchForm.value.status
    }
    if (searchForm.value.dateRange) {
      query.beginTime = dayjs(searchForm.value.dateRange[0]).format('YYYY-MM-DD HH:mm:ss')
      query.endTime = dayjs(searchForm.value.dateRange[1]).format('YYYY-MM-DD HH:mm:ss')
    }

    const res = await api.api.monitor.operlog.list.get({ query })
    if (res.data?.code === 200) {
      logs.value = res.data.data.rows
      total.value = res.data.data.total
    }
  } finally {
    loading.value = false
  }
}

const handlePageChange = (p: number) => {
  page.value = p
  fetchLogs()
}

const handlePageSizeChange = (ps: number) => {
  pageSize.value = ps
  page.value = 1
  fetchLogs()
}

const handleSearch = () => {
  page.value = 1
  fetchLogs()
}

const handleReset = () => {
  searchForm.value = {
    operName: '',
    businessType: undefined,
    status: undefined,
    dateRange: null,
  }
  page.value = 1
  fetchLogs()
}

const handleClean = async () => {
  const res = await api.api.monitor.operlog.clean.delete()
  if (res.data?.code === 200) {
    message.success('清空成功')
    fetchLogs()
  } else {
    message.error(res.data?.msg || '清空失败')
  }
}

const handleExport = async () => {
  try {
    const query: any = {}
    if (searchForm.value.operName) {
      query.operName = searchForm.value.operName
    }
    if (searchForm.value.businessType) {
      query.businessType = searchForm.value.businessType
    }
    if (searchForm.value.status) {
      query.status = searchForm.value.status
    }

    const res = await api.api.monitor.operlog.export.post({ query })
    if (res.data) {
      const blob = new Blob([res.data as any], { type: 'text/csv;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `操作日志_${dayjs().format('YYYYMMDDHHmmss')}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
      message.success('导出成功')
    }
  } catch (err) {
    message.error('导出失败')
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <n-card title="操作日志" :bordered="false" class="oper-log-page">
    <template #header-extra>
      <n-space>
        <n-button type="primary" size="small" @click="handleExport">导出</n-button>
        <n-popconfirm @positive-click="handleClean">
          <template #trigger>
            <n-button type="error" size="small">清空</n-button>
          </template>
          确认清空所有操作日志？此操作不可逆！
        </n-popconfirm>
      </n-space>
    </template>

    <!-- 搜索表单 -->
    <n-card size="small" class="search-card">
      <n-space :size="12" align="center">
        <n-input
          v-model:value="searchForm.operName"
          placeholder="搜索操作人员"
          clearable
          style="width: 150px"
          @keyup.enter="handleSearch"
        />
        <n-select
          v-model:value="searchForm.businessType"
          :options="businessTypeOptions"
          placeholder="业务类型"
          clearable
          style="width: 120px"
        />
        <n-select
          v-model:value="searchForm.status"
          :options="statusOptions"
          placeholder="操作状态"
          clearable
          style="width: 100px"
        />
        <n-date-picker
          v-model:value="searchForm.dateRange"
          type="datetimerange"
          range
          clearable
          style="width: 320px"
        />
        <n-button type="primary" size="small" @click="handleSearch">查询</n-button>
        <n-button size="small" @click="handleReset">重置</n-button>
      </n-space>
    </n-card>

    <!-- 数据表格 -->
    <n-data-table
      :columns="columns"
      :data="logs"
      :loading="loading"
      :pagination="{
        page: page,
        pageSize: pageSize,
        pageSizes: [10, 20, 50],
        total,
        showSizePicker: true,
        onUpdatePage: handlePageChange,
        onUpdatePageSize: handlePageSizeChange,
      }"
      :row-key="(row: OperLog) => row.operId"
      striped
    />
  </n-card>
</template>

<style scoped>
.oper-log-page {
  height: 100%;
}

.search-card {
  margin-bottom: 16px;
}
</style>
