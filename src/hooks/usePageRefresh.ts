import { onShow } from '@dcloudio/uni-app'
import { onMounted, ref } from 'vue'

/**
 * 页面自动刷新 composable
 * 用于在页面显示时（包括从其他页面返回时）自动刷新数据
 *
 * @param refreshFn 刷新数据的函数
 * @param options 配置选项
 * @returns 手动刷新函数
 */
export function usePageRefresh(
  refreshFn: () => void | Promise<void>,
  options?: {
    /**
     * 是否应该刷新的条件判断函数，返回 false 时不刷新
     * 例如：检查是否已登录
     */
    shouldRefresh?: () => boolean
    /**
     * 最小刷新间隔（毫秒），默认 2000ms
     * 避免频繁刷新
     */
    minInterval?: number
    /**
     * 是否在 onMounted 时立即刷新，默认 true
     */
    immediate?: boolean
  },
) {
  const {
    shouldRefresh = () => true,
    minInterval = 2000,
    immediate = true,
  } = options || {}

  // 记录上次更新的时间戳
  const lastUpdateTime = ref(0)
  // 记录页面栈长度，用于判断是否从其他页面返回
  const lastPageStackLength = ref(0)

  // 执行刷新
  const doRefresh = async () => {
    if (!shouldRefresh()) {
      return
    }

    const currentPageStackLength = getCurrentPages().length
    const now = Date.now()
    // 判断是否从其他页面返回：页面栈长度变化，或者距离上次更新超过最小间隔
    const isFromOtherPage = currentPageStackLength !== lastPageStackLength.value
    const shouldUpdate = isFromOtherPage || (now - lastUpdateTime.value > minInterval)

    if (shouldUpdate) {
      await refreshFn()
      lastUpdateTime.value = now
    }

    // 更新页面栈长度
    lastPageStackLength.value = currentPageStackLength
  }

  onMounted(() => {
    // 初始化页面栈长度
    lastPageStackLength.value = getCurrentPages().length
    if (immediate) {
      doRefresh()
    }
  })

  onShow(() => {
    doRefresh()
  })

  // 返回手动刷新函数
  return {
    refresh: doRefresh,
  }
}
