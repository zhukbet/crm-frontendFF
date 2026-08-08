import { mockNotifications } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function NotificationsPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-medium">Нотифікації</h1>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {mockNotifications.map((n) => (
          <li key={n.id} className={cn('px-3 py-2.5 text-sm', !n.isRead && 'bg-surface-muted')}>
            <div className="font-medium">{n.type}</div>
            <div className="text-xs text-text-muted">{new Date(n.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
