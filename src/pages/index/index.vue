<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { everydaySignIn } from '@/api/login'

defineOptions({
  name: 'Home',
})
definePage({
  // 使用 type: "home" 属性设置首页，其他页面不需要设置，默认为page
  type: 'home',
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})

const notifyRef = ref()

// 计算 navbar 高度（44px + 状态栏高度）
function getNavbarHeight() {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  const navbarHeight = 44 // navbar 默认高度
  return navbarHeight + statusBarHeight
}

onMounted(async () => {
  try {
    const data = await everydaySignIn()
    if (data?.message) {
      const navbarHeight = getNavbarHeight()
      notifyRef.value?.show({
        message: data.message,
        duration: 3000,
        top: navbarHeight,
      })
    }
  }
  catch (error) {
    console.error('每日签到失败:', error)
  }
})
</script>

<template>
  <uv-navbar title="首页" placeholder="true" left-icon="" />
  <uv-notify ref="notifyRef" />
  <view class="bg-white px-4 pt-safe" />
</template>
