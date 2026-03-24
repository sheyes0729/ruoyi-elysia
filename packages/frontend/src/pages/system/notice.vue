<route>
  {
    meta: {
      title: '通知公告',
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
import type { DataTableColumns } from 'naive-ui'
import { api } from '@/api'

interface Notice {
  noticeId: number
  noticeTitle: string
  noticeType: '1' | '2'
  status: '0' | '1'
  createBy?: string
  createTime?: string
}

const message = useMessage()
const loading = ref(false)
const notices = ref<Notice[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const noticeTitleSearch = ref('')

const showModal = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const formData = ref({
  noticeId: undefined as number | undefined,
  noticeTitle: '',
  noticeType: '1' as '1' | '2',
  noticeContent: '',
  status: '0' as '0' | '1',
})

const noticeTypeOptions = [
  { label: '通知', value: '1' },
  { label: '公告', value: '2' },
]

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
]

const columns: DataTableColumns<Notice> = [
  { title: '公告ID', key: 'noticeId', width: 80 },
  { title: '公告标题', key: 'noticeTitle', ellipsis: { tooltip: true } },
  {
    title: '公告类型',
    key: 'noticeType',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: row.noticeType === '1' ? 'info' : 'warning', size: 'small' },
        () => (row.noticeType === '1' ? '通知' : '公告'),
      ),
  },
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
  { title: '创建时间', key: 'createTime', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 120,
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
            onPositiveClick: () => handleDelete(row.noticeId),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', text: true, type: 'error' }, () => '删除'),
            default: () => '确认删除该公告？',
          },
        ),
      ]),
  },
]

const fetchNotices = async () => {
  loading.value = true
  try {
    const res = await api.api.system.notice.list.get({
      query: {
        pageNum: page.value,
        pageSize: pageSize.value,
        noticeTitle: noticeTitleSearch.value || undefined,
      },
    })
    if (res.data?.code === 200) {
      notices.value = res.data.data.rows
      total.value = res.data.data.total
    }
  } finally {
    loading.value = false
  }
}

const handlePageChange = (p: number) => {
  page.value = p
  fetchNotices()
}

const handlePageSizeChange = (ps: number) => {
  pageSize.value = ps
  page.value = 1
  fetchNotices()
}

const handleSearch = () => {
  page.value = 1
  fetchNotices()
}

const openAdd = () => {
  isEdit.value = false
  formData.value = {
    noticeId: undefined,
    noticeTitle: '',
    noticeType: '1',
    noticeContent: '',
    status: '0',
  }
  showModal.value = true
}

const openEdit = (notice: Notice) => {
  isEdit.value = true
  formData.value = {
    noticeId: notice.noticeId,
    noticeTitle: notice.noticeTitle,
    noticeType: notice.noticeType,
    noticeContent: '',
    status: notice.status,
  }
  showModal.value = true
}

const handleSubmit = async () => {
  if (!formData.value.noticeTitle) {
    message.warning('请输入公告标题')
    return
  }
  modalLoading.value = true
  try {
    if (isEdit.value) {
      const res = await api.api.system.notice.edit.put({
        body: {
          noticeId: formData.value.noticeId!,
          noticeTitle: formData.value.noticeTitle,
          noticeType: formData.value.noticeType,
          status: formData.value.status,
        },
      })
      if (res.data?.code === 200) {
        message.success('修改成功')
        showModal.value = false
        fetchNotices()
      } else {
        message.error(res.data?.msg || '修改失败')
      }
    } else {
      const res = await api.api.system.notice.add.post({
        body: {
          noticeTitle: formData.value.noticeTitle,
          noticeType: formData.value.noticeType,
          status: formData.value.status,
        },
      })
      if (res.data?.code === 200) {
        message.success('新增成功')
        showModal.value = false
        fetchNotices()
      } else {
        message.error(res.data?.msg || '新增失败')
      }
    }
  } finally {
    modalLoading.value = false
  }
}

const handleDelete = async (noticeId: number) => {
  const res = await api.api.system.notice["batch"].delete({
    body: { ids: [noticeId] },
  })
  if (res.data?.code === 200) {
    message.success('删除成功')
    fetchNotices()
  } else {
    message.error(res.data?.msg || '删除失败')
  }
}

onMounted(() => {
  fetchNotices()
})
</script>

<template>
  <n-card title="通知公告" :bordered="false" class="notice-page">
    <template #header-extra>
      <n-space>
        <n-input
          v-model:value="noticeTitleSearch"
          placeholder="搜索公告标题"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <n-button type="primary" @click="handleSearch">查询</n-button>
        <n-button type="primary" @click="openAdd">新增公告</n-button>
      </n-space>
    </template>

    <n-data-table
      :columns="columns"
      :data="notices"
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
      :row-key="(row: Notice) => row.noticeId"
      striped
    />
  </n-card>

  <n-modal
    v-model:show="showModal"
    :title="isEdit ? '编辑公告' : '新增公告'"
    preset="card"
    style="width: 600px"
    :mask-closable="false"
  >
    <n-form :model="formData" label-placement="left" label-width="100">
      <n-form-item label="公告标题" path="noticeTitle">
        <n-input v-model:value="formData.noticeTitle" placeholder="请输入公告标题" />
      </n-form-item>
      <n-form-item label="公告类型">
        <n-select v-model:value="formData.noticeType" :options="noticeTypeOptions" />
      </n-form-item>
      <n-form-item label="状态">
        <n-select v-model:value="formData.status" :options="statusOptions" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" :loading="modalLoading" @click="handleSubmit">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.notice-page {
  height: 100%;
}
</style>
