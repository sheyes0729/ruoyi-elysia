<route>
  {
    meta: {
      title: '字典管理',
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

interface DictType {
  dictId: number
  dictName: string
  dictType: string
  status: '0' | '1'
  createTime?: string
}

interface DictData {
  dictCode: number
  dictSort: number
  dictLabel: string
  dictValue: string
  dictType: string
  status: '0' | '1'
  cssClass?: string
  listClass?: string
}

const message = useMessage()
const loading = ref(false)
const dictTypes = ref<DictType[]>([])
const dictDataList = ref<DictData[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const selectedDictType = ref<DictType | null>(null)

const showTypeModal = ref(false)
const showDataModal = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)

const typeFormData = ref({
  dictId: undefined as number | undefined,
  dictName: '',
  dictType: '',
  status: '0' as '0' | '1',
})

const dataFormData = ref({
  dictCode: undefined as number | undefined,
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  status: '0' as '0' | '1',
  cssClass: '',
  listClass: 'default',
})

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
]

const listClassOptions = [
  { label: '默认', value: 'default' },
  { label: '主要', value: 'primary' },
  { label: '成功', value: 'success' },
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warning' },
  { label: '危险', value: 'danger' },
]

const typeColumns: DataTableColumns<DictType> = [
  { title: '字典编号', key: 'dictId', width: 100 },
  { title: '字典名称', key: 'dictName', width: 150 },
  { title: '字典类型', key: 'dictType', width: 150 },
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
          { size: 'small', text: true, type: 'primary', onClick: () => openEditType(row) },
          () => '编辑',
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDeleteType(row.dictId),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', text: true, type: 'error' }, () => '删除'),
            default: () => '确认删除该字典类型？',
          },
        ),
      ]),
  },
]

const dataColumns: DataTableColumns<DictData> = [
  { title: '字典编码', key: 'dictCode', width: 100 },
  { title: '字典标签', key: 'dictLabel', width: 150 },
  { title: '字典键值', key: 'dictValue', width: 150 },
  { title: '排序', key: 'dictSort', width: 80 },
  {
    title: '样式',
    key: 'listClass',
    width: 100,
    render: (row) => {
      return h(
        NTag,
        { type: row.listClass as any || 'default', size: 'small' },
        () => row.dictLabel,
      )
    },
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
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (row) =>
      h(NSpace, { size: 4 }, () => [
        h(
          NButton,
          { size: 'small', text: true, type: 'primary', onClick: () => openEditData(row) },
          () => '编辑',
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDeleteData(row.dictCode),
          },
          {
            trigger: () =>
              h(NButton, { size: 'small', text: true, type: 'error' }, () => '删除'),
            default: () => '确认删除该字典数据？',
          },
        ),
      ]),
  },
]

const fetchDictTypes = async () => {
  loading.value = true
  try {
    const res = await api.api.system.dict.type.list.get({
      $query: { pageNum: 1, pageSize: 100 },
    })
    if (res.data?.code === 200) {
      dictTypes.value = res.data.data.rows
    }
  } finally {
    loading.value = false
  }
}

const fetchDictData = async () => {
  if (!selectedDictType.value) return
  loading.value = true
  try {
    const res = await api.api.system.dict.data.list.get({
      $query: {
        pageNum: page.value,
        pageSize: pageSize.value,
        dictType: selectedDictType.value.dictType,
      },
    })
    if (res.data?.code === 200) {
      dictDataList.value = res.data.data.rows
      total.value = res.data.data.total
    }
  } finally {
    loading.value = false
  }
}

const handleSelectType = (row: DictType) => {
  selectedDictType.value = row
  page.value = 1
  fetchDictData()
}

const handlePageChange = (p: number) => {
  page.value = p
  fetchDictData()
}

const handlePageSizeChange = (ps: number) => {
  pageSize.value = ps
  page.value = 1
  fetchDictData()
}

// Type operations
const openAddType = () => {
  isEdit.value = false
  typeFormData.value = { dictId: undefined, dictName: '', dictType: '', status: '0' }
  showTypeModal.value = true
}

