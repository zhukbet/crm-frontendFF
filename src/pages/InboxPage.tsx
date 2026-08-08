import { useState } from 'react';
import { PriorityDot } from '@/components/ui/priority-dot';
import { Pill } from '@/components/ui/pill';
import { useMeQuery } from '@/hooks/useAuth';
import {
  useAddCommentMutation,
  useReplyMutation,
  useTicketCommentsQuery,
  useTicketMessagesQuery,
  useTicketQuery,
  useTicketsQuery,
} from '@/hooks/useTickets';
import { cn } from '@/lib/utils';
import type { TicketStatus } from '@/types/domain';

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Відкриті',
  pending: 'Очікують',
  on_hold: 'На паузі',
  solved: 'Вирішені',
  closed: 'Закриті',
};

/** Section 13: three-panel inbox — thread list / conversation / metadata, wired to the real
 * API + WS (see useRealtimeSync in AppShell, which invalidates these queries on server push).
 * Note: the list doesn't show a last-message preview — GET /tickets doesn't return one, and
 * fetching it per-row would mean N+1 requests; would need a small backend addition to do well.
 */
export function InboxPage() {
  const [status, setStatus] = useState<TicketStatus>('open');
  const [selectedId, setSelectedId] = useState<string>();
  const [replyText, setReplyText] = useState('');
  const [commentText, setCommentText] = useState('');

  const { data: me } = useMeQuery();
  const ticketsQuery = useTicketsQuery({ status, limit: 50 });
  const ticketQuery = useTicketQuery(selectedId);
  const messagesQuery = useTicketMessagesQuery(selectedId);
  const commentsQuery = useTicketCommentsQuery(selectedId);
  const reply = useReplyMutation(selectedId ?? '');
  const addComment = useAddCommentMutation(selectedId ?? '');

  const tickets = ticketsQuery.data?.data ?? [];
  const selected = ticketQuery.data;

  function handleSendReply() {
    if (!replyText.trim() || !selectedId) return;
    reply.mutate({ text: replyText }, { onSuccess: () => setReplyText('') });
  }

  function handleAddComment() {
    if (!commentText.trim() || !selectedId) return;
    addComment.mutate({ body: commentText }, { onSuccess: () => setCommentText('') });
  }

  return (
    <div className="flex h-full">
      <section className="w-80 shrink-0 overflow-y-auto border-r border-border">
        <header className="flex items-center justify-between border-b border-border px-3 py-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TicketStatus)}
            className="bg-transparent text-sm font-medium outline-none"
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </header>

        {ticketsQuery.isLoading && <p className="p-3 text-sm text-text-muted">Завантаження…</p>}
        {ticketsQuery.isError && (
          <p className="p-3 text-sm text-priority-urgent">
            Не вдалось завантажити тікети: {(ticketsQuery.error as Error).message}
          </p>
        )}
        {ticketsQuery.isSuccess && tickets.length === 0 && (
          <p className="p-3 text-sm text-text-muted">Тут порожньо.</p>
        )}

        <ul>
          {tickets.map((ticket) => (
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
                  <span className="truncate text-sm font-medium">
                    {ticket.customer.displayName ?? ticket.customer.username ?? 'Клієнт'}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-text-muted">
                    {new Date(ticket.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="truncate text-xs text-text-muted">{ticket.chat.title}</p>
                {ticket.labels.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {ticket.labels.map((tl) => (
                      <Pill key={tl.labelId} color={tl.label.color}>
                        {tl.label.name}
                      </Pill>
                    ))}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex min-w-0 flex-1 flex-col">
        {!selectedId ? (
          <div className="flex flex-1 items-center justify-center text-text-muted">
            Виберіть тред зліва
          </div>
        ) : (
          <>
            <header className="border-b border-border px-4 py-2 text-sm font-medium">
              {selected
                ? `${selected.customer.displayName ?? selected.customer.username ?? 'Клієнт'} · ${selected.chat.title}`
                : '…'}
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messagesQuery.isLoading && <p className="text-sm text-text-muted">Завантаження…</p>}
              {messagesQuery.data?.map((m) => (
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
              {commentsQuery.data?.map((c) => (
                <div key={c.id} className="rounded-lg bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950">
                  <span className="text-xs text-text-muted">{c.agent.name} (внутрішньо):</span>{' '}
                  {c.body}
                </div>
              ))}
            </div>
            <footer className="space-y-2 border-t border-border p-3">
              <div className="flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder="Відповісти клієнту в Telegram…"
                  className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <button
                  onClick={handleSendReply}
                  disabled={reply.isPending}
                  className="rounded-lg bg-brand px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  Надіслати
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Внутрішня нотатка (не йде в Telegram)…"
                  className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-xs outline-none focus:border-brand"
                />
                <button
                  onClick={handleAddComment}
                  disabled={addComment.isPending}
                  className="rounded-lg border border-border px-3 py-2 text-xs disabled:opacity-50"
                >
                  Додати нотатку
                </button>
              </div>
            </footer>
          </>
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
              <div className="text-sm">{STATUS_LABEL[selected.status]}</div>
            </div>
            <div>
              <div className="mb-1 text-xs text-text-muted">Клієнт</div>
              <div className="text-sm">{selected.customer.displayName ?? 'Без імені'}</div>
              {selected.customer.username ? (
                <div className="text-xs text-text-muted">@{selected.customer.username}</div>
              ) : null}
            </div>
            {me && !selected.assigneeId && (
              <p className="text-xs text-text-muted">
                Ще не призначено — дія «беру на себе» (Seq 28) доступна через API
                (`POST /tickets/:id/claim`), кнопки в цьому UI поки нема.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-text-muted">Немає вибраного тікета</p>
        )}
      </aside>
    </div>
  );
}
