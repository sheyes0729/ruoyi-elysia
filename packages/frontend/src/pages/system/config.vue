<route>
  {
    meta: {
      title: '参数配置',
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

interface Config {
  configId: number
  configName: string
  configKey: string
  configValue: string
  configType: 'Y' | 'N'
  createTime?: string
}

const message = useMessage()
const loading = ref(false)
const configs = ref<Config[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const configNameSearch = ref('')
const configKeySearch = ref('')

const showModal = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const formData = ref({
  configId: undefined as number | undefined,
  configName: '',
  configKey: '',
  configValue: '',
  configType: 'N' as 'Y' | 'N',
})

const typeOptions = [
  { label: '系统内置', value: 'Y' },
  { label: '可修改', value: 'N' },
]

const columns: DataTableColumns<Config> = [
  { title: '参数主键', key: 'configId', width: 100 },
  { title: '参数名称', key: 'configName', width: 200 },
  { title: '参数键名', key: 'configKey', width: 200 },
  { title: '参数键值', key: 'configValue', ellipsis: { tooltip: true } },
  {
    title: '系统内置',
    key: 'configType',
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: row.configType === 'Y' ? 'success' : 'default', size: 'small' },
        () => (row.configType === 'Y' ? '是' : '否'),
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
            onPositiveClick: () => handleDelete(row.configId),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', text: true, type: 'error' }, () => '删除'),
            default: () => '确认删除该参数？',
          },
        ),
      ]),
  },
]

const fetchConfigs = async () => {
  loading.value = true
  try {
    const res = await api.api.system.config.list.get({
      query: {
        pageNum: page.value,
        pageSize: pageSize.value,
        configName: configNameSearch.value || undefined,
        configKey: configKeySearch.value || undefined,
      },
    })
    if (res.data?.code === 200) {
      configs.value = res.data.data.rows
      total.value = res.data.data.total
    }
  } finally {
    loading.value = false
  }
}

const handlePageChange = (p: number) => {
  page.value = p
  fetchConfigs()
}

const handlePageSizeChange = (ps: number) => {
  pageSize.value = ps
  page.value = 1
  fetchConfigs()
}

const handleSearch = () => {
  page.value = 1
  fetchConfigs()
}

const openAdd = () => {
  isEdit.value = false
  formData.value = {
    configId: undefined,
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'N',
  }
  showModal.value = true
}

const openEdit = (config: Config) => {
  isEdit.value = true
  formData.value = {
    configId: config.configId,
    configName: config.configName,
    configKey: config.configKey,
    configValue: config.configValue,
    configType: config.configType,
  }
  showModal.value = true
}

const handleSubmit = async () => {
  if (!formData.value.configName || !formData.value.configKey) {
    message.warning('请填写完整信息')
    return
  }
  modalLoading.value = true
  try {
    if (isEdit.value) {
      const res = await api.api.system.config.edit.put({
        body: {
          configId: formData.value.configId!,
          configName: formData.value.configName,
          configKey: formData.value.configKey,
          configValue: formData.value.configValue,
          configType: formData.value.configType,
        },
      })
      if (res.data?.code === 200) {
        message.success('修改成功')
        showModal.value = false
        fetchConfigs()
      } else {
        message.error(res.data?.msg || '修改失败')
      }
    } else {
      const res = await api.api.system.config.add.post({
        body: {
          configName: formData.value.configName,
          configKey: formData.value.configKey,
          configValue: formData.value.configValue,
          configType: formData.value.configType,
        },
      })
      if (res.data?.code === 200) {
        message.success('新增成功')
        showModal.value = false
        fetchConfigs()
      } else {
        message.error(res.data?.msg || '新增失败')
      }
    }
  } finally {
    modalLoading.value = false
  }
}

const handleDelete = async (configId: number) => {
  const res = await api.api.system.config["batch"].delete({
    body: { ids: [configId] },
  })
  if (res.data?.code === 200) {
    message.success('删除成功')
    fetchConfigs()
  } else {
    message.error(res.data?.msg || '删除失败')
  }
}

onMounted(() => {
  fetchConfigs()
})
</script>

<template>
  <n-card title="参数配置" :bordered="false" class="config-page">
    <template #header-extra>
      <n-space>
        <n-input
          v-model:value="configNameSearch"
          placeholder="搜索参数名称"
          clearable
          style="width: 150px"
          @keyup.enter="handleSearch"
        />
        <n-input
          v-model:value="configKeySearch"
          placeholder="搜索参数键名"
          clearable
          style="width: 150px"
          @keyup.enter="handleSearch"
        />
        <n-button type="primary" @click="handleSearch">查询</n-button>
        <n-button type="primary" @click="openAdd">新增参数</n-button>
      </n-space>
    </template>

    <n-data-table
      :columns="columns"
      :data="configs"
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
      :row-key="(row: Config) => row.configId"
      striped
    />
  </n-card>

  <n-modal
    v-model:show="showModal"
    :title="isEdit ? '编辑参数' : '新增参数'"
    preset="card"
    style="width: 500px"
    :mask-closable="false"
  >
    <n-form :model="formData" label-placement="left" label-width="100">
      <n-form-item label="参数名称" path="configName">
        <n-input v-model:value="formData.configName" placeholder="如: 默认皮肤" />
      </n-form-item>
      <n-form-item label="参数键名" path="configKey">
        <n-input v-model:value="formData.configKey" placeholder="如: sys.index.skinName" />
      </n-form-item>
      <n-form-item label="参数键值" path="configValue">
        <n-input v-model:value="formData.configValue" placeholder="请输入参数值" />
      </n-form-item>
      <n-form-item label="系统内置">
        <n-select v-model:value="formData.configType" :options="typeOptions" />
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
.config-page {
  height: 100%;
}
</style>
