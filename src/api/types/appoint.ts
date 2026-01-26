// FIXME: 根据原先网页前端生成的，包含了很多多余的字段
// FIXME: 等完成之后，根据需要清理和重组

// 协议信息响应
export interface IAgreementResponse {
  agree_time: string | null
}

// 签署协议响应
export interface ISignAgreementResponse {
  message: string
}

// 取消预约请求参数
export interface ICancelAppointParams {
  type: 'appoint' | 'longterm'
  cancel_id: number
}

// 取消预约响应
export interface ICancelAppointResponse {
  message: string
  room_name?: string
}

// 续约长期预约请求参数
export interface IRenewLongtermParams {
  longterm_id: number
  times: number
}

// 续约长期预约响应
export interface IRenewLongtermResponse {
  message: string
  room_name?: string
}

// 房间时间槽
export interface IRoomTimeSlot {
  status: number
  time_id: number
  Rid: string
  starttime: string
  display_info?: string | null
}

// 讨论室安排请求参数
export interface IArrangeTalkRoomParams {
  day: number
  month: number
  type: 'russ' | 'talk'
  year: number
}

// 讨论室安排响应
export interface IArrangeTalkRoomResponse {
  rooms_time_list: IRoomTimeSlot[][]
  weekday: string
  is_today: boolean
  show_min?: number
  width: number
}

// 房间信息
export interface IRoom {
  Rid: string
  Rtitle: string
  Rmin: number
  Rmax: number
  Rstart: string
  Rfinish: string
  Rpresent: number
  Rstatus: number // RstatusEnum 0, 1, 2
  status_display: string
  RIsAllNight: boolean
  RneedAgree: boolean
}

// 时间段
export interface ITimeSection {
  starttime: string
  status: number
  id: number
  display_info?: string | null
  // [key: string]: any;
}

// 日期范围
export interface IDayRange {
  weekday: string
  date: string
  year: number
  month: number
  day: number
  timesection: ITimeSection[]
}

// 预约时间安排请求参数
export interface IArrangeByRoomParams {
  Rid: string
  start_week?: 0 | 1
}

// 预约时间安排响应
export interface IArrangeTimeResponse {
  room: IRoom
  has_longterm_permission: boolean
  allow_overlap: boolean
  max_appoint_time: number
  is_person: boolean
  is_longterm: boolean
  start_week: number
  dayrange_list: IDayRange[]
  available_hours: Record<string, number>
  function_room_list: IRoom[]
  talk_room_list: IRoom[]
}

// 预约Checkout信息请求参数
export interface ICheckoutInfoParams {
  Rid: string
  endid?: number
  start_week?: 0 | 1
  startid?: number
  weekday?: 'Fri' | 'Mon' | 'Sat' | 'Sun' | 'Thu' | 'Tue' | 'Wed'
}

// 预约Checkout信息响应
export interface ICheckoutInfoResponse {
  room?: {
    Rid: string
    Rtitle: string
    Rmin: number
    Rmax: number
    Rstart: string
    Rfinish: string
    Rpresent: number
    Rstatus: number
    status_display: string
    RIsAllNight: boolean
    RneedAgree: boolean
  }
  appoint_params?: Record<string, any>
  has_longterm_permission?: boolean
  has_interview_permission?: boolean
  interview_max_count?: number
  member_ids?: any[]
}

// 提交预约请求参数
export interface ICheckoutAppointRequest {
  Rid: string
  weekday: 'Fri' | 'Mon' | 'Sat' | 'Sun' | 'Thu' | 'Tue' | 'Wed'
  startid: number
  endid: number
  longterm?: boolean
  start_week?: 0 | 1
  times?: number
  interval?: number
  interview?: boolean
  Ausage: string
  announcement?: string
  non_yp_num?: number
  students?: string[]
}

// 提交预约响应
export interface ICheckoutAppointResponse {
  success: boolean
  message: string
  appoint_id?: number | null
  longterm_id?: number | null
  room_name?: string | null
}

// 用户信息
export interface IUserInfo {
  id: string
  name: string
  credit: number
  agree_time?: string | null
}

// 预约显示信息
export interface IAppointDisplay {
  Aid: number
  Rid?: string | null
  Rtitle?: string | null
  Astart: string
  Afinish: string
  Astart_hour_minute: string
  Afinish_hour_minute: string
  Ausage?: string | null
  major_student?: any | null
  is_appointer?: boolean
  can_cancel?: boolean
  Aweek?: string
  Atype?: string
  Astatus?: string
  Atime?: string
  Aannouncement?: string | null
  Areason?: number
  yp_num?: number
  non_yp_num?: number
  students?: any[]
}

// 长期预约显示信息
export interface ILongtermAppointDisplay {
  longterm_id: number
  appoint: IAppointDisplay
  times: number
  interval: number
  status: string
  renewable: boolean
  review_comment?: string
}

// 我的预约响应
export interface IMyAppointmentsResponse {
  user_info: IUserInfo
  img_path: string
  has_longterm_permission: boolean
  appoint_list_future: IAppointDisplay[]
  appoint_list_past: IAppointDisplay[]
  appoint_list_longterm: ILongtermAppointDisplay[]
  longterm_count?: number
  is_full?: boolean
  show_admin: boolean
}

// 违规预约信息
export interface IViolationAppoint extends IAppointDisplay {
  Room?: string | null
}

// 我的违规响应
export interface IMyViolationsResponse {
  user_info: IUserInfo
  img_path?: string
  vio_list: IViolationAppoint[]
  show_admin: boolean
}

// 房间统计信息
export interface IRoomStatistics {
  room: IRoom
  occupancy_percentage: number
}

// 房间占用信息
export interface IRoomInfo {
  room: IRoom
  is_occupied: boolean
  next_available_time?: string | null
}

// 学院通知
export interface ICollegeAnnouncement {
  id: number
  announcement: string
  show: number
}

// 首页状态响应
export interface IIndexResponse {
  function_room_list: IRoom[]
  statistics_info: IRoomStatistics[]
  talk_room_list: IRoom[]
  room_info: IRoomInfo[]
  russian_room_list: IRoom[]
  russ_len: number
  announcements: ICollegeAnnouncement[]
  show_admin: boolean
}

// 搜索用户请求参数
export interface ISearchUserParams {
  query?: string
  limit?: number
}

// 搜索用户结果项
export interface ISearchUserItem {
  id: number
  name: string
}

// 搜索用户响应
export type ISearchUserResponse = ISearchUserItem[]