const openEditType = (type: DictType) => {
  isEdit.value = true
  typeFormData.value = {
    dictId: type.dictId,
    dictName: type.dictName,
    dictType: type.dictType,
    status: type.status,
  }
  showTypeModal.value = true
}

const handleTypeSubmit = async () => {
  if (!typeFormData.value.dictName || !typeFormData.value.dictType) {
    message.warning('请填写完整信息')
    return
  }
  modalLoading.value = true
  try {
    if (isEdit.value) {
      const res = await api.api.system.dict.type.edit.put({
        dictId: typeFormData.value.dictId!,
        dictName: typeFormData.value.dictName,
        dictType: typeFormData.value.dictType,
        status: typeFormData.value.status,
      })
      if (res.data?.code === 200) {
        message.success('修改成功')
        showTypeModal.value = false
        fetchDictTypes()
      } else {
        message.error(res.data?.msg || '修改失败')
      }
    } else {
      const res = await api.api.system.dict.type.add.post({
        dictName: typeFormData.value.dictName,
        dictType: typeFormData.value.dictType,
        status: typeFormData.value.status,
      })
      if (res.data?.code === 200) {
        message.success('新增成功')
        showTypeModal.value = false
        fetchDictTypes()
      } else {
        message.error(res.data?.msg || '新增失败')
      }
    }
  } finally {
    modalLoading.value = false
  }
}

const handleDeleteType = async (dictId: number) => {
  const res = await api.api.system.dict.type["batch"].delete({
    ids: [dictId],
  })
  if (res.data?.code === 200) {
    message.success('删除成功')
    if (selectedDictType.value?.dictId === dictId) {
      selectedDictType.value = null
      dictDataList.value = []
    }
    fetchDictTypes()
  } else {
    message.error(res.data?.msg || '删除失败')
  }
}

// Data operations
const openAddData = () => {
  if (!selectedDictType.value) {
    message.warning('请先选择字典类型')
    return
  }
  isEdit.value = false
  dataFormData.value = {
    dictCode: undefined,
    dictLabel: '',
    dictValue: '',
    dictSort: 0,
    status: '0',
    cssClass: '',
    listClass: 'default',
  }
  showDataModal.value = true
}

const openEditData = (data: DictData) => {
  isEdit.value = true
  dataFormData.value = {
    dictCode: data.dictCode,
    dictLabel: data.dictLabel,
    dictValue: data.dictValue,
    dictSort: data.dictSort,
    status: data.status,
    cssClass: data.cssClass || '',
    listClass: data.listClass || 'default',
  }
  showDataModal.value = true
}

const handleDataSubmit = async () => {
  if (!dataFormData.value.dictLabel || !dataFormData.value.dictValue) {
    message.warning('请填写完整信息')
    return
  }
  modalLoading.value = true
  try {
    if (isEdit.value) {
      const res = await api.api.system.dict.data.edit.put({
        dictCode: dataFormData.value.dictCode!,
        dictLabel: dataFormData.value.dictLabel,
        dictValue: dataFormData.value.dictValue,
        dictSort: dataFormData.value.dictSort,
        dictType: selectedDictType.value!.dictType,
        status: dataFormData.value.status,
      })
      if (res.data?.code === 200) {
        message.success('修改成功')
        showDataModal.value = false
        fetchDictData()
      } else {
        message.error(res.data?.msg || '修改失败')
      }
    } else {
      const res = await api.api.system.dict.data.add.post({
        dictType: selectedDictType.value!.dictType,
        dictLabel: dataFormData.value.dictLabel,
        dictValue: dataFormData.value.dictValue,
        dictSort: dataFormData.value.dictSort,
        status: dataFormData.value.status,
      })
      if (res.data?.code === 200) {
        message.success('新增成功')
        showDataModal.value = false
        fetchDictData()
      } else {
        message.error(res.data?.msg || '新增失败')
      }
    }
  } finally {
    modalLoading.value = false
  }
}

const handleDeleteData = async (dictCode: number) => {
  const res = await api.api.system.dict.data["batch"].delete({
    ids: [dictCode],
  })
  if (res.data?.code === 200) {
    message.success('删除成功')
    fetchDictData()
  } else {
    message.error(res.data?.msg || '删除失败')
  }
}

