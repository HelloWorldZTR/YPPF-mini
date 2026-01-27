<script lang="ts" setup>
definePage({
  style: {
    navigationBarTitleText: '应用中心',
    navigationBarBackgroundColor: '#2563eb',
    navigationBarTextStyle: 'white',
  },
})

const appGroups = [
  {
    name: '实用工具',
    apps: [
      { name: '问卷调查', icon: 'i-carbon-document-tasks', color: 'text-blue-500' },
      { name: '反馈建议', icon: 'i-carbon-chat-bot', color: 'text-green-500' },
      { name: '说的道理', icon: 'i-carbon-education', color: 'text-orange-500' },
      { name: '课程表', icon: 'i-carbon-calendar', color: 'text-purple-500' },
    ],
  },
  {
    name: '更多应用',
    apps: [
      { name: '成绩查询', icon: 'i-carbon-education', color: 'text-indigo-500' },
      { name: '图书馆', icon: 'i-carbon-book', color: 'text-red-500' },
      { name: '活动报名', icon: 'i-carbon-event', color: 'text-teal-500' },
      { name: '校园公告', icon: 'i-carbon-bullhorn', color: 'text-yellow-600' },
    ],
  },
]

function handleAppClick(app: any) {
  // 图书馆直接跳转
  if (app.name === '图书馆') {
    uni.navigateTo({
      url: '/pages/appmenu/library',
    })
    return
  }

  // 其他应用显示开发中
  uni.showToast({
    title: `${app.name} 开发中...`,
    icon: 'none',
  })
}
</script>

<template>
  <view class="min-h-screen bg-[var(--bg-soft)] pb-10">
    <!-- 顶部装饰区（参考 me 页面） -->
    <view class="relative bg-[var(--primary-color)] px-6 pb-18 pt-10">
      <view class="flex items-center">
        <view class="flex-1">
          <view class="text-2xl text-white font-bold">
            应用中心
          </view>
          <view class="mt-1 text-sm text-white/80">
            发现更多实用功能
          </view>
        </view>
        <view class="i-carbon-apps text-4xl text-white/30" />
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="mx-4 mt-[-40px]">
      <view v-for="(group, gIdx) in appGroups" :key="gIdx" class="mb-6">
        <!-- 分组标题 -->
        <view class="mb-3 flex items-center px-1">
          <view class="mr-2 h-4 w-1 rounded-full bg-[var(--primary-color)]" />
          <text class="text-base text-[var(--text-main)] font-bold">{{ group.name }}</text>
        </view>

        <!-- 应用网格卡片 -->
        <view class="grid grid-cols-4 gap-y-6 overflow-hidden rounded-2xl bg-white px-2 py-6 shadow-sm">
          <view
            v-for="(app, aIdx) in group.apps"
            :key="aIdx"
            class="flex flex-col items-center active:opacity-70"
            @click="handleAppClick(app)"
          >
            <view :class="[app.icon, app.color]" class="mb-2 text-3xl" />
            <text class="text-xs text-[var(--text-main)]">{{ app.name }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* 保持一致的按钮交互效果 */
.active-state {
  &:active {
    opacity: 0.7;
  }
}
</style>
