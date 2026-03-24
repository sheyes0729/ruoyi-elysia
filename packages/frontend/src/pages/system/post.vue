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
  NInputNumber,
  NSelect,
  NPopconfirm,
  useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { api } from '@/api'

interface Post {
  postId: number
  postCode: string
  postName: string
  postSort: number
  status: '0' | '1'
  createTime?: string
}

const message = useMessage()
const loading = ref(false)
const posts = ref<Post[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const postNameSearch = ref('')

const showModal = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const formData = ref({
  postId: undefined as number | undefined,
  postCode: '',
  postName: '',
  postSort: 0,
  status: '0' as '0' | '1',
})

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
]

const columns: DataTableColumns<Post> = [
  { title: '岗位ID', key: 'postId', width: 100 },
  { title: '岗位编码', key: 'postCode', width: 150 },
  { title: '岗位名称', key: 'postName', width: 150 },
  { title: '排序', key: 'postSort', width: 80 },
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
            onPositiveClick: () => handleDelete(row.postId),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', text: true, type: 'error' }, () => '删除'),
            default: () => '确认删除该岗位？',
          },
        ),
      ]),
  },
]

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await api.api.system.post.list.get({
      query: {
        pageNum: page.value,
        pageSize: pageSize.value,
        postName: postNameSearch.value || undefined,
      },
    })
    if (res.data?.code === 200) {
      posts.value = res.data.data.rows
      total.value = res.data.data.total
    }
  } finally {
    loading.value = false
  }
}

const handlePageChange = (p: number) => {
  page.value = p
  fetchPosts()
}

const handlePageSizeChange = (ps: number) => {
  pageSize.value = ps
  page.value = 1
  fetchPosts()
}

const handleSearch = () => {
  page.value = 1
  fetchPosts()
}

const openAdd = () => {
  isEdit.value = false
  formData.value = {
    postId: undefined,
    postCode: '',
    postName: '',
    postSort: 0,
    status: '0',
  }
  showModal.value = true
}

const openEdit = (post: Post) => {
  isEdit.value = true
  formData.value = {
    postId: post.postId,
    postCode: post.postCode,
    postName: post.postName,
    postSort: post.postSort,
    status: post.status,
  }
  showModal.value = true
}

const handleSubmit = async () => {
  if (!formData.value.postCode || !formData.value.postName) {
    message.warning('请填写完整信息')
    return
  }
  modalLoading.value = true
  try {
    if (isEdit.value) {
      const res = await api.api.system.post.edit.put({
        body: {
          postId: formData.value.postId!,
          postName: formData.value.postName,
          postSort: formData.value.postSort,
          status: formData.value.status,
        },
      })
      if (res.data?.code === 200) {
        message.success('修改成功')
        showModal.value = false
        fetchPosts()
      } else {
        message.error(res.data?.msg || '修改失败')
      }
    } else {
      const res = await api.api.system.post.add.post({
        body: {
          postCode: formData.value.postCode,
          postName: formData.value.postName,
          postSort: formData.value.postSort,
          status: formData.value.status,
        },
      })
      if (res.data?.code === 200) {
        message.success('新增成功')
        showModal.value = false
        fetchPosts()
      } else {
        message.error(res.data?.msg || '新增失败')
      }
    }
  } finally {
    modalLoading.value = false
  }
}

const handleDelete = async (postId: number) => {
  const res = await api.api.system.post["batch"].delete({
    body: { ids: [postId] },
  })
  if (res.data?.code === 200) {
    message.success('删除成功')
    fetchPosts()
  } else {
    message.error(res.data?.msg || '删除失败')
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <n-card title="岗位管理" :bordered="false" class="post-page">
    <template #header-extra>
      <n-space>
        <n-input
          v-model:value="postNameSearch"
          placeholder="搜索岗位名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <n-button type="primary" @click="handleSearch">查询</n-button>
        <n-button type="primary" @click="openAdd">新增岗位</n-button>
      </n-space>
    </template>

    <n-data-table
      :columns="columns"
      :data="posts"
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
      :row-key="(row: Post) => row.postId"
      striped
    />
  </n-card>

  <n-modal
    v-model:show="showModal"
    :title="isEdit ? '编辑岗位' : '新增岗位'"
    preset="card"
    style="width: 500px"
    :mask-closable="false"
  >
    <n-form :model="formData" label-placement="left" label-width="100">
      <n-form-item v-if="!isEdit" label="岗位编码" path="postCode">
        <n-input v-model:value="formData.postCode" placeholder="如: CEO,Manager" />
      </n-form-item>
      <n-form-item label="岗位名称" path="postName">
        <n-input v-model:value="formData.postName" placeholder="如: 董事长, 经理" />
      </n-form-item>
      <n-form-item label="排序">
        <n-input-number v-model:value="formData.postSort" :min="0" />
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
.post-page {
  height: 100%;
}
</style>
