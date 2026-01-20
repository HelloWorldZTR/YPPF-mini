<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { LOGIN_PAGE } from '@/router/config'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'
import { toBackendURL } from '@/utils'

definePage({
  style: {
    navigationBarTitleText: '我的',
    navigationBarBackgroundColor: '#2563eb',
    navigationBarTextStyle: 'white',
  },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()
// 使用storeToRefs解构userInfo
const { userInfo } = storeToRefs(userStore)

// 默认头像
const defaultAvatar = '/static/images/default-avatar.png'

// 微信小程序下登录
async function handleLogin() {
  // #ifdef MP-WEIXIN
  // 微信登录
  await tokenStore.wxLogin()
  // #endif
  // #ifndef MP-WEIXIN
  uni.navigateTo({
    url: `${LOGIN_PAGE}`,
  })
  // #endif
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清空用户信息
        tokenStore.logout()
        // 执行退出登录逻辑
        uni.showToast({
          title: '退出登录成功',
          icon: 'success',
        })
      }
    },
  })
}

function handleNothing() {
  uni.showToast({
    title: '功能开发中，敬请期待~',
    icon: 'none',
  })
}

// 菜单项
const menuItems = [
  { title: '个人资料', icon: 'i-carbon-user-profile', onClick: handleNothing },
  { title: '账号绑定', icon: 'i-carbon-link', onClick: handleNothing },
  { title: '设置', icon: 'i-carbon-settings', onClick: handleNothing },
  { title: '常见问题', icon: 'i-carbon-help', onClick: handleNothing },
  { title: '关于我们', icon: 'i-carbon-information', onClick: handleNothing },
]
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <!-- 顶部用户信息 -->
    <view class="relative bg-blue-600 px-6 pb-14 pt-10">
      <view class="flex items-center">
        <!-- 头像容器 -->
        <view class="h-18 w-18 flex-shrink-0 overflow-hidden border-4 border-white/20 rounded-full bg-white shadow-sm">
          <image
            class="h-full w-full"
            :src="tokenStore.hasLogin ? toBackendURL(userInfo.avatar_url || userInfo.avatar || defaultAvatar) : defaultAvatar"
            mode="aspectFill"
          />
        </view>

        <!-- 文字信息 -->
        <view class="ml-4 flex-1 overflow-hidden">
          <template v-if="tokenStore.hasLogin">
            <view class="truncate text-2xl text-white font-bold">
              {{ userInfo.name || userInfo.username || '未设置昵称' }}
            </view>
            <view class="mt-1 truncate text-sm text-blue-100 opacity-80">
              {{ userInfo.profile?.email || '暂无邮箱' }}
            </view>
          </template>
          <template v-else>
            <view class="text-2xl text-white font-bold" @click="handleLogin">
              点击登录
            </view>
            <view class="mt-1 text-sm text-blue-100 opacity-80">
              登录后查看个人信息
            </view>
          </template>
        </view>
      </view>
    </view>

    <!-- 功能卡片区 -->
    <view class="mx-4 mt-[-40px]">
      <!-- 列表卡片 -->
      <view class="overflow-hidden rounded-2xl bg-white shadow-sm">
        <view
          v-for="(item, index) in menuItems"
          :key="index"
          class="flex items-center justify-between border-b border-gray-50 p-4 last:border-none active:bg-gray-50"
          @click="item.onClick"
        >
          <view class="flex items-center">
            <view :class="item.icon" class="mr-3 text-xl text-blue-600" />
            <text class="text-base text-gray-800">{{ item.title }}</text>
          </view>
          <view class="i-carbon-chevron-right text-sm text-gray-300" />
        </view>
      </view>

      <!-- 退出登录按钮 -->
      <view v-if="tokenStore.hasLogin" class="mt-8 px-2">
        <button
          class="w-full rounded-xl border-none bg-white py-3 text-center text-lg text-red-500 font-medium shadow-sm transition-opacity active:opacity-70"
          @click="handleLogout"
        >
          退出登录
        </button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* 可以在这里添加一些针对深色/浅色模式或特定细节的微调 */
button {
  &::after {
    border: none;
  }
}
</style>
