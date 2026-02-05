<script lang="ts" setup>
import { getTicket } from '@/api/login'
import { toBackendURL } from '@/utils'

definePage({
  style: {
  },
})

/* 对于不需要登录的页面isPublic=true，不需要换ticket，直接访问即可 */
const uri = ref('/')
const ticket = ref('')
const isPublic = ref(false)
const url = computed(() => {
  if (isPublic.value)
    return toBackendURL(uri.value)
  return `${toBackendURL('/redirect')}?ticket=${ticket.value}&to=${encodeURIComponent(toBackendURL(uri.value))}`
})

onLoad((options) => {
  uri.value = decodeURIComponent(options.uri || '/')
  isPublic.value = options.public === '1' || options.public === 'true'

  if (isPublic.value)
    return
  getTicket().then((res) => {
    ticket.value = res.ticket
  }).catch((err) => {
    console.error(err)
    uni.showToast({
      title: '登录失败',
      icon: 'error',
    })
  })
})
</script>

<template>
  <view class="h-full w-full">
    <web-view :src="url" />
  </view>
</template>