onMounted(() => {
  fetchDictTypes()
})
</script>

<template>
  <n-card title="字典管理" :bordered="false" class="dict-page">
    <template #header-extra>
      <n-space>
        <n-button type="primary" size="small" @click="openAddType">新增类型</n-button>
        <n-button
          type="primary"
          size="small"
          :disabled="!selectedDictType"
          @click="openAddData"
        >
          新增数据
        </n-button>
      </n-space>
    </template>

    <n-space :size="16" align="start">
      <n-card title="字典类型" :bordered="false" size="small" style="width: 350px">
        <n-data-table
          :columns="typeColumns"
          :data="dictTypes"
          :loading="loading"
          :row-key="(row: DictType) => row.dictId"
          :row-props="(row: DictType) => ({
            style: 'cursor: pointer',
            onClick: () => handleSelectType(row),
          })"
          :row-class-name="(row: DictType) =>
            selectedDictType?.dictId === row.dictId ? 'selected-row' : ''
          "
          striped
          size="small"
        />
      </n-card>

      <n-card title="字典数据" :bordered="false" size="small" style="flex: 1">
        <n-empty v-if="!selectedDictType" description="请选择字典类型" />
        <template v-else>
          <n-alert type="info" style="margin-bottom: 12px">
            当前类型：{{ selectedDictType.dictName }} ({{ selectedDictType.dictType }})
          </n-alert>
          <n-data-table
            :columns="dataColumns"
            :data="dictDataList"
            :loading="loading"
            :pagination="{
              page: page,
              pageSize: pageSize,
              pageSizes: [10, 20, 50],
              itemCount: total,
              showSizePicker: true,
              onUpdatePage: handlePageChange,
              onUpdatePageSize: handlePageSizeChange,
            }"
            :row-key="(row: DictData) => row.dictCode"
            striped
            size="small"
          />
        </template>
      </n-card>
    </n-space>
  </n-card>

  <!-- Type Modal -->
  <n-modal
    v-model:show="showTypeModal"
    :title="isEdit ? '编辑字典类型' : '新增字典类型'"
    preset="card"
    style="width: 500px"
    :mask-closable="false"
  >
    <n-form :model="typeFormData" label-placement="left" label-width="100">
      <n-form-item v-if="!isEdit" label="字典类型" path="dictType">
        <n-input v-model:value="typeFormData.dictType" placeholder="如: sys_user_sex" />
      </n-form-item>
      <n-form-item label="字典名称" path="dictName">
        <n-input v-model:value="typeFormData.dictName" placeholder="如: 用户性别" />
      </n-form-item>
      <n-form-item label="状态">
        <n-select v-model:value="typeFormData.status" :options="statusOptions" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="showTypeModal = false">取消</n-button>
        <n-button type="primary" :loading="modalLoading" @click="handleTypeSubmit">确定</n-button>
      </n-space>
    </template>
  </n-modal>

  <!-- Data Modal -->
  <n-modal
    v-model:show="showDataModal"
    :title="isEdit ? '编辑字典数据' : '新增字典数据'"
    preset="card"
    style="width: 500px"
    :mask-closable="false"
  >
    <n-form :model="dataFormData" label-placement="left" label-width="100">
      <n-form-item label="字典标签" path="dictLabel">
        <n-input v-model:value="dataFormData.dictLabel" placeholder="如: 男" />
      </n-form-item>
      <n-form-item label="字典键值" path="dictValue">
        <n-input v-model:value="dataFormData.dictValue" placeholder="如: 0" />
      </n-form-item>
      <n-form-item label="排序">
        <n-input-number v-model:value="dataFormData.dictSort" :min="0" />
      </n-form-item>
      <n-form-item label="样式">
        <n-select v-model:value="dataFormData.listClass" :options="listClassOptions" />
      </n-form-item>
      <n-form-item label="状态">
        <n-select v-model:value="dataFormData.status" :options="statusOptions" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="showDataModal = false">取消</n-button>
        <n-button type="primary" :loading="modalLoading" @click="handleDataSubmit">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.dict-page {
  height: 100%;
}
</style>
