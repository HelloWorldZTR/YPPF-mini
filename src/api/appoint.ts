import type {
  IAgreementResponse,
  IArrangeByRoomParams,
  IArrangeTalkRoomParams,
  IArrangeTalkRoomResponse,
  IArrangeTimeResponse,
  ICancelAppointParams,
  ICancelAppointResponse,
  ICheckoutAppointRequest,
  ICheckoutAppointResponse,
  ICheckoutInfoParams,
  ICheckoutInfoResponse,
  IIndexResponse,
  IMyAppointmentsResponse,
  IMyViolationsResponse,
  IRenewLongtermParams,
  IRenewLongtermResponse,
  ISearchUserParams,
  ISearchUserResponse,
  ISignAgreementResponse,
} from './types/appoint'
import { http } from '@/http/http'

/**
 * 获取协议信息
 */
export function getAgreement() {
  return http.get<IAgreementResponse>('/api/v2/appoint/agreement/')
}

/**
 * 签署协议
 */
export function signAgreement(data?: any) {
  return http.post<ISignAgreementResponse>('/api/v2/appoint/agreement/', data)
}

/**
 * 取消预约
 */
export function cancelAppoint(data: ICancelAppointParams) {
  return http.post<ICancelAppointResponse>('/api/v2/appoint/appointments/cancel/', data)
}

/**
 * 续约长期预约
 */
export function renewLongtermAppoint(data: IRenewLongtermParams) {
  return http.post<IRenewLongtermResponse>('/api/v2/appoint/appointments/renew-longterm/', data)
}

/**
 * 获取讨论室安排
 */
export function getArrangeTalkRoomByTime(params: IArrangeTalkRoomParams) {
  return http.get<IArrangeTalkRoomResponse>('/api/v2/appoint/arrange-talk-room-by-time/', params)
}

/**
 * 获取预约时间安排
 */
export function getArrangeByRoom(params: IArrangeByRoomParams) {
  return http.get<IArrangeTimeResponse>('/api/v2/appoint/arrange-by-room/', params)
}

/**
 * 获取预约表单数据 (Checkout)
 */
export function getCheckoutInfo(params: ICheckoutInfoParams) {
  return http.get<ICheckoutInfoResponse>('/api/v2/appoint/checkout/', params)
}

/**
 * 提交预约
 */
export function createAppoint(data: ICheckoutAppointRequest) {
  return http.post<ICheckoutAppointResponse>('/api/v2/appoint/checkout/', data)
}

/**
 * 获取用户预约信息
 */
export function getMyAppointments() {
  return http.get<IMyAppointmentsResponse>('/api/v2/appoint/my-appointments/')
}

/**
 * 获取违约记录
 */
export function getMyViolations() {
  return http.get<IMyViolationsResponse>('/api/v2/appoint/my-violations/')
}

/**
 * 获取主页信息 (Status)
 */
export function getIndexStatus() {
  return http.get<IIndexResponse>('/api/v2/appoint/status/')
}

/**
 * 搜索用户（用于添加预约参与者）
 */
export function searchUsers(params: ISearchUserParams) {
  return http.get<ISearchUserResponse>('/api/v2/appoint/search-users/', params)
}
