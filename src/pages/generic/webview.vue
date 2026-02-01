<script lang="ts" setup>
import { getTicket } from '@/api/login'
import { useTokenStore } from '@/store/token'
import { toBackendURL } from '@/utils'

definePage({
  style: {
  },
})

/* Example: https://yppf.yuanpei.pku.edu.cn/redirect?token=123456&to=https://yppf.yuanpei.pku.edu.cn/xxx */
const uri = ref('/')
const ticket = ref('')
const url = computed(() => `${toBackendURL('/redirect')}?ticket=${ticket.value}&to=${toBackendURL(uri.value)}`)

const tokenStore = useTokenStore()

onLoad((options) => {
  uri.value = options.uri || '/'
  /* 用jwt token获取一次性的ticket */
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
