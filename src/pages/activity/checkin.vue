<script lang="ts" setup>
import type { IActivitySummary } from '@/api/types/activity'
import { checkInActivity, getActivityInfo } from '@/api/activity'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '活动签到',
  },
})

const activityId = ref<number>(-1)
const activity = ref<IActivitySummary | null>(null)
const loading = ref(true)
const checkIning = ref(false)
const checkInSuccess = ref(false)

// 格式化时间显示
function formatDateTime(dateTimeStr: string) {
  if (!dateTimeStr)
    return ''
  try {
    const date = new Date(dateTimeStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hours}:${minutes}`
  }
  catch {
    return dateTimeStr
  }
}

async function fetchActivityInfo() {
  if (activityId.value === -1)
    return
  loading.value = true
  try {
    activity.value = await getActivityInfo(activityId.value)
  }
  catch (error) {
    console.error(error)
    uni.showToast({
      title: '获取活动信息失败',
      icon: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

async function handleCheckIn() {
  if (activityId.value === -1) {
    uni.showToast({ title: '参数错误', icon: 'none' })
    return
  }
  // 不允许点着玩
  if (checkIning.value || checkInSuccess.value)
    return
  checkIning.value = true
  try {
    const res = await checkInActivity(activityId.value)
    checkInSuccess.value = true
    uni.showToast({
      title: res.message || '签到成功',
      icon: 'success',
    })
    // 展示详情
    // TODO: 改成原生的
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/generic/webview?uri=/viewActivity/${activityId.value}`,
      })
    }, 1000)
  }
  catch (error) {
    console.error(error)
    // 错误信息由 http 包负责显示
  }
  finally {
    checkIning.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

onLoad((options) => {
  if (options) {
    // 支持 scene（扫码）和 id（直接跳转）两种方式
    if (options.scene) {
      const aidStr = options.scene.split('_')[1]
      if (aidStr)
        activityId.value = Number(aidStr)
    }
    if (options.id !== undefined && activityId.value === -1) {
      activityId.value = Number(options.id)
    }
  }
  if (activityId.value === -1) {
    uni.showToast({ title: '参数错误', icon: 'error' })
    loading.value = false
    return
  }
  fetchActivityInfo()
})
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-safe">
    <uv-navbar
      title="活动签到"
      :safe-area-inset-top="true"
      :placeholder="true"
      left-icon="arrow-left"
      @left-click="goBack"
    />

    <!-- 加载状态 -->
    <view v-if="loading" class="flex items-center justify-center py-20">
      <uv-loading-icon mode="circle" />
    </view>

    <!-- 活动信息 -->
    <view v-else-if="activity" class="px-4 pt-4">
      <view class="overflow-hidden rounded-xl bg-white shadow-sm">
        <view class="p-4">
          <view class="mb-2 flex items-center justify-between">
            <text class="text-lg text-gray-900 font-bold">{{ activity.title }}</text>
            <view
              class="rounded-full px-2.5 py-1 text-xs font-medium"
              :class="{
                'bg-green-50 text-green-600': activity.status === '进行中' || activity.status === '报名中',
                'bg-blue-50 text-blue-600': activity.status === '等待中' || activity.status === '待发布',
                'bg-gray-100 text-gray-500': activity.status === '已结束',
                'bg-red-50 text-red-500': activity.status === '已取消' || activity.status === '已撤销' || activity.status === '未过审',
                'bg-yellow-50 text-yellow-600': activity.status === '审核中',
              }"
            >
              {{ activity.status_display || activity.status }}
            </view>
          </view>

          <view class="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <text class="i-carbon-user text-base text-gray-400" />
            <text>{{ activity.organization_name }}</text>
          </view>

          <view class="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <text class="i-carbon-time text-base text-gray-400" />
            <text>{{ formatDateTime(activity.start) }} ~ {{ formatDateTime(activity.end) }}</text>
          </view>

          <view v-if="activity.location" class="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <text class="i-carbon-location text-base text-gray-400" />
            <text>{{ activity.location }}</text>
          </view>

          <view v-if="activity.introduction" class="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600 leading-relaxed">
            {{ activity.introduction }}
          </view>
        </view>
      </view>
    </view>

    <!-- 签到按钮 -->
    <view v-if="activity && !loading" class="fixed bottom-0 left-0 right-0 bg-white px-4 py-4 pb-safe shadow-lg">
      <button
        class="w-full rounded-lg py-3 text-base font-medium"
        :class="checkInSuccess ? 'bg-gray-300 text-gray-500' : (checkIning ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white')"
        :disabled="checkIning || checkInSuccess"
        @click="handleCheckIn"
      >
        {{ checkInSuccess ? '已签到' : (checkIning ? '签到中...' : '签到') }}
      </button>
    </view>

    <!-- 底部占位 -->
    <view v-if="activity && !loading" class="h-20" />

    <!-- 参数错误或加载失败 -->
    <view v-else class="flex flex-col items-center justify-center py-20">
      <text class="text-gray-400">{{ activityId === -1 ? '参数错误，无法签到' : '获取活动信息失败' }}</text>
      <button class="mt-4 rounded-lg bg-blue-500 px-6 py-2 text-white" @click="activityId === -1 ? goBack() : fetchActivityInfo()">
        {{ activityId === -1 ? '返回' : '重试' }}
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
</style>
