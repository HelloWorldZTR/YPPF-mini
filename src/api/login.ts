import type { IAuthLoginRes, ICaptcha, IDoubleTokenRes, IEverydaySignInRes, IMyAccountsRes, IUserInfoRes, IWxBindRes, IWxLoginRes } from './types/login'
import { http } from '@/http/http'

/**
 * 登录表单
 */
export interface ILoginForm {
  username: string
  password: string
}

export interface IWxBindForm {
  username: string
  password: string
  signed_openid: string
}

/**
 * 获取验证码
 * @returns ICaptcha 验证码
 */
export function getCode() {
  throw new Error('Not implemented.')
  return http.get<ICaptcha>('/user/getCode')
}

/**
 * 用户登录
 * @param loginForm 登录表单
 */
export function login(loginForm: ILoginForm) {
  throw new Error('Not implemented.')
  return http.post<IAuthLoginRes>('/auth/login', loginForm)
}

/**
 * 微信小程序登录
 * @param code 微信登录凭证
 * @param username 用户名，如果没有则登录主用户
 * 返回一个jwt token
 */
export function wxLogin(code: string, username?: string) {
  if (username) {
    return http.post<IWxLoginRes>('/api/v2/auth/wx/login/', { code, username })
  }
  else {
    return http.post<IWxLoginRes>('/api/v2/auth/wx/login/', { code })
  }
}

/**
 * 微信账号绑定
 * @param bindForm 绑定表单
 */
export function wxBind(bindForm: IWxBindForm) {
  return http.post<IWxBindRes>('/api/v2/auth/wx/bind/', bindForm)
}

/**
 * 刷新token
 * @param refreshToken 刷新token
 * @warns 该接口仅在双token模式下可用
 */
export function refreshToken(refreshToken: string) {
  throw new Error('Not implemented.')
  return http.post<IDoubleTokenRes>('/api/v2/auth/refreshToken', { refreshToken })
}

/**
 * 获取当前登录用户信息
 */
export function getUserMe() {
  return http.get<IUserInfoRes>('/api/v2/user/me/')
}

/**
 * 获取微信登录凭证
 * @returns Promise 包含微信登录凭证(code)
 */
export function getWxCode() {
  return new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: res => resolve(res),
      fail: err => reject(new Error(err)),
    })
  })
}

export function everydaySignIn() {
  return http.post<IEverydaySignInRes>('/api/v2/user/daily-login/')
}

export function getMyAccounts() {
  return http.get<IMyAccountsRes>('/api/v2/auth/my-accounts/')
}
