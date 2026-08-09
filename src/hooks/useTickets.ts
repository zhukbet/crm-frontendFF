import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type {
  Message,
  InternalComment,
  Ticket,
  TicketListResponse,
  TicketPriority,
  TicketStatus,
} from '@/types/domain';

export interface TicketsFilter {
  status?: TicketStatus;
  assignee?: string;
  team?: string;
  label?: string;
  chat?: string;
  chat_group?: string;
  view?: string;
  q?: string;
  cursor?: string;
  limit?: number;
}

function toQueryString(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function useTicketsQuery(filter: TicketsFilter) {
  return useQuery<TicketListResponse>({
    queryKey: ['tickets', filter],
    queryFn: () => api.get<TicketListResponse>(`/api/tickets${toQueryString(filter)}`),
  });
}

export function useTicketQuery(id: string | undefined) {
  return useQuery<Ticket>({
    queryKey: ['ticket', id],
    queryFn: () => api.get<Ticket>(`/api/tickets/${id}`),
    enabled: Boolean(id),
  });
}

export function useTicketMessagesQuery(id: string | undefined) {
  return useQuery<Message[]>({
    queryKey: ['ticket', id, 'messages'],
    queryFn: () => api.get<Message[]>(`/api/tickets/${id}/messages`),
    enabled: Boolean(id),
  });
}

export function useTicketCommentsQuery(id: string | undefined) {
  return useQuery<InternalComment[]>({
    queryKey: ['ticket', id, 'comments'],
    queryFn: () => api.get<InternalComment[]>(`/api/tickets/${id}/comments`),
    enabled: Boolean(id),
  });
}

function useInvalidateTicket(id: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
  };
}

export function usePatchTicketMutation(id: string) {
  const invalidate = useInvalidateTicket(id);
  return useMutation({
    mutationFn: (patch: {
      status?: TicketStatus;
      priority?: TicketPriority;
      assignee_id?: string | null;
      team_id?: string | null;
      labels?: string[];
      snooze_until?: string | null;
    }) => api.patch<Ticket>(`/api/tickets/${id}`, patch),
    onSuccess: invalidate,
  });
}

export interface UploadedFile {
  fileId: string;
  url: string;
  mimeType: string;
}

/** POST /api/uploads — agent-attached media for a reply. Returns a fileId the reply endpoint
 * accepts directly (see ReplyTicketDto.attachments on the backend). */
export function useUploadFileMutation() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.upload<UploadedFile>('/api/uploads', formData);
    },
  });
}

export function useReplyMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { text: string; attachments?: string[]; asReply?: boolean }) =>
      api.post<Message>(`/api/tickets/${id}/reply`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
    },
  });
}

export function useAddCommentMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { body: string; mentions?: string[] }) =>
      api.post<InternalComment>(`/api/tickets/${id}/comments`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ticket', id, 'comments'] }),
  });
}

export function useClaimMutation(id: string) {
  const invalidate = useInvalidateTicket(id);
  return useMutation({
    mutationFn: () => api.post<Ticket>(`/api/tickets/${id}/claim`),
    onSuccess: invalidate,
  });
}

export function useAssignMutation(id: string) {
  const invalidate = useInvalidateTicket(id);
  return useMutation({
    mutationFn: (payload: { agent_id: string; reason?: string }) =>
      api.post<Ticket>(`/api/tickets/${id}/assign`, payload),
    onSuccess: invalidate,
  });
}

export function useCloseMutation(id: string) {
  const invalidate = useInvalidateTicket(id);
  return useMutation({
    mutationFn: () => api.post<Ticket>(`/api/tickets/${id}/close`),
    onSuccess: invalidate,
  });
}

export function useReopenMutation(id: string) {
  const invalidate = useInvalidateTicket(id);
  return useMutation({
    mutationFn: () => api.post<Ticket>(`/api/tickets/${id}/reopen`),
    onSuccess: invalidate,
  });
}

export function useSnoozeMutation(id: string) {
  const invalidate = useInvalidateTicket(id);
  return useMutation({
    mutationFn: (snoozeUntil: string) =>
      api.post<Ticket>(`/api/tickets/${id}/snooze`, { snooze_until: snoozeUntil }),
    onSuccess: invalidate,
  });
}

export function useBulkActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      ticket_ids: string[];
      action: 'assign' | 'close' | 'label';
      payload: Record<string, unknown>;
    }) => api.post('/api/tickets/bulk', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
}
