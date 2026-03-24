<route>
  {
    meta: {
      title: '工作台',
    }
  }
</route>

<script setup lang="ts">
import { NCard, NGrid, NGi, NTag, NStatistic, NSpin } from "naive-ui";
import { Icon } from "@iconify/vue";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { api } from "@/api";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const stats = ref([
  {
    label: "用户总数",
    value: 0,
    icon: "lucide:users",
    color: "#18a058",
    loading: true,
  },
  {
    label: "角色总数",
    value: 0,
    icon: "lucide:shield",
    color: "#2080f0",
    loading: true,
  },
  {
    label: "在线用户",
    value: 0,
    icon: "lucide:activity",
    color: "#d03050",
    loading: true,
  },
  {
    label: "操作日志",
    value: 0,
    icon: "lucide:file-text",
    color: "#f0a020",
    loading: true,
  },
]);

const shortcuts = [
  {
    label: "用户管理",
    icon: "lucide:user-plus",
    route: "/system/user",
    color: "#18a058",
  },
  {
    label: "角色管理",
    icon: "lucide:shield-plus",
    route: "/system/role",
    color: "#2080f0",
  },
  {
    label: "菜单管理",
    icon: "lucide:list",
    route: "/system/menu",
    color: "#f0a020",
  },
  {
    label: "部门管理",
    icon: "lucide:building",
    route: "/system/dept",
    color: "#d03050",
  },
  {
    label: "字典管理",
    icon: "lucide:book",
    route: "/system/dict",
    color: "#18a058",
  },
  {
    label: "参数配置",
    icon: "lucide:sliders",
    route: "/system/config",
    color: "#2080f0",
  },
];

const systemInfo = ref({
  version: "1.0.0",
  database: "MySQL 8.0",
  runtime: "Bun + Elysia",
  lastLogin: "",
});

const handleShortcut = (route: string) => {
  router.push(route);
};

const fetchStats = async () => {
  try {
    const [userRes, roleRes, onlineRes, operRes] = await Promise.all([
      api.api.system.user.list.get({ $query: { pageSize: 1 } }),
      api.api.system.role.list.get({ $query: { pageSize: 1 } }),
      api.api.monitor.online.list.get({ $query: { pageSize: 1 } }),
      api.api.monitor.operlog.list.get({ $query: { pageSize: 1 } }),
    ]);

    if (userRes.data?.code === 200) {
      stats.value[0].value = userRes.data.data.total;
      stats.value[0].loading = false;
    }
    if (roleRes.data?.code === 200) {
      stats.value[1].value = roleRes.data.data.total;
      stats.value[1].loading = false;
    }
    if (onlineRes.data?.code === 200) {
      stats.value[2].value = onlineRes.data.data.total;
      stats.value[2].loading = false;
    }
    if (operRes.data?.code === 200) {
      stats.value[3].value = operRes.data.data.total;
      stats.value[3].loading = false;
    }
  } catch (err) {
    console.error("Failed to fetch stats:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="dashboard h-full">
    <n-spin :show="loading">
      <!-- 欢迎区域 -->
      <n-card class="welcome-card" :bordered="false">
        <div class="welcome-content">
          <div class="welcome-info">
            <h1 class="welcome-title">工作台</h1>
            <p class="welcome-subtitle">
              欢迎回来，<span class="username">{{
                authStore.userInfo?.nickName ||
                authStore.userInfo?.username ||
                "管理员"
              }}</span
              >！ 今天是 {{ dayjs().format("YYYY年MM月DD日 dddd") }}。
            </p>
          </div>
        </div>
      </n-card>

      <!-- 统计卡片 -->
      <n-grid
        :cols="4"
        :x-gap="16"
        :y-gap="16"
        responsive="screen"
        class="stat-grid"
      >
        <n-gi v-for="stat in stats" :key="stat.label">
          <n-card class="stat-card" :bordered="false">
            <div class="stat-content">
              <div class="stat-info">
                <span class="stat-label">{{ stat.label }}</span>
                <n-spin :show="stat.loading" size="small">
                  <n-statistic :value="stat.value">
                    <template #suffix>
                      <span class="stat-unit">{{
                        stat.label.includes("用户") ||
                        stat.label.includes("日志")
                          ? "条"
                          : "个"
                      }}</span>
                    </template>
                  </n-statistic>
                </n-spin>
              </div>
              <div
                class="stat-icon"
                :style="{ backgroundColor: stat.color + '15' }"
              >
                <Icon :icon="stat.icon" :style="{ color: stat.color }" />
              </div>
            </div>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- 快捷入口 & 系统信息 -->
      <n-grid
        :cols="2"
        :x-gap="16"
        :y-gap="16"
        class="bottom-grid"
        responsive="screen"
      >
        <n-gi>
          <n-card title="快捷入口" :bordered="false">
            <div class="shortcuts">
              <div
                v-for="item in shortcuts"
                :key="item.label"
                class="shortcut-item"
                @click="handleShortcut(item.route)"
              >
                <div
                  class="shortcut-icon"
                  :style="{ backgroundColor: item.color + '15' }"
                >
                  <Icon :icon="item.icon" :style="{ color: item.color }" />
                </div>
                <span class="shortcut-label">{{ item.label }}</span>
              </div>
            </div>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card title="系统信息" :bordered="false">
            <div class="system-info">
              <div class="info-item">
                <span class="info-label">系统版本</span>
                <n-tag type="success" size="small">{{
                  systemInfo.version
                }}</n-tag>
              </div>
              <div class="info-item">
                <span class="info-label">数据库</span>
                <n-tag type="info" size="small">{{
                  systemInfo.database
                }}</n-tag>
              </div>
              <div class="info-item">
                <span class="info-label">运行环境</span>
                <n-tag type="warning" size="small">{{
                  systemInfo.runtime
                }}</n-tag>
              </div>
              <div class="info-item">
                <span class="info-label">当前时间</span>
                <span class="info-value">{{
                  dayjs().format("YYYY-MM-DD HH:mm:ss")
                }}</span>
              </div>
            </div>
          </n-card>
        </n-gi>
      </n-grid>
    </n-spin>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.username {
  font-weight: 600;
}

.stat-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.stat-unit {
  font-size: 14px;
  margin-left: 4px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .iconify {
  font-size: 24px;
}

.bottom-grid {
  flex: 1;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.shortcuts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .shortcuts {
    grid-template-columns: repeat(2, 1fr);
  }
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.shortcut-item:hover {
  background-color: var(--n-color-hover);
}

.shortcut-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-icon .iconify {
  font-size: 20px;
}

.shortcut-label {
  font-size: 13px;
  color: var(--n-text-color-2);
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: var(--n-text-color-2);
}

.info-value {
  font-size: 14px;
  color: var(--n-text-color-1);
}
</style>
