import { useState } from 'react';
import { PriorityDot } from '@/components/ui/priority-dot';
import { Pill } from '@/components/ui/pill';
import { mockComments, mockMessages, mockTickets } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

/** Section 13: three-panel inbox skeleton — thread list / conversation / metadata. Wired to
 * mock data for now; swap for react-query hooks against `api` + WS live updates later. */
export function InboxPage() {
  const [selectedId, setSelectedId] = useState(mockTickets[0]?.id);
  const selected = mockTickets.find((t) => t.id === selectedId);
  const messages = mockMessages.filter((m) => m.ticketId === selectedId);
  const comments = mockComments.filter((c) => c.ticketId === selectedId);

  return (
    <div className="flex h-full">
      <section className="w-80 shrink-0 overflow-y-auto border-r border-border">
        <header className="border-b border-border px-3 py-2 text-sm font-medium">
          Усі відкриті
        </header>
        <ul>
          {mockTickets.map((ticket) => (
            <li key={ticket.id}>
              <button
                onClick={() => setSelectedId(ticket.id)}
                className={cn(
                  'flex w-full flex-col gap-1 border-b border-border px-3 py-2.5 text-left hover:bg-surface-muted',
                  ticket.id === selectedId && 'bg-surface-muted',
                )}
              >
                <div className="flex items-center gap-2">
                  <PriorityDot priority={ticket.priority} />
                  <span className="truncate text-sm font-medium">{ticket.customer.displayName}</span>
                  {ticket.unreadCount ? (
                    <span className="ml-auto rounded-full bg-brand px-1.5 text-xs text-white">
                      {ticket.unreadCount}
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-xs text-text-muted">{ticket.lastMessageSnippet}</p>
                <div className="flex items-center gap-1">
                  {ticket.labels.map((l) => (
                    <Pill key={l.id} color={l.color}>
                      {l.name}
                    </Pill>
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <header className="border-b border-border px-4 py-2 text-sm font-medium">
              {selected.customer.displayName} · {selected.chat.title}
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-md rounded-lg px-3 py-2 text-sm',
                    m.direction === 'in' ? 'bg-surface-muted' : 'ml-auto bg-brand text-white',
                  )}
                >
                  {m.text}
                </div>
              ))}
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950">
                  <span className="text-xs text-text-muted">{c.agent.name} (внутрішньо):</span>{' '}
                  {c.body}
                </div>
              ))}
            </div>
            <footer className="border-t border-border p-3">
              <input
                placeholder="Відповісти клієнту в Telegram…"
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </footer>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-text-muted">
            Виберіть тред зліва
          </div>
        )}
      </section>

      <aside className="w-72 shrink-0 space-y-4 overflow-y-auto border-l border-border p-4">
        {selected ? (
          <>
            <div>
              <div className="mb-1 text-xs text-text-muted">Пріоритет</div>
              <div className="flex items-center gap-2 text-sm">
                <PriorityDot priority={selected.priority} /> {selected.priority}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-text-muted">Виконавець</div>
              <div className="text-sm">{selected.assignee?.name ?? 'Не призначено'}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-text-muted">Статус</div>
              <div className="text-sm">{selected.status}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-text-muted">Клієнт</div>
              <div className="text-sm">{selected.customer.displayName}</div>
              {selected.customer.username ? (
                <div className="text-xs text-text-muted">@{selected.customer.username}</div>
              ) : null}
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}
