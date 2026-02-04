<script lang="ts" setup>
import type { Feedback } from '@/api/types/feedback'
import { onMounted, ref } from 'vue'
import { getFeedback } from '@/api/feedback'

definePage({
  style: {
    navigationBarTitleText: '反馈详情',
    navigationBarBackgroundColor: '#1b55e2',
    navigationBarTextStyle: 'white',
  },
})

const feedbackId = ref<string>('')
const feedback = ref<Feedback | null>(null)
const loading = ref(false)

// 获取反馈详情
async function loadFeedbackDetail() {
  try {
    loading.value = true
    const id = feedbackId.value
    if (!id) {
      uni.showToast({ title: '反馈ID不存在', icon: 'none' })
      return
    }
    const data = await getFeedback(id)
    feedback.value = data
  }
  catch (e: any) {
    console.error('加载反馈详情失败', e)
    const errorMsg = e?.response?.data?.detail || e?.message || '加载失败，请重试'
    uni.showToast({ title: errorMsg, icon: 'none', duration: 3000 })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
  finally {
    loading.value = false
  }
}

// 获取状态标签列表
function getStatusBadges(item: Feedback) {
  const badges: Array<{ text: string, class: string }> = []

  const status = Number(item.solve_status)
  const display = item.solve_status_display || ''
  const isDone = status === 1 || status === 2 || display === '已解决' || display === '无法解决'

  // 只在已结束状态时显示这些标签
  if (!isDone) {
    return badges
  }

  // 小组已读（已发布的反馈默认已读）
  if (item.issue_status === 1) {
    badges.push({ text: '小组已读', class: 'badge-success' })
  }

  // 解决状态
  if (status === 1 || display === '已解决') {
    badges.push({ text: '已解决', class: 'badge-success' })
  }
  else if (status === 2 || display === '无法解决') {
    badges.push({ text: '无法解决', class: 'badge-primary' })
  }

  // 公开状态
  if (item.publisher_public) {
    badges.push({ text: '公开', class: 'badge-success' })
    badges.push({ text: '发布者同意公开', class: 'badge-success' })
  }

  return badges
}

onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options || {}
  feedbackId.value = options.id || ''

  if (feedbackId.value) {
    loadFeedbackDetail()
  }
  else {
    uni.showToast({ title: '反馈ID不存在', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<template>
  <view class="feedback-detail-page min-h-screen bg-[#f8f9fa] pb-10">
    <view v-if="loading" class="py-20 text-center text-[#424344]">
      加载中...
    </view>
    <view v-else-if="!feedback" class="py-20 text-center text-[#424344]">
      反馈不存在
    </view>
    <view v-else class="detail-content">
      <!-- 标题和状态标签 -->
      <view class="detail-header mb-4 bg-white px-4 py-4">
        <view class="mb-3 text-center">
          <text class="text-xl text-[var(--text-main)] font-semibold">反馈详情</text>
        </view>
        <view class="text-center">
          <view class="flex flex-wrap items-center justify-center gap-2">
            <view
              v-for="(badge, index) in getStatusBadges(feedback)"
              :key="index"
              class="badge badge-success badge-pill px-3 py-1 text-xs font-medium"
            >
              {{ badge.text }}
            </view>
          </view>
        </view>
      </view>

      <!-- 接收小组信息 -->
      <view class="detail-org mb-4 bg-white px-4 py-3">
        <view class="flex items-center">
          <image
            v-if="feedback.org_avatar"
            :src="feedback.org_avatar"
            class="mr-2 h-6 w-6 rounded-full"
            mode="aspectFill"
          />
          <text class="text-base text-[var(--text-main)] font-medium">
            {{ feedback.org_name || '—' }}
          </text>
        </view>
      </view>

      <!-- 反馈表单内容 -->
      <view class="detail-form bg-white px-4 py-4">
        <!-- 反馈类型 -->
        <view class="form-group mb-4">
          <text class="form-label mb-2 block text-sm text-[#424344] font-medium">反馈类型</text>
          <view class="form-control-disabled">
            <text class="text-sm text-[#424344]">{{ feedback.feedback_type_display || feedback.type_name || '—' }}</text>
          </view>
        </view>

        <!-- 反馈标题 -->
        <view class="form-group mb-4">
          <text class="form-label mb-2 block text-sm text-[#424344] font-medium">反馈标题</text>
          <view class="form-control-disabled">
            <text class="text-sm text-[#424344]">{{ feedback.title || '—' }}</text>
          </view>
        </view>

        <!-- 反馈内容 -->
        <view class="form-group mb-4">
          <text class="form-label mb-2 block text-sm text-[#424344] font-medium">反馈内容</text>
          <view class="form-control-disabled">
            <text class="whitespace-pre-wrap text-sm text-[#424344]">{{ feedback.content || '—' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.feedback-detail-page {
  padding-top: 0;
}

.detail-header {
  border-bottom: 1px solid #e5e7eb;
}

.detail-org {
  border-bottom: 1px solid #e5e7eb;
}

.detail-form {
  border-top: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  color: #424344;
  font-weight: 500;
}

.form-control-disabled {
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 44px;
  display: flex;
  align-items: flex-start;
  line-height: 1.5;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background-color: #10b981;
  color: white;
}

.badge-primary {
  background-color: #3b82f6;
  color: white;
}

.badge-pill {
  border-radius: 9999px;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
