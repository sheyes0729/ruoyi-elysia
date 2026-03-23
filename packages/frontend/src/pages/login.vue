<script setup lang="ts">
import { definePage } from 'vue-router/auto'

definePage({
  meta: {
    title: '登录',
  },
})
</script>

<template>
  <div flex-center h-full>
    <n-card title="登录" w-96>
      <n-form>
        <n-form-item label="用户名">
          <n-input />
        </n-form-item>
        <n-form-item label="密码">
          <n-input type="password" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-button type="primary" w-full>登录</n-button>
      </template>
    </n-card>
  </div>
</template>
