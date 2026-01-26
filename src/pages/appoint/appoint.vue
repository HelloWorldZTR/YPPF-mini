<script lang="ts" setup>
import type { IIndexResponse, IRoom } from '@/api/types/appoint'
import { getIndexStatus } from '@/api/appoint'
import { getGlobalError, removeGlobalError } from '@/utils/globalError'

definePage({
  style: {
    // 'custom' 表示开启自定义导航栏，默认 'default'
    navigationStyle: 'custom',
    navigationBarTitleText: '预约',
  },
})

const statusData = ref<IIndexResponse>()
const loading = ref(false)
const activeTab = ref(0)
// 如果是后续出错了，会在queryString中显示错误信息
const errorMsg = getGlobalError()
const toastErrorRef = ref()

// 计算头部高度（导航栏 + 状态栏 + 公告栏），单位：rpx
const headerHeight = computed(() => {
  const systemInfo = uni.getSystemInfoSync()
  // 导航栏高度 88rpx (44px * 2) + 状态栏高度（px转rpx）
  // 状态栏高度通常是 20-50px，转换为 rpx 约为 40-100rpx
  const statusBarHeightRpx = (systemInfo.statusBarHeight / systemInfo.windowWidth) * 750
  const navbarHeightRpx = 88 + Math.ceil(statusBarHeightRpx)
  // 公告栏高度：每个公告约 40rpx，加上 padding 24rpx (上下各12rpx)
  const announcementHeightRpx = announcements.value.length > 0 
    ? announcements.value.length * 40 + 24
    : 0
  return navbarHeightRpx + announcementHeightRpx
})

// 公告列表
const announcements = computed(() => {
  if (!statusData.value?.announcements?.length)
    return []
  return statusData.value.announcements
    .filter(item => item.show === 1)
    .map(item => item.announcement)
})

// 侧边栏列表
const tabList = computed(() => {
  const tabs = []

  if (statusData.value?.function_room_list?.length) {
    tabs.push({
      name: '功能房',
      key: 'function',
      rooms: statusData.value.function_room_list,
    })
  }

  if (statusData.value?.talk_room_list?.length) {
    tabs.push({
      name: '研讨室',
      key: 'talk',
      rooms: statusData.value.talk_room_list,
    })
  }

  if (statusData.value?.russian_room_list?.length) {
    tabs.push({
      name: '俄文楼',
      key: 'russian',
      rooms: statusData.value.russian_room_list,
    })
  }

  return tabs
})

// 当前选中的房间列表
const currentRooms = computed(() => {
  return tabList.value[activeTab.value]?.rooms || []
})

// 获取房间状态颜色
function getRoomStatusColor(status: number) {
  switch (status) {
    case 0: return 'success' // 可用
    case 1: return 'warning' // 部分可用
    case 2: return 'danger' // 不可用
    default: return 'info'
  }
}

// 获取房间状态文字
function getRoomStatusText(room: IRoom) {
  return room.status_display || '未知'
}

// 跳转到预约页面
function goToAppointRoom(room: IRoom) {
  uni.navigateTo({
    url: `/pages/appoint/arrange?Rid=${room.Rid}`,
  })
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getIndexStatus()
    statusData.value = res
  }
  catch (error) {
    console.error('获取预约状态失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
  }
}

onShow(() => {
  // 切换页面的时候刷新一下数据，因为可能会有新的公告
  fetchData()
})

function goToArrangeByTime() {
  uni.navigateTo({
    url: `/pages/appoint/arrange-by-time`,
  })
}
</script>

