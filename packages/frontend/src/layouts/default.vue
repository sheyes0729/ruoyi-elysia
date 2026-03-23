<script setup lang="ts">
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NIcon, NButton, NBreadcrumb, NDropdown, NAvatar, NSpace } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { ref, h, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const collapsed = ref(false)
const router = useRouter()
const route = useRoute()

const renderIcon = (icon: string) => {
  return () => h(NIcon, null, { default: () => h(Icon, { icon }) })
}

const menuOptions = [
  {
    label: '工作台',
    key: 'dashboard',
    icon: renderIcon('lucide:layout-dashboard'),
  },
  {
    type: 'divider',
    key: 'd1',
  },
  {
    label: '系统管理',
    key: 'system',
    icon: renderIcon('lucide:settings'),
    children: [
      { label: '用户管理', key: 'system/user', icon: renderIcon('lucide:users') },
      { label: '角色管理', key: 'system/role', icon: renderIcon('lucide:shield') },
      { label: '菜单管理', key: 'system/menu', icon: renderIcon('lucide:menu') },
      { label: '部门管理', key: 'system/dept', icon: renderIcon('lucide:building') },
      { label: '岗位管理', key: 'system/post', icon: renderIcon('lucide:briefcase') },
      { label: '字典管理', key: 'system/dict', icon: renderIcon('lucide:book') },
      { label: '参数配置', key: 'system/config', icon: renderIcon('lucide:sliders') },
      { label: '通知公告', key: 'system/notice', icon: renderIcon('lucide:bell') },
    ],
  },
  {
    label: '系统监控',
    key: 'monitor',
    icon: renderIcon('lucide:monitor'),
    children: [
      { label: '在线用户', key: 'monitor/online', icon: renderIcon('lucide:user-check') },
      { label: '登录日志', key: 'monitor/login-log', icon: renderIcon('lucide:file-text') },
      { label: '操作日志', key: 'monitor/oper-log', icon: renderIcon('lucide:history') },
    ],
  },
]

const activeKey = computed(() => route.path)

const userDropdownOptions = [
  { label: '个人中心', key: 'profile' },
  { label: '切换主题', key: 'theme' },
  { type: 'divider' },
  { label: '退出登录', key: 'logout' },
]

const handleMenuUpdate = (key: string) => {
  router.push(`/${key}`)
}

const handleUserDropdown = (key: string) => {
  if (key === 'logout') {
    router.push('/login')
  }
}
</script>

<template>
  <n-layout has-sider h-screen>
    <!-- 侧边栏 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="200"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="logo" :class="{ 'logo-collapsed': collapsed }">
        <Icon icon="lucide:shield-check" class="logo-icon" />
        <span v-if="!collapsed" class="logo-text">若依管理系统</span>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuUpdate"
      />
    </n-layout-sider>

    <n-layout>
      <!-- 顶部栏 -->
      <n-layout-header bordered h-16 class="header">
        <div class="header-left">
          <n-button quaternary @click="collapsed = !collapsed">
            <template #icon>
              <Icon :icon="collapsed ? 'lucide:menu' : 'lucide:panel-left-close'" />
            </template>
          </n-button>
          <n-breadcrumb>
            <n-breadcrumb-item>首页</n-breadcrumb-item>
            <n-breadcrumb-item>{{ route.meta.title || route.name }}</n-breadcrumb-item>
          </n-breadcrumb>
        </div>
        <div class="header-right">
          <n-space>
            <n-button quaternary circle>
              <template #icon>
                <Icon icon="lucide:bell" />
              </template>
            </n-button>
            <n-button quaternary circle>
              <template #icon>
                <Icon icon="lucide:fullscreen" />
              </template>
            </n-button>
            <n-dropdown :options="userDropdownOptions" @select="handleUserDropdown">
              <div class="user-info">
                <n-avatar round size="small" src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" />
                <span class="username">Admin</span>
                <Icon icon="lucide:chevron-down" class="chevron" />
              </div>
            </n-dropdown>
          </n-space>
        </div>
      </n-layout-header>

      <!-- 标签页 -->
      <div class="tab-bar">
        <div class="tab-list">
          <div class="tab-item active">
            <Icon icon="lucide:home" class="tab-icon" />
            <span>工作台</span>
            <Icon icon="lucide:x" class="tab-close" />
          </div>
        </div>
      </div>

      <!-- 主内容 -->
      <n-layout-content class="content">
        <slot />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 64px;
  padding: 0 16px;
  border-bottom: 1px solid var(--n-border-color);
}

.logo-collapsed {
  justify-content: center;
  padding: 0;
}

.logo-icon {
  font-size: 24px;
  color: var(--n-primary-color);
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--n-text-color);
  white-space: nowrap;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: var(--n-color-hover);
}

.username {
  font-size: 14px;
}

.chevron {
  font-size: 14px;
  color: var(--n-text-color-3);
}

.tab-bar {
  height: 40px;
  background-color: var(--n-color);
  border-bottom: 1px solid var(--n-border-color);
  padding: 0 16px;
  display: flex;
  align-items: center;
}

.tab-list {
  display: flex;
  gap: 4px;
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  background-color: var(--n-color-hover);
  color: var(--n-text-color-2);
  transition: all 0.2s;
}

.tab-item:hover {
  background-color: var(--n-color-pressed);
}

.tab-item.active {
  background-color: var(--n-primary-color);
  color: #fff;
}

.tab-icon {
  font-size: 14px;
}

.tab-close {
  font-size: 12px;
  opacity: 0.6;
}

.tab-close:hover {
  opacity: 1;
}

.content {
  padding: 16px;
  overflow-y: auto;
  background-color: #f5f5f5;
}
</style>
