<script setup lang="ts">
import { NCard, NStatistic, NGrid, NGi, NIcon, NSpace, NTag, NAvatar, NButton } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { h } from 'vue'
import dayjs from 'dayjs'

const stats = [
  { label: '用户总数', value: 128, icon: 'lucide:users', color: '#18a058', type: 'success' },
  { label: '角色总数', value: 12, icon: 'lucide:shield', color: '#2080f0', type: 'info' },
  { label: '菜单总数', value: 86, icon: 'lucide:menu', color: '#f0a020', type: 'warning' },
  { label: '在线用户', value: 5, icon: 'lucide:activity', color: '#d03050', type: 'error' },
]

const shortcuts = [
  { label: '用户管理', icon: 'lucide:user-plus', route: '/system/user', color: '#18a058' },
  { label: '角色管理', icon: 'lucide:shield-plus', route: '/system/role', color: '#2080f0' },
  { label: '菜单管理', icon: 'lucide:list', route: '/system/menu', color: '#f0a020' },
  { label: '操作日志', icon: 'lucide:file-text', route: '/monitor/oper-log', color: '#d03050' },
]

const handleShortcut = (route: string) => {
  // TODO: navigate to route
}
</script>

<template>
  <div class="dashboard h-full">
    <!-- 欢迎区域 -->
    <n-card class="welcome-card" :bordered="false">
      <div class="welcome-content">
        <div class="welcome-info">
          <h1 class="welcome-title">工作台</h1>
          <p class="welcome-subtitle">
            欢迎回来，<span class="username">管理员</span>！今天是 {{ dayjs().format('YYYY年MM月DD日 dddd') }}。
          </p>
        </div>
        <div class="welcome-actions">
          <n-button type="primary" size="small">
            <template #icon>
              <Icon icon="lucide:plus" />
            </template>
            新建用户
          </n-button>
          <n-button size="small">
            <template #icon>
              <Icon icon="lucide:settings" />
            </template>
            系统设置
          </n-button>
        </div>
      </div>
    </n-card>

    <!-- 统计卡片 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" :item-responsive="true">
      <n-gi v-for="stat in stats" :key="stat.label" :span="24:xs(12) 24:sm(12) 24:md(6) 24:lg(6)">
        <n-card class="stat-card" :bordered="false">
          <div class="stat-content">
            <div class="stat-info">
              <span class="stat-label">{{ stat.label }}</span>
              <n-statistic :value="stat.value" :type="stat.type">
                <template #suffix>
                  <span class="stat-unit">人</span>
                </template>
              </n-statistic>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: stat.color + '15' }">
              <Icon :icon="stat.icon" :style="{ color: stat.color }" />
            </div>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 快捷入口 & 最新操作 -->
    <n-grid :cols="2" :x-gap="16" :y-gap="16" class="bottom-grid">
      <!-- 快捷入口 -->
      <n-gi :span="24:xs(24) 24:sm(24) 24:md(10) 24:lg(10)">
        <n-card title="快捷入口" :bordered="false">
          <template #header-extra>
            <n-button text type="primary">
              <template #icon>
                <Icon icon="lucide:plus" />
              </template>
              添加
            </n-button>
          </template>
          <div class="shortcuts">
            <div
              v-for="item in shortcuts"
              :key="item.label"
              class="shortcut-item"
              @click="handleShortcut(item.route)"
            >
              <div class="shortcut-icon" :style="{ backgroundColor: item.color + '15' }">
                <Icon :icon="item.icon" :style="{ color: item.color }" />
              </div>
              <span class="shortcut-label">{{ item.label }}</span>
            </div>
          </div>
        </n-card>
      </n-gi>

      <!-- 系统信息 -->
      <n-gi :span="24:xs(24) 24:sm(24) 24:md(14) 24:lg(14)">
        <n-card title="系统信息" :bordered="false">
          <n-space vertical size="large">
            <div class="info-item">
              <span class="info-label">系统版本</span>
              <n-tag type="success" size="small">v1.0.0</n-tag>
            </div>
            <div class="info-item">
              <span class="info-label">数据库版本</span>
              <n-tag type="info" size="small">MySQL 8.0</n-tag>
            </div>
            <div class="info-item">
              <span class="info-label">运行环境</span>
              <n-tag type="warning" size="small">Bun + Node.js</n-tag>
            </div>
            <div class="info-item">
              <span class="info-label">最后登录</span>
              <span class="info-value">{{ dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss') }}</span>
            </div>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>
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

.welcome-actions {
  display: flex;
  gap: 8px;
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
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

.shortcuts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
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
