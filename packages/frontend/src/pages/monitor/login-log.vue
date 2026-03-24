<route>
  {
    meta: {
      title: '登录日志',
    }
  }
</route>

<script setup lang="ts">
import { ref, onMounted, h } from "vue";
import {
  NCard,
  NDataTable,
  NButton,
  NSpace,
  NTag,
  NPopconfirm,
  useMessage,
} from "naive-ui";
import type { DataTableColumns } from "naive-ui";
import { api } from "@/api";

interface LoginLog {
  infoId: number;
  username: string;
  ip: string;
  status: "0" | "1";
  msg: string;
  loginTime: string;
}

const message = useMessage();
const loading = ref(false);
const logs = ref<LoginLog[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const usernameSearch = ref("");

const columns: DataTableColumns<LoginLog> = [
  { title: "访问编号", key: "infoId", width: 100 },
  { title: "用户名", key: "username", width: 120 },
  { title: "登录IP", key: "ip", width: 150 },
  { title: "登录时间", key: "loginTime", width: 180 },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row) =>
      h(
        NTag,
        { type: row.status === "0" ? "success" : "error", size: "small" },
        () => (row.status === "0" ? "成功" : "失败"),
      ),
  },
  { title: "提示消息", key: "msg", ellipsis: { tooltip: true } },
];

const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await api.api.monitor.logininfor.list.get({
      $query: {
        pageNum: page.value,
        pageSize: pageSize.value,
        username: usernameSearch.value || "",
      },
    });
    if (res.data?.code === 200) {
      logs.value = res.data.data.rows;
      total.value = res.data.data.total;
    }
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (p: number) => {
  page.value = p;
  fetchLogs();
};

const handlePageSizeChange = (ps: number) => {
  pageSize.value = ps;
  page.value = 1;
  fetchLogs();
};

const handleSearch = () => {
  page.value = 1;
  fetchLogs();
};

const handleClean = async () => {
  const res = await api.api.monitor.logininfor.clean.delete();
  if (res.data?.code === 200) {
    message.success("清理成功");
    fetchLogs();
  } else {
    message.error(res.data?.msg || "清理失败");
  }
};

onMounted(() => {
  fetchLogs();
});
</script>

<template>
  <n-card title="登录日志" :bordered="false" class="login-log-page">
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
        <n-popconfirm @positive-click="handleClean">
          <template #trigger>
            <n-button type="error">清空</n-button>
          </template>
          确认清空所有登录日志？
        </n-popconfirm>
      </n-space>
    </template>

    <n-data-table
      :columns="columns"
      :data="logs"
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
      :row-key="(row: LoginLog) => row.infoId"
      striped
    />
  </n-card>
</template>

<style scoped>
.login-log-page {
  height: 100%;
}
</style>
