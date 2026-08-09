import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getSocket } from '@/api/socket';
import { useUiStore } from '@/store/ui.store';

/** Section 15: connects to /ws once authenticated and turns each server-pushed event into a
 * react-query cache invalidation, so the UI re-fetches instead of trying to hand-merge partial
 * WS payloads into local state. Simple and correct beats clever and stale for an MVP. */
export function useRealtimeSync(enabled: boolean) {
  const queryClient = useQueryClient();
  const markTicketNew = useUiStore((s) => s.markTicketNew);

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();
    socket.connect();

    const invalidateTickets = () => queryClient.invalidateQueries({ queryKey: ['tickets'] });
    const handleTicketNew = (payload: { ticketId?: string }) => {
      invalidateTickets();
      if (payload?.ticketId) markTicketNew(payload.ticketId);
    };
    const invalidateTicket = (payload: { ticketId?: string }) => {
      invalidateTickets();
      if (payload?.ticketId) {
        queryClient.invalidateQueries({ queryKey: ['ticket', payload.ticketId] });
      }
    };
    const invalidateMessages = (payload: { ticketId?: string }) => {
      if (payload?.ticketId) {
        queryClient.invalidateQueries({ queryKey: ['ticket', payload.ticketId, 'messages'] });
        queryClient.invalidateQueries({ queryKey: ['ticket', payload.ticketId] });
      }
    };
    const invalidateComments = (payload: { ticketId?: string }) => {
      if (payload?.ticketId) {
        queryClient.invalidateQueries({ queryKey: ['ticket', payload.ticketId, 'comments'] });
      }
    };
    const invalidateNotifications = () =>
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

    socket.on('ticket:new', handleTicketNew);
    socket.on('ticket:updated', invalidateTicket);
    socket.on('ticket:assigned', invalidateTicket);
    socket.on('message:new', invalidateMessages);
    socket.on('comment:new', invalidateComments);
    socket.on('notification:new', invalidateNotifications);

    return () => {
      socket.off('ticket:new', handleTicketNew);
      socket.off('ticket:updated', invalidateTicket);
      socket.off('ticket:assigned', invalidateTicket);
      socket.off('message:new', invalidateMessages);
      socket.off('comment:new', invalidateComments);
      socket.off('notification:new', invalidateNotifications);
      socket.disconnect();
    };
  }, [enabled, queryClient, markTicketNew]);
}
