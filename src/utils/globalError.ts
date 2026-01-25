export function setGlobalError(errorMsg: string) {
  uni.setStorageSync('globalError', errorMsg)
}

export function getGlobalError() {
  return uni.getStorageSync('globalError')
}

export function removeGlobalError() {
  uni.removeStorageSync('globalError')
}