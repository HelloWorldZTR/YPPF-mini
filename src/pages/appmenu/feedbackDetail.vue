<script lang="ts" setup>
import type { Feedback, SolveStatus } from '@/api/types/feedback'
import { getFeedback } from '@/api/feedback'

definePage({
  style: {
    navigationBarTitleText: '反馈详情',
    navigationBarBackgroundColor: '#1b55e2',
    navigationBarTextStyle: 'white',
  },
})

const id = ref('')
const detail = ref<Feedback | null>(null)
const loading = ref(true)

function solveStatusInfo(status: SolveStatus): { text: string, class: string } {
  switch (status) {
    case 2:
      return { text: '已解决', class: 'badge-success' }
    case 3:
      return { text: '无法解决', class: 'badge-primary' }
    case 1:
      return { text: '处理中', class: 'badge-warning' }
    default:
      return { text: '待处理', class: 'badge-secondary' }
  }
}

function formatDate(time: string | undefined) {
  if (!time)
    return '—'
  const d = new Date(time)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}年${m}月${day}日 ${h}:${min}`
}

/** 展示用内容（兼容旧数据：去掉可能存在的申诉预约标记行） */
function displayContent(content: string | undefined): string {
  if (!content)
    return '—'
  return content
    .split('\n')
    .filter(line => !/^\[申诉预约:aid=\d+\]$/.test(line.trim()))
    .join('\n')
    .trim() || '—'
}

onLoad((options) => {
  id.value = options?.id ?? ''
  if (!id.value) {
    loading.value = false
    uni.showToast({ title: '缺少反馈ID', icon: 'none' })
    return
  }
  getFeedback(id.value)
    .then((res) => {
      detail.value = res
    })
    .catch((e) => {
      console.error(e)
      uni.showToast({ title: '加载失败', icon: 'none' })
    })
    .finally(() => {
      loading.value = false
    })
})
</script>

<template>
  <view class="min-h-screen bg-[#f8f9fa] pb-10">
    <view v-if="loading" class="py-20 text-center text-[#424344]">
      加载中...
    </view>
    <view v-else-if="detail" class="px-4 pt-4">
      <view class="border border-gray-100 rounded-lg bg-white p-4 shadow-sm">
        <view class="mb-3 flex flex-wrap items-center gap-2">
          <view
            class="badge badge-pill rounded-full px-2 py-0.5 text-xs font-medium"
            :class="solveStatusInfo(detail.solve_status).class"
          >
            {{ detail.solve_status_display ?? solveStatusInfo(detail.solve_status).text }}
          </view>
          <text class="text-xs text-[#424344]">
            {{ formatDate(detail.feedback_time ?? detail.modify_time ?? detail.time) }}
          </text>
        </view>
        <view class="mb-2 text-sm text-[#424344]">
          <text class="font-medium">反馈类型：</text>
          <text>{{ detail.feedback_type_display ?? '—' }}</text>
        </view>
        <view class="mt-3 border-t border-gray-100 pt-3">
          <text class="mb-2 block text-sm text-[#424344] font-medium">反馈内容</text>
          <text class="whitespace-pre-wrap break-words text-sm text-[var(--text-main)]">{{ displayContent(detail.content) }}</text>
        </view>
      </view>
    </view>
    <view v-else class="py-20 text-center text-[#424344]">
      未找到该反馈
    </view>
  </view>
</template>

<style lang="scss" scoped>
.badge-success {
  background-color: #28a745;
  color: #fff;
}
.badge-primary {
  background-color: #1b55e2;
  color: #fff;
}
.badge-warning {
  background-color: #ffc107;
  color: #212529;
}
.badge-secondary {
  background-color: #6c757d;
  color: #fff;
}
</style>
