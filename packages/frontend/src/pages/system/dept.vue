<route>
  {
    meta: {
      title: '部门管理',
    }
  }
</route>

<script setup lang="ts">
import { ref, onMounted, h } from "vue";
import {
  NCard,
  NTree,
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
  NEmpty,
  type TreeOption,
} from "naive-ui";
import { api } from "@/api";

interface DeptTreeItem {
  deptId: number;
  parentId: number;
  deptName: string;
  orderNum: number;
  status: "0" | "1";
  children?: DeptTreeItem[];
}

const message = useMessage();
const loading = ref(false);
const depts = ref<DeptTreeItem[]>([]);
const expandedKeys = ref<(string | number)[]>([]);
const selectedDept = ref<DeptTreeItem | null>(null);

const showModal = ref(false);
const modalLoading = ref(false);
const isEdit = ref(false);
const formData = ref({
  deptId: undefined as number | undefined,
  parentId: 0 as number,
  deptName: "",
  orderNum: 1,
  status: "0" as "0" | "1",
});

const parentDeptOptions = ref<{ label: string; value: number }[]>([]);

const statusOptions = [
  { label: "正常", value: "0" },
  { label: "停用", value: "1" },
];

const buildDeptOptions = (
  deptList: DeptTreeItem[],
  depth = 0,
): { label: string; value: number }[] => {
  const result: { label: string; value: number }[] = [];
  for (const dept of deptList) {
    result.push({
      label: "　".repeat(depth) + dept.deptName,
      value: dept.deptId,
    });
    if (dept.children && dept.children.length > 0) {
      result.push(...buildDeptOptions(dept.children, depth + 1));
    }
  }
  return result;
};

const flattenDepts = (deptList: DeptTreeItem[]): DeptTreeItem[] => {
  const result: DeptTreeItem[] = [];
  for (const dept of deptList) {
    result.push(dept);
    if (dept.children && dept.children.length > 0) {
      result.push(...flattenDepts(dept.children));
    }
  }
  return result;
};

const fetchDepts = async () => {
  loading.value = true;
  try {
    const res = await api.api.system.dept.list.get({
      $query: {},
    });
    if (res.data?.code === 200) {
      depts.value = res.data.data;
      flattenDepts(res.data.data);
      parentDeptOptions.value = [
        { label: "顶级部门", value: 0 },
        ...buildDeptOptions(res.data.data),
      ];
      expandedKeys.value = res.data.data.map((d: DeptTreeItem) => d.deptId);
    }
  } finally {
    loading.value = false;
  }
};

const handleSelect = (
  _: Array<string | number>,
  __: Array<TreeOption | null>,
  meta: {
    node: TreeOption | null;
    action: "select" | "unselect";
  },
) => {
  if (meta.node) {
    selectedDept.value = meta.node as unknown as DeptTreeItem;
  } else {
    selectedDept.value = null;
  }
};

const openAdd = () => {
  isEdit.value = false;
  formData.value = {
    deptId: undefined,
    parentId: selectedDept.value?.deptId || 0,
    deptName: "",
    orderNum: 1,
    status: "0",
  };
  showModal.value = true;
};

