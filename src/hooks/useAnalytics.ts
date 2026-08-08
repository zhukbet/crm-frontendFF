import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { AnalyticsOverview, ChatAnalytics } from '@/types/domain';

export interface AnalyticsRange {
  from: string; // ISO date, e.g. 2026-08-01
  to: string;
  chat_group?: string;
}

function rangeQuery(range: AnalyticsRange): string {
  const search = new URLSearchParams({ from: range.from, to: range.to });
  if (range.chat_group) search.set('chat_group', range.chat_group);
  return search.toString();
}

export function useAnalyticsChatsQuery(range: AnalyticsRange) {
  return useQuery<ChatAnalytics[]>({
    queryKey: ['analytics', 'chats', range],
    queryFn: () => api.get<ChatAnalytics[]>(`/api/analytics/chats?${rangeQuery(range)}`),
  });
}

export function useAnalyticsOverviewQuery(range: AnalyticsRange) {
  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview', range],
    queryFn: () => api.get<AnalyticsOverview>(`/api/analytics/overview?${rangeQuery(range)}`),
  });
}