<template>
  <!-- 自定义导航栏 -->
  <uv-navbar
    title="预约房间"
    :safe-area-inset-top="true"
    left-icon="clock"
    :placeholder="true"
    :auto-back="false"
    @left-click="goToArrangeByTime"
  />
  <!-- 公告栏 -->
  <view v-if="announcements.length > 0" class="px-3 pt-3">
    <uv-notice-bar
      v-for="(announcement, index) in announcements"
      :key="index"
      :text="announcement"
      direction="row"
      mode="closable"
      bg-color="#fffbf0"
      color="#ed6a0c"
      icon="volume-fill"
      :duration="3000"
    />
  </view>
  <view class="min-h-screen">
    <uv-vtabs
      :list="tabList"
      :current="activeTab"
      :chain="false"
      :hd-height="`${headerHeight}rpx`"
      key-name="name"
      @change="(e) => activeTab = e"
    >
      <uv-vtabs-item>
        <view class="p-3 space-y-3">
          <!-- 房间卡片 -->
          <view
            v-for="room in currentRooms"
            :key="room.Rid"
            class="mb-3 overflow-hidden border rounded-lg bg-white shadow-lg"
            :class="{
              'border-green-200': room.Rstatus === 0,
              'border-orange-200': room.Rstatus === 1,
              'border-red-200': room.Rstatus === 2,
            }"
            @click="goToAppointRoom(room)"
          >
            <!-- 房间头部 -->
            <view
              class="border-b px-4 py-3"
              :class="{
                'border-green-100 from-green-50 to-emerald-50 bg-gradient-to-r': room.Rstatus === 0,
                'border-orange-100 from-orange-50 to-yellow-50 bg-gradient-to-r': room.Rstatus === 1,
                'border-red-100 from-red-50 to-pink-50 bg-gradient-to-r': room.Rstatus === 2,
              }"
            >
              <view class="flex items-start justify-between gap-2">
                <view class="flex-1">
                  <view class="text-sm text-gray-600">
                    {{ room.Rid }}
                  </view>
                  <view class="text-base text-gray-800 font-bold">
                    {{ room.Rtitle }}
                  </view>
                </view>
                <uv-tag
                  :type="getRoomStatusColor(room.Rstatus)"
                  :text="getRoomStatusText(room)"
                  plain
                  size="mini"
                />
              </view>
            </view>

            <!-- 房间详情 -->
            <view class="px-4 py-3 space-y-2">
              <!-- 容纳人数 -->
              <view class="flex items-center text-sm text-gray-700">
                <div class="i-carbon-group mr-2 text-lg text-blue-500" />
                <text>容纳人数：{{ room.Rmin }} - {{ room.Rmax }} 人</text>
              </view>

              <!-- 开放时间 -->
              <view class="flex items-center text-sm text-gray-700">
                <div class="i-carbon-time mr-2 text-lg text-blue-500" />
                <text>开放时间：{{ room.Rstart }} - {{ room.Rfinish }}</text>
              </view>

              <!-- 当前使用人数 -->
              <view v-if="room.Rpresent > 0" class="flex items-center text-sm text-gray-700">
                <div class="i-carbon-user mr-2 text-lg text-blue-500" />
                <text>当前使用：{{ room.Rpresent }} 人</text>
              </view>

              <!-- 是否需要协议 -->
              <view v-if="room.RneedAgree" class="flex items-center text-sm text-orange-600">
                <div class="i-carbon-document mr-2 text-lg" />
                <text>需签署使用协议</text>
              </view>

              <!-- 是否通宵 -->
              <view v-if="room.RIsAllNight" class="flex items-center text-sm text-purple-600">
                <div class="i-carbon-moon mr-2 text-lg" />
                <text>支持通宵使用</text>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="border-t border-gray-100 px-4 py-3">
              <button
                class="w-full rounded-lg py-2 text-sm font-medium"
                :class="{
                  'bg-green-500 text-white': room.Rstatus === 0,
                  'bg-orange-400 text-white': room.Rstatus === 1,
                  'bg-gray-300 text-gray-500': room.Rstatus === 2,
                }"
                :disabled="room.Rstatus === 2"
              >
                {{ room.Rstatus === 2 ? '暂不可预约' : '预约房间' }}
              </button>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-if="currentRooms.length === 0" class="py-10 text-center text-sm text-gray-400">
            暂无房间
          </view>
        </view>
      </uv-vtabs-item>
    </uv-vtabs>
  </view>
</template>

<style lang="scss" scoped>
// 自定义样式
</style>
