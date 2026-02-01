/** 发布状态：0-草稿 1-已发布 等 */
export type IssueStatus = 0 | 1 | 2

/** 解决状态 */
export type SolveStatus = 0 | 1 | 2 | 3

/** 列表排序字段 */
export type FeedbackOrdering
  = | '-feedback_time'
    | '-modify_time'
    | '-time'
    | 'feedback_time'
    | 'modify_time'
    | 'time'

/** 反馈列表查询参数 */
export interface FeedbackListQuery {
  /** 发布状态筛选 */
  issue_status?: IssueStatus
  /** 解决状态筛选 */
  solve_status?: SolveStatus
  /** 排序 */
  ordering?: FeedbackOrdering
}

/** 反馈类型（表单选项） */
export interface FeedbackType {
  id: string | number
  name: string
  [key: string]: unknown
}

/** 反馈详情/列表项 */
export interface Feedback {
  id: string
  issue_status: IssueStatus
  issue_status_display?: string
  solve_status: SolveStatus
  solve_status_display?: string
  feedback_time?: string
  modify_time?: string
  time?: string
  feedback_type?: string | number
  feedback_type_display?: string
  content?: string
  /** 可选：图片等附件 */
  images?: string[]
  [key: string]: unknown
}

/** 创建反馈请求体（草稿或直接提交） */
export interface FeedbackCreate {
  /** 反馈类型 id */
  feedback_type: string | number
  /** 内容 */
  content: string
  /** 发布状态：0 草稿，1 提交等 */
  issue_status?: IssueStatus
  /** 可选：图片等 */
  images?: string[]
  [key: string]: unknown
}

/** 修改反馈请求体（部分更新） */
export interface PatchedFeedbackUpdate {
  feedback_type?: string | number
  content?: string
  issue_status?: IssueStatus
  images?: string[]
  [key: string]: unknown
}
