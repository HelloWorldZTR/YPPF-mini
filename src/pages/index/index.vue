<script lang="ts" setup>
import type { ICarouselItem } from '@/api/types/carousel'
import { onMounted, ref } from 'vue'
import { getCarouselList } from '@/api/carousel'
import { everydaySignIn } from '@/api/login'
import { toBackendURL } from '@/utils'

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
const carouselList = ref<ICarouselItem[]>([])
const carouselLoading = ref(true)

// 计算 navbar 高度（44px + 状态栏高度）
function getNavbarHeight() {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  const navbarHeight = 44 // navbar 默认高度
  return navbarHeight + statusBarHeight
}

function onCarouselClick(index: number) {
  const item = carouselList.value[index]
  if (!item?.redirect_url)
    return
  if (item.redirect_url.startsWith('http')) {
    // #ifdef H5
    window.open(item.redirect_url)
    // #endif
    // #ifndef H5
    uni.navigateTo({ url: `/pages/generic/webview?uri=${encodeURIComponent(item.redirect_url)}` })
    // #endif
  }
  else {
    uni.navigateTo({ url: item.redirect_url })
  }
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
  try {
    carouselLoading.value = true
    const res = await getCarouselList()
    carouselList.value = res?.items ?? []
    for (const item of carouselList.value) {
      item.image = toBackendURL(item.image)
    }
  }
  catch (error) {
    console.error('轮播列表获取失败:', error)
  }
  finally {
    carouselLoading.value = false
  }
})
</script>

<template>
  <uv-navbar title="首页" placeholder="true" left-icon="" />
  <uv-notify ref="notifyRef" />
  <view class="bg-white px-4 pt-safe">
    <uv-swiper
      :list="carouselList"
      key-name="image"
      :loading="carouselLoading"
      indicator
      indicator-mode="dot"
      circular
      height="200"
      radius="8"
      @click="onCarouselClick"
    />
  </view>
</template>
