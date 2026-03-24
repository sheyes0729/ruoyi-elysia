<route>
  {
    meta: {
      title: '菜单管理',
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
} from "naive-ui";
import { api } from "@/api";

interface MenuItem {
  menuId: number;
  menuName: string;
  parentId: number;
  orderNum: number;
  path: string;
  component: string;
  menuType: "M" | "C" | "F";
  perms: string;
  visible: "0" | "1";
  status: "0" | "1";
  children?: MenuItem[];
}

const message = useMessage();
const loading = ref(false);
const menus = ref<MenuItem[]>([]);
const expandedKeys = ref<(string | number)[]>([]);
const selectedMenu = ref<MenuItem | null>(null);

const showModal = ref(false);
const modalLoading = ref(false);
const isEdit = ref(false);
const formData = ref({
  menuId: undefined as number | undefined,
  parentId: 0,
  menuName: "",
  orderNum: 0,
  path: "",
  component: "",
  menuType: "C" as "M" | "C" | "F",
  perms: "",
  visible: "0" as "0" | "1",
  status: "0" as "0" | "1",
});

const menuTypeOptions = [
  { label: "目录", value: "M" },
  { label: "菜单", value: "C" },
  { label: "按钮", value: "F" },
];

const visibleOptions = [
  { label: "显示", value: "0" },
  { label: "隐藏", value: "1" },
];

const statusOptions = [
  { label: "正常", value: "0" },
  { label: "停用", value: "1" },
];

const parentMenuOptions = ref<{ label: string; value: number }[]>([]);

const buildMenuOptions = (
  menuList: MenuItem[],
  depth = 0,
): { label: string; value: number }[] => {
  const result: { label: string; value: number }[] = [];
  for (const menu of menuList) {
    result.push({
      label: "　".repeat(depth) + menu.menuName,
      value: menu.menuId,
    });
    if (menu.children && menu.children.length > 0) {
      result.push(...buildMenuOptions(menu.children, depth + 1));
    }
  }
  return result;
};

const buildTree = (
  menuList: MenuItem[],
): MenuItem[] => {
  const map = new Map<number, MenuItem>();
  const roots: MenuItem[] = [];

  for (const menu of menuList) {
    map.set(menu.menuId, { ...menu, children: [] });
  }

  for (const menu of map.values()) {
    if (menu.parentId === 0 || !map.has(menu.parentId)) {
      roots.push(menu);
    } else {
      const parent = map.get(menu.parentId);
      parent?.children?.push(menu);
    }
  }

  return roots;
};

const getMenuTypeTagType = (type: string) => {
  switch (type) {
    case "M":
      return "warning";
    case "C":
      return "success";
    case "F":
      return "info";
    default:
      return "default";
  }
};

const getMenuTypeLabel = (type: string) => {
  switch (type) {
    case "M":
      return "目录";
    case "C":
      return "菜单";
    case "F":
      return "按钮";
    default:
      return type;
  }
};

const fetchMenus = async () => {
  loading.value = true;
  try {
    const res = await api.api.system.menu.list.get({
      $query: {
        pageNum: 1,
        pageSize: 100,
      },
    });
    if (res.data?.code === 200) {
      const menuRows = res.data.data.rows;
      const treeData = buildTree(menuRows);
      menus.value = treeData;
      parentMenuOptions.value = [
        { label: "顶级菜单", value: 0 },
        ...buildMenuOptions(treeData),
      ];
      expandedKeys.value = treeData.map((m: MenuItem) => m.menuId);
    }
  } finally {
    loading.value = false;
  }
};

const handleSelect = (_keys: (string | number)[], option: any[]) => {
  if (option && option.length > 0) {
    selectedMenu.value = option[0].rawNode as MenuItem;
  } else {
    selectedMenu.value = null;
  }
};

const openAdd = () => {
  isEdit.value = false;
  formData.value = {
    menuId: undefined,
    parentId: selectedMenu.value?.menuId || 0,
    menuName: "",
    orderNum: 0,
    path: "",
    component: "",
    menuType: "C",
    perms: "",
    visible: "0",
    status: "0",
  };
  showModal.value = true;
};

const openEdit = () => {
  if (!selectedMenu.value) {
    message.warning("请先选择菜单");
    return;
  }
  isEdit.value = true;
  formData.value = {
    menuId: selectedMenu.value.menuId,
    parentId: selectedMenu.value.parentId,
    menuName: selectedMenu.value.menuName,
    orderNum: selectedMenu.value.orderNum,
    path: selectedMenu.value.path,
    component: selectedMenu.value.component,
    menuType: selectedMenu.value.menuType,
    perms: selectedMenu.value.perms,
    visible: selectedMenu.value.visible,
    status: selectedMenu.value.status,
  };
  showModal.value = true;
};

const handleSubmit = async () => {
  if (!formData.value.menuName || !formData.value.path) {
    message.warning("请填写完整信息");
    return;
  }
  modalLoading.value = true;
  try {
    if (isEdit.value) {
      const res = await api.api.system.menu.edit.put({
        menuId: formData.value.menuId!,
        parentId: formData.value.parentId,
        menuName: formData.value.menuName,
        orderNum: formData.value.orderNum,
        path: formData.value.path,
        component: formData.value.component,
        menuType: formData.value.menuType,
        perms: formData.value.perms,
        visible: formData.value.visible,
        status: formData.value.status,
      });
      if (res.data?.code === 200) {
        message.success("修改成功");
        showModal.value = false;
        fetchMenus();
      } else {
        message.error(res.data?.msg || "修改失败");
      }
    } else {
      const res = await api.api.system.menu.add.post({
        parentId: formData.value.parentId,
        menuName: formData.value.menuName,
        orderNum: formData.value.orderNum,
        path: formData.value.path,
        component: formData.value.component,
        menuType: formData.value.menuType,
        perms: formData.value.perms,
        visible: formData.value.visible,
        status: formData.value.status,
      });
      if (res.data?.code === 200) {
        message.success("新增成功");
        showModal.value = false;
        fetchMenus();
      } else {
        message.error(res.data?.msg || "新增失败");
      }
    }
  } finally {
    modalLoading.value = false;
  }
};

const handleDelete = async () => {
  if (!selectedMenu.value) {
    message.warning("请先选择菜单");
    return;
  }
  const res = await api.api.system.menu["batch"].delete({
    ids: [selectedMenu.value.menuId],
  });
  if (res.data?.code === 200) {
    message.success("删除成功");
    selectedMenu.value = null;
    fetchMenus();
  } else {
    message.error(res.data?.msg || "删除失败");
  }
};

const renderLabel = (node: MenuItem) => {
  return h(NSpace, { size: 4 }, () => [
    h("span", {}, node.menuName),
    h(NTag, { size: "small", type: getMenuTypeTagType(node.menuType) }, () =>
      getMenuTypeLabel(node.menuType),
    ),
    h(
      NTag,
      { size: "small", type: node.status === "0" ? "success" : "error" },
      () => (node.status === "0" ? "正常" : "停用"),
    ),
  ]);
};

onMounted(() => {
  fetchMenus();
});
</script>

<template>
  <n-card title="菜单管理" :bordered="false" class="menu-page">
    <template #header-extra>
      <n-space>
        <n-button type="primary" size="small" @click="openAdd"
          >新增菜单</n-button
        >
        <n-button
          type="primary"
          size="small"
          :disabled="!selectedMenu"
          @click="openEdit"
        >
          编辑
        </n-button>
        <n-popconfirm @positive-click="handleDelete">
          <template #trigger>
            <n-button type="error" size="small" :disabled="!selectedMenu"
              >删除</n-button
            >
          </template>
          确认删除该菜单？
        </n-popconfirm>
      </n-space>
    </template>

    <n-space :size="16" align="start">
      <n-card
        title="菜单列表"
        :bordered="false"
        size="small"
        style="width: 400px"
      >
        <n-tree
          :data="menus"
          :expanded-keys="expandedKeys"
          :selected-keys="selectedMenu ? [selectedMenu.menuId] : []"
          block-line
          expand-on-click
          @update:expanded-keys="(keys) => (expandedKeys = keys)"
          @update:selected-keys="handleSelect"
          :render-label="(node: any) => renderLabel(node)"
          :node-props="(node: any) => ({ dataKey: node.menuId })"
        />
      </n-card>

      <n-card title="菜单详情" :bordered="false" size="small" style="flex: 1">
        <n-empty v-if="!selectedMenu" description="请选择菜单" />
        <n-descriptions v-else :column="2" label-placement="left" bordered>
          <n-descriptions-item label="菜单ID">{{
            selectedMenu.menuId
          }}</n-descriptions-item>
          <n-descriptions-item label="菜单名称">{{
            selectedMenu.menuName
          }}</n-descriptions-item>
          <n-descriptions-item label="菜单类型">
            <n-tag
              :type="getMenuTypeTagType(selectedMenu.menuType)"
              size="small"
            >
              {{ getMenuTypeLabel(selectedMenu.menuType) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="路由路径">{{
            selectedMenu.path
          }}</n-descriptions-item>
          <n-descriptions-item label="组件路径">{{
            selectedMenu.component
          }}</n-descriptions-item>
          <n-descriptions-item label="权限标识">{{
            selectedMenu.perms
          }}</n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag
              :type="selectedMenu.status === '0' ? 'success' : 'error'"
              size="small"
            >
              {{ selectedMenu.status === "0" ? "正常" : "停用" }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="排序">{{
            selectedMenu.orderNum
          }}</n-descriptions-item>
        </n-descriptions>
      </n-card>
    </n-space>
  </n-card>

  <n-modal
    v-model:show="showModal"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    preset="card"
    style="width: 600px"
    :mask-closable="false"
  >
    <n-form :model="formData" label-placement="left" label-width="100">
      <n-form-item label="上级菜单">
        <n-select
          v-model:value="formData.parentId"
          :options="parentMenuOptions"
        />
      </n-form-item>
      <n-form-item label="菜单类型">
        <n-select
          v-model:value="formData.menuType"
          :options="menuTypeOptions"
        />
      </n-form-item>
      <n-form-item label="菜单名称" path="menuName">
        <n-input
          v-model:value="formData.menuName"
          placeholder="请输入菜单名称"
        />
      </n-form-item>
      <n-form-item label="路由路径" path="path">
        <n-input v-model:value="formData.path" placeholder="如: /system/user" />
      </n-form-item>
      <n-form-item v-if="formData.menuType === 'C'" label="组件路径">
        <n-input
          v-model:value="formData.component"
          placeholder="如: system/user/index"
        />
      </n-form-item>
      <n-form-item label="权限标识">
        <n-input
          v-model:value="formData.perms"
          placeholder="如: system:user:list"
        />
      </n-form-item>
      <n-form-item label="排序">
        <n-input-number v-model:value="formData.orderNum" :min="0" />
      </n-form-item>
      <n-form-item label="显示状态">
        <n-select v-model:value="formData.visible" :options="visibleOptions" />
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
.menu-page {
  height: 100%;
}
</style>
