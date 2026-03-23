<script setup lang="ts">
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent } from 'naive-ui'
</script>

<template>
  <NLayout has-sider style="height: 100vh">
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="200"
      show-trigger
    >
      <div h-full flex flex-col>
        <div h-16 flex-center border-b>Logo</div>
        <div flex-1>Sidebar</div>
      </div>
    </NLayoutSider>
    <NLayout>
      <NLayoutHeader bordered h-16 flex-center>Header</NLayoutHeader>
      <NLayoutContent p-4>
        <slot />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>
