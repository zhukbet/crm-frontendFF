import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Chat, ChatGroup } from '@/types/domain';

export function useChatsDirectoryQuery(params: { chat_group?: string; q?: string } = {}) {
  const search = new URLSearchParams();
  if (params.chat_group) search.set('chat_group', params.chat_group);
  if (params.q) search.set('q', params.q);
  const qs = search.toString();

  return useQuery<Chat[]>({
    queryKey: ['chats', params],
    queryFn: () => api.get<Chat[]>(`/api/chats${qs ? `?${qs}` : ''}`),
  });
}

export function useChatGroupsQuery() {
  return useQuery<ChatGroup[]>({
    queryKey: ['chat-groups'],
    queryFn: () => api.get<ChatGroup[]>('/api/chat-groups'),
  });
}
