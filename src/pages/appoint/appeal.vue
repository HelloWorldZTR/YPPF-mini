<script lang="ts" setup>
definePage({
  style: {
    navigationBarTitleText: '申诉',
    navigationStyle: 'default',
  },
})

const aid = ref<number>(0)
const room = ref<string>('')

onLoad((options) => {
  if (options.aid) {
    aid.value = Number(options.aid)
  }
  if (options.room) {
    room.value = decodeURIComponent(options.room)
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-10">
    <view class="p-4">
      <view class="mb-4 text-sm text-gray-600">
        预约ID: {{ aid }}
      </view>
      <view v-if="room" class="mb-4 text-sm text-gray-600">
        房间: {{ room }}
      </view>
      <view class="text-center text-gray-400 py-10">
        申诉功能开发中...
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
</style>
