<script lang="ts" setup>
import type { IActivitySummary } from '@/api/types/activity'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  activity: IActivitySummary
  /**
   * 是否显示人数/限额，例如：12/50 人
   */
  showQuota?: boolean
  /**
   * 是否显示时间信息
   */
  showTime?: boolean
}>(), {
  showQuota: false,
  showTime: false,
})

const emit = defineEmits<{
  click: [id: number]
}>()

function handleClick() {
  emit('click', props.activity.id)
}

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

const startTime = computed(() => formatDateTime(props.activity.start))
const endTime = computed(() => formatDateTime(props.activity.end))

// 状态显示文本
const statusText = computed(() => {
  return props.activity.status || '未知'
})

// 根据状态获取状态样式
const getStatusClass = computed(() => {
  const status = props.activity.status
  if (status === '报名中' || status === '进行中') {
    return 'bg-green-50 text-green-600'
  }
  if (status === '等待中' || status === '待发布') {
    return 'bg-blue-50 text-blue-600'
  }
  if (status === '已结束') {
    return 'bg-gray-100 text-gray-500'
  }
  if (status === '已取消' || status === '已撤销' || status === '未过审') {
    return 'bg-red-50 text-red-500'
  }
  if (status === '审核中') {
    return 'bg-yellow-50 text-yellow-600'
  }
  return 'bg-gray-100 text-gray-600'
})
</script>

<template>
  <view
    class="activity-card mb-4 overflow-hidden border border-gray-100 rounded-2xl bg-white transition-all shadow-sm active:opacity-80"
    @click="handleClick"
  >
    <view class="p-4">
      <!-- 标题和状态 -->
      <view class="mb-3 flex items-start justify-between gap-3">
        <text class="line-clamp-2 flex-1 text-base text-gray-900 font-semibold leading-6">
          {{ props.activity.title }}
        </text>
        <view v-if="statusText" class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" :class="[getStatusClass]">
          {{ statusText }}
        </view>
      </view>

      <!-- 组织与地点 -->
      <view class="mb-2 flex items-center gap-2 text-sm text-gray-600">
        <view class="flex items-center gap-1.5">
          <text class="i-carbon-user text-base text-gray-400" />
          <text class="truncate">
            {{ props.activity.organization_name }}
          </text>
        </view>
        <text v-if="props.activity.location" class="flex items-center gap-1.5 text-gray-500">
          <text class="i-carbon-location text-base text-gray-400" />
          <text class="truncate">
            {{ props.activity.location }}
          </text>
        </text>
      </view>

      <!-- 时间（可选） -->
      <view v-if="props.showTime && startTime" class="mb-2 flex items-center gap-1.5 text-xs text-gray-500">
        <text class="i-carbon-time text-base text-gray-400" />
        <text>{{ startTime }}</text>
        <text v-if="endTime">~ {{ endTime }}</text>
      </view>

      <!-- 简介 -->
      <view v-if="props.activity.introduction" class="line-clamp-2 mb-3 text-sm text-gray-600 leading-5">
        {{ props.activity.introduction }}
      </view>

      <!-- 底部信息栏 -->
      <view class="flex flex-wrap items-center justify-between gap-2 border-t border-gray-50 pt-3">
        <!-- 标签组 -->
        <view class="flex flex-wrap items-center gap-1.5">
          <view v-if="props.activity.category_display" class="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {{ props.activity.category_display }}
          </view>
          <view v-if="props.activity.need_apply" class="rounded-lg bg-orange-50 px-2 py-0.5 text-xs text-orange-600 font-medium">
            需报名
          </view>
          <view v-if="props.activity.inner" class="rounded-lg bg-blue-50 px-2 py-0.5 text-xs text-blue-600 font-medium">
            内部
          </view>
          <view v-if="props.activity.bidding" class="rounded-lg bg-purple-50 px-2 py-0.5 text-xs text-purple-600 font-medium">
            投点
          </view>
          <view v-if="props.activity.has_tag" class="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600 font-medium">
            推荐
          </view>
        </view>

        <!-- 人数/限额 -->
        <view v-if="props.showQuota && props.activity.capacity" class="flex items-center gap-1 text-xs text-gray-500">
          <text class="i-carbon-user text-base text-gray-400" />
          <text class="font-medium">
            {{ props.activity.current_participants }}/{{ props.activity.capacity }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
</style>
