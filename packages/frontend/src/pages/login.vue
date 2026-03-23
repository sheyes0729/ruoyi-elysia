<script setup lang="ts">
import { NCard, NForm, NFormItem, NInput, NButton, NSpace, NCheckbox, NIcon, NSplit } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const formValue = ref({
  username: '',
  password: '',
  captcha: '',
  remember: false,
})

const handleLogin = async () => {
  loading.value = true
  try {
    // TODO: 调用登录 API
    router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="login-pattern"></div>
    </div>
    <div class="login-content">
      <n-card class="login-card" :bordered="false">
        <template #header>
          <div class="login-header">
            <div class="login-logo">
              <Icon icon="lucide:shield-check" class="logo-icon" />
            </div>
            <h1 class="login-title">若依管理系统</h1>
            <p class="login-subtitle">RuoYi Management System</p>
          </div>
        </template>
        <n-form :model="formValue" @submit.prevent="handleLogin">
          <n-form-item path="username">
            <n-input
              v-model:value="formValue.username"
              placeholder="请输入用户名"
              size="large"
            >
              <template #prefix>
                <Icon icon="lucide:user" class="input-icon" />
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="password">
            <n-input
              v-model:value="formValue.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password-on="click"
            >
              <template #prefix>
                <Icon icon="lucide:lock" class="input-icon" />
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="captcha">
            <n-input
              v-model:value="formValue.captcha"
              placeholder="请输入验证码"
              size="large"
              style="flex: 1"
            >
              <template #prefix>
                <Icon icon="lucide:shield-check" class="input-icon" />
              </template>
            </n-input>
            <div class="captcha-code">
              <!-- TODO: 替换为真实验证码图片 -->
              <n-tag type="warning" bordered>ABC123</n-tag>
            </div>
          </n-form-item>
          <n-form-item>
            <n-checkbox v-model:checked="formValue.remember">
              记住我
            </n-checkbox>
          </n-form-item>
          <n-form-item>
            <n-button
              type="primary"
              size="large"
              block
              :loading="loading"
              attr-type="submit"
            >
              登 录
            </n-button>
          </n-form-item>
        </n-form>
      </n-card>
      <div class="login-footer">
        <p>Copyright © 2024 若依管理系统 All Rights Reserved.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-bg {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-pattern {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.login-content {
  width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-card {
  width: 100%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 48px;
  color: #18a058;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #181818;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.input-icon {
  font-size: 18px;
  color: #999;
}

.captcha-code {
  margin-left: 12px;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.login-footer p {
  font-size: 12px;
  color: #999;
  margin: 0;
}

@media (max-width: 768px) {
  .login-bg {
    display: none;
  }

  .login-content {
    width: 100%;
    padding: 20px;
  }
}
</style>
