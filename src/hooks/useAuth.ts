import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/api/client';
import type { Agent } from '@/types/domain';

/** Section 7: GET /api/agents/me — also doubles as "am I logged in" for route guarding.
 * A 401 here just means "not authenticated", not an error worth retrying or surfacing loudly. */
export function useMeQuery() {
  return useQuery<Agent, ApiError>({
    queryKey: ['me'],
    queryFn: () => api.get<Agent>('/api/agents/me'),
    retry: false,
    staleTime: 60_000,
  });
}

export interface TelegramLoginPayload {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function useTelegramLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TelegramLoginPayload) =>
      api.post<{ id: string; name: string; role: string }>('/api/auth/telegram/callback', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/auth/logout'),
    onSuccess: () => queryClient.setQueryData(['me'], undefined),
  });
}
