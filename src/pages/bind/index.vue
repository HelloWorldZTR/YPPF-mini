<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getUserMe, wxBind } from '@/api/login'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'

definePage({
  style: {
    navigationBarTitleText: '绑定微信账号',
  },
})

const signedOpenid = ref('')
const username = ref('')
const password = ref('')
const tokenStore = useTokenStore()
const userStore = useUserStore()

onLoad((options) => {
  if (options && options.signed_openid) {
    signedOpenid.value = decodeURIComponent(options.signed_openid)
  }
  else {
    uni.showToast({
      title: '缺少签名OpenID',
      icon: 'none',
    })
  }
})

async function handleBind() {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
    return
  }
  if (!signedOpenid.value) {
    uni.showToast({ title: '参数错误', icon: 'none' })
    return
  }

  try {
    const res = await wxBind({
      username: username.value,
      password: password.value,
      signed_openid: signedOpenid.value,
    })

    if (res.status === 'bound') {
      // Store token
      const tokenData = {
        token: res.token,
        expiresIn: res.expires_in,
      }

      tokenStore.setTokenInfo(tokenData)

      // Fetch user info
      const userInfo = await getUserMe()
      userStore.setUserInfo(userInfo)

      uni.showToast({ title: '绑定成功', icon: 'success' })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/index/index' })
      }, 1500)
    }
  }
  catch (err) {
    console.error(err)
    // TODO: 采用更合适的方式显示
    let err_msg = ''
    for (const key in err) {
      err_msg += `${err[key]}\n`
    }
    uni.showToast({ title: err_msg, icon: 'none' })
  }
}
</script>

<template>
  <view class="p-4">
    <view class="mb-4 text-xl font-bold">
      绑定现有账号
    </view>
    <view class="mb-4">
      <view class="mb-2">
        用户名
      </view>
      <input v-model="username" class="w-full border rounded p-2" type="text" placeholder="请输入用户名">
    </view>
    <view class="mb-6">
      <view class="mb-2">
        密码
      </view>
      <input v-model="password" class="w-full border rounded p-2" type="password" password placeholder="请输入密码">
    </view>
    <button class="rounded border-none bg-blue-500 p-2 text-white" @click="handleBind">
      绑定
    </button>
  </view>
</template>
