import type {
  Feedback,
  FeedbackCreate,
  FeedbackListQuery,
  FeedbackType,
  PatchedFeedbackUpdate,
} from './types/feedback'
import { http } from '@/http/http'

/**
 * 反馈列表：个人为「我发出的反馈」，组织为「收到的反馈」
 */
export function listFeedback(query?: FeedbackListQuery) {
  return http.get<Feedback[]>('/api/v2/feedback/', query)
}

/**
 * 创建反馈（保存草稿或直接提交），仅个人账号
 */
export function createFeedback(data: FeedbackCreate) {
  return http.post<Feedback>('/api/v2/feedback/', data)
}

/**
 * 获取单条反馈详情（需有访问权限）
 */
export function getFeedback(id: string) {
  return http.get<Feedback>(`/api/v2/feedback/${id}/`)
}

/**
 * 修改草稿或提交草稿（仅发布者对草稿可操作）
 */
export function partialUpdateFeedback(id: string, payload: PatchedFeedbackUpdate) {
  return http<Feedback>({
    url: `/api/v2/feedback/${id}/`,
    method: 'PATCH',
    data: payload,
  })
}

/**
 * 删除草稿（仅发布者对草稿可删）
 */
export function deleteFeedback(id: string) {
  return http.delete<void>(`/api/v2/feedback/${id}/`)
}

/**
 * 获取所有反馈类型（表单选项）
 */
export function getFeedbackTypes() {
  return http.get<FeedbackType[]>('/api/v2/feedback/types/')
}
