import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

const TYPE_LABEL: Record<string, string> = {
  'message.received': 'Нове повідомлення в заасайненому треді',
  'ticket.assigned': 'Вам призначили тікет',
  'comment.mention': 'Вас згадали в коментарі',
};

export function NotificationsPage() {
  const notificationsQuery = useNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();

  const notifications = notificationsQuery.data ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium">Нотифікації</h1>
        <button
          onClick={() => markAllRead.mutate()}
          disabled={!hasUnread || markAllRead.isPending}
          className="text-xs text-brand disabled:opacity-40"
        >
          Прочитати все
        </button>
      </div>

      {notificationsQuery.isLoading && <p className="text-sm text-text-muted">Завантаження…</p>}
      {notificationsQuery.isError && (
        <p className="text-sm text-priority-urgent">Не вдалось завантажити нотифікації.</p>
      )}

      <ul className="divide-y divide-border rounded-lg border border-border">
        {notifications.map((n) => (
          <li
            key={n.id}
            onClick={() => !n.isRead && markRead.mutate(n.id)}
            className={cn('cursor-pointer px-3 py-2.5 text-sm', !n.isRead && 'bg-surface-muted')}
          >
            <div className="font-medium">{TYPE_LABEL[n.type] ?? n.type}</div>
            <div className="text-xs text-text-muted">{new Date(n.createdAt).toLocaleString()}</div>
          </li>
        ))}
        {notifications.length === 0 && !notificationsQuery.isLoading && (
          <li className="px-3 py-6 text-center text-sm text-text-muted">Нема нотифікацій</li>
        )}
      </ul>
    </div>
  );
}
