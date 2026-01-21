import type { Notification, NotificationListQuery, NotificationStatistics, NotificationStatusUpdate } from './types/notification'
import { http } from '@/http/http'

export function listNotifications(query?: NotificationListQuery) {
  return http.get<Notification[]>('/api/v2/notification/', query)
}

export function getNotification(id: number) {
  return http.get<Notification>(`/api/v2/notification/${id}/`)
}

export function toggleNotificationStatus(id: number) {
  return http.post<Notification>(`/api/v2/notification/${id}/toggle-status/`)
}

export function updateNotificationStatus(id: number, payload: NotificationStatusUpdate) {
  return http<Notification>({
    url: `/api/v2/notification/${id}/update-status/`,
    method: 'PATCH',
    data: payload,
  })
}

export function deleteAllReadNotifications() {
  return http.post<void>('/api/v2/notification/delete-all-read/')
}

export function markAllNotificationsRead() {
  return http.post<void>('/api/v2/notification/mark-all-read/')
}

export function getNotificationStatistics() {
  return http.get<NotificationStatistics>('/api/v2/notification/statistics/')
}
