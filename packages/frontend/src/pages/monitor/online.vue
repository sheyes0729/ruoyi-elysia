<route>
  {
    meta: {
      title: '在线用户',
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
  NPopconfirm,
  useMessage,
} from "naive-ui";
import type { DataTableColumns } from "naive-ui";
import { api } from "@/api";

interface OnlineSession {
  token: string;
  userId: number;
  username: string;
  loginTime: string;
  lastAccessTime: string;
  ip: string;
}

const message = useMessage();
const loading = ref(false);
const sessions = ref<OnlineSession[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const usernameSearch = ref("");

const columns: DataTableColumns<OnlineSession> = [
  { title: "用户ID", key: "userId", width: 80 },
  { title: "用户名", key: "username", width: 120 },
  { title: "登录IP", key: "ip", width: 150 },
  { title: "登录时间", key: "loginTime", width: 180 },
  { title: "最后访问", key: "lastAccessTime", width: 180 },
  {
    title: "操作",
    key: "actions",
    width: 120,
    fixed: "right",
    render: (row) =>
      h(
        NPopconfirm,
        {
          onPositiveClick: () => handleForceLogout(row.token),
        },
        {
          trigger: () =>
            h(
              NButton,
              { size: "small", text: true, type: "error" },
              () => "强制下线",
            ),
          default: () => "确认强制该用户下线？",
        },
      ),
  },
];

const fetchSessions = async () => {
  loading.value = true;
  try {
    const res = await api.api.monitor.online.list.get({
      $query: {
        pageNum: page.value,
        pageSize: pageSize.value,
        username: usernameSearch.value || "",
      },
    });
    if (res.data?.code === 200) {
      sessions.value = res.data.data.rows;
      total.value = res.data.data.total;
    }
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (p: number) => {
  page.value = p;
  fetchSessions();
};

const handlePageSizeChange = (ps: number) => {
  pageSize.value = ps;
  page.value = 1;
  fetchSessions();
};

const handleSearch = () => {
  page.value = 1;
  fetchSessions();
};

const handleForceLogout = async (token: string) => {
  const res = await api.api.monitor.online[":token"].delete({
    $query: { token },
  });
  if (res.data?.code === 200) {
    message.success("强制下线成功");
    fetchSessions();
  } else {
    message.error(res.data?.msg || "操作失败");
  }
};

let refreshTimer: number | null = null;

const startAutoRefresh = () => {
  refreshTimer = window.setInterval(() => {
    fetchSessions();
  }, 10000); // Refresh every 10 seconds
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

onMounted(() => {
  fetchSessions();
  startAutoRefresh();
});

onBeforeUnmount(() => {
  stopAutoRefresh();
});
</script>

<template>
  <n-card title="在线用户" :bordered="false" class="online-page">
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
        <n-button @click="fetchSessions">刷新</n-button>
      </n-space>
    </template>

    <n-data-table
      :columns="columns"
      :data="sessions"
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
      :row-key="(row: OnlineSession) => row.token"
      striped
    />
  </n-card>
</template>

<style scoped>
.online-page {
  height: 100%;
}
</style>