const openEdit = () => {
  if (!selectedDept.value) {
    message.warning("请先选择部门");
    return;
  }
  isEdit.value = true;
  formData.value = {
    deptId: selectedDept.value.deptId,
    parentId: selectedDept.value.parentId,
    deptName: selectedDept.value.deptName,
    orderNum: selectedDept.value.orderNum,
    status: selectedDept.value.status,
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  if (!formData.value.deptName) {
    message.warning("请输入部门名称");
    return;
  }
  modalLoading.value = true;
  try {
    if (isEdit.value) {
      const res = await api.api.system.dept.edit.put({
        deptId: formData.value.deptId!,
        parentId: formData.value.parentId,
        deptName: formData.value.deptName,
        orderNum: formData.value.orderNum,
        status: formData.value.status,
      });
      if (res.data?.code === 200) {
        message.success("修改成功");
        showModal.value = false;
        fetchDepts();
      } else {
        message.error(res.data?.msg || "修改失败");
      }
    } else {
      const res = await api.api.system.dept.add.post({
        parentId: formData.value.parentId,
        deptName: formData.value.deptName,
        orderNum: formData.value.orderNum,
        status: formData.value.status,
      });
      if (res.data?.code === 200) {
        message.success("新增成功");
        showModal.value = false;
        fetchDepts();
      } else {
        message.error(res.data?.msg || "新增失败");
      }
    }
  } finally {
    modalLoading.value = false;
  }
};

const handleDelete = async () => {
  if (!selectedDept.value) {
    message.warning("请先选择部门");
    return;
  }
  const res = await api.api.system.dept["batch"].delete({
    ids: [selectedDept.value.deptId],
  });
  if (res.data?.code === 200) {
    message.success("删除成功");
    selectedDept.value = null;
    fetchDepts();
  } else {
    message.error(res.data?.msg || "删除失败");
  }
};

const renderLabel = (node: {
  check: boolean;
  option: DeptTreeItem;
  selected: boolean;
}) => {
  console.log("node:", node);

  return h(NSpace, { size: 4 }, () => [
    h("span", {}, node.option.deptName),
    h(
      NTag,
      { size: "small", type: node.option.status === "0" ? "success" : "error" },
      () => (node.option.status === "0" ? "正常" : "停用"),
    ),
  ]);
};

onMounted(() => {
  fetchDepts();
});
</script>

<template>
  <n-card title="部门管理" :bordered="false" class="dept-page">
    <template #header-extra>
      <n-space>
        <n-button type="primary" size="small" @click="openAdd"
          >新增部门</n-button
        >
        <n-button
          type="primary"
          size="small"
          :disabled="!selectedDept"
          @click="openEdit"
        >
          编辑
        </n-button>
        <n-popconfirm @positive-click="handleDelete">
          <template #trigger>
            <n-button type="error" size="small" :disabled="!selectedDept"
              >删除</n-button
            >
          </template>
          确认删除该部门？
        </n-popconfirm>
      </n-space>
    </template>

    <n-space :size="16" align="start">
      <n-card
        title="部门列表"
        :bordered="false"
        size="small"
        style="width: 350px"
      >
        <n-tree
          :data="depts"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedDept ? [selectedDept.deptId] : []"
          block-line
          expand-on-click
          @update:expanded-keys="(keys) => (expandedKeys = keys)"
          @update:selected-keys="handleSelect"
          :render-label="(node: any) => renderLabel(node)"
          :node-props="(node: any) => ({ dataKey: node.option.deptId })"
        />
      </n-card>

      <n-card title="部门详情" :bordered="false" size="small" style="flex: 1">
        <n-empty v-if="!selectedDept" description="请选择部门" />
        <nDescriptions v-else :column="2" label-placement="left" bordered>
          <nDescriptionsItem label="部门ID">{{
            selectedDept.deptId
          }}</nDescriptionsItem>
          <nDescriptionsItem label="部门名称">{{
            selectedDept.deptName
          }}</nDescriptionsItem>
          <nDescriptionsItem label="状态">
            <n-tag
              :type="selectedDept.status === '0' ? 'success' : 'error'"
              size="small"
            >
              {{ selectedDept.status === "0" ? "正常" : "停用" }}
            </n-tag>
          </nDescriptionsItem>
          <nDescriptionsItem label="排序">{{
            selectedDept.orderNum
          }}</nDescriptionsItem>
        </nDescriptions>
      </n-card>
    </n-space>
  </n-card>

  <n-modal
    v-model:show="showModal"
    :title="isEdit ? '编辑部门' : '新增部门'"
    preset="card"
    style="width: 500px"
    :mask-closable="false"
  >
    <n-form :model="formData" label-placement="left" label-width="100">
      <n-form-item label="上级部门">
        <n-select
          v-model:value="formData.parentId"
          :options="parentDeptOptions"
        />
      </n-form-item>
      <n-form-item label="部门名称" path="deptName">
        <n-input
          v-model:value="formData.deptName"
          placeholder="请输入部门名称"
        />
      </n-form-item>
      <n-form-item label="排序">
        <n-input-number
          v-model:value="formData.orderNum"
          :min="0"
          :max="9999"
        />
      </n-form-item>
      <n-form-item label="状态">
        <n-select v-model:value="formData.status" :options="statusOptions" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" :loading="modalLoading" @click="handleSubmit"
          >确定</n-button
        >
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.dept-page {
  height: 100%;
}
</style>
