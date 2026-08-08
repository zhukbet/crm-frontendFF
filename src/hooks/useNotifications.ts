import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { NotificationItem } from '@/types/domain';

export function useNotificationsQuery(unreadOnly?: boolean) {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: () =>
      api.get<NotificationItem[]>(`/api/notifications${unreadOnly ? '?unread=true' : ''}`),
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
