import { Loader2, Paperclip, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { PriorityDot } from '@/components/ui/priority-dot';
import { Pill } from '@/components/ui/pill';
import {
  useAddCommentMutation,
  useClaimMutation,
  usePatchTicketMutation,
  useReplyMutation,
  useTicketCommentsQuery,
  useTicketMessagesQuery,
  useTicketQuery,
  useTicketsQuery,
  useUploadFileMutation,
  type UploadedFile,
} from '@/hooks/useTickets';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui.store';
import type { TicketStatus } from '@/types/domain';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Відкриті',
  pending: 'Очікують',
  on_hold: 'На паузі',
  solved: 'Вирішені',
  closed: 'Закриті',
  archived: 'Архів',
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
  const [asReply, setAsReply] = useState(true);
  const [pendingAttachments, setPendingAttachments] = useState<UploadedFile[]>([]);
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ticketsQuery = useTicketsQuery({ status, limit: 50 });
  const ticketQuery = useTicketQuery(selectedId);
  const messagesQuery = useTicketMessagesQuery(selectedId);
  const commentsQuery = useTicketCommentsQuery(selectedId);
  const reply = useReplyMutation(selectedId ?? '');
  const uploadFile = useUploadFileMutation();
  const addComment = useAddCommentMutation(selectedId ?? '');
  const claim = useClaimMutation(selectedId ?? '');
  const patchTicket = usePatchTicketMutation(selectedId ?? '');
  const newTicketIds = useUiStore((s) => s.newTicketIds);
  const clearTicketNew = useUiStore((s) => s.clearTicketNew);

  const tickets = ticketsQuery.data?.data ?? [];
  const selected = ticketQuery.data;

  function handleSelectTicket(id: string) {
    setSelectedId(id);
    clearTicketNew(id);
  }

  function handleSendReply() {
    if ((!replyText.trim() && pendingAttachments.length === 0) || !selectedId) return;
    reply.mutate(
      { text: replyText, asReply, attachments: pendingAttachments.map((a) => a.fileId) },
      {
        onSuccess: () => {
          setReplyText('');
          setPendingAttachments([]);
        },
      },
    );
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file || !selectedId) return;
    uploadFile.mutate(file, {
      onSuccess: (uploaded) => setPendingAttachments((prev) => [...prev, uploaded]),
    });
  }

  function removePendingAttachment(fileId: string) {
    setPendingAttachments((prev) => prev.filter((a) => a.fileId !== fileId));
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
                onClick={() => handleSelectTicket(ticket.id)}
                className={cn(
                  'flex w-full flex-col gap-1 border-b border-border px-3 py-2.5 text-left hover:bg-surface-muted',
                  ticket.id === selectedId && 'bg-surface-muted',
                )}
              >
                <div className="flex items-center gap-2">
                  {newTicketIds.has(ticket.id) ? (
                    <span
                      className="inline-block size-2 shrink-0 rounded-full bg-emerald-500"
                      title="Новий тред"
                    />
                  ) : (
                    <PriorityDot priority={ticket.priority} />
                  )}
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
                  {m.attachments.length > 0 && (
                    <div className={cn('space-y-1', m.text && 'mt-1.5')}>
                      {m.attachments.map((a, i) =>
                        m.direction === 'out' ? (
                          <a
                            key={i}
                            href={`${API_URL}/uploads/${a.fileId}`}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              'flex items-center gap-1 text-xs underline underline-offset-2',
                              m.direction === 'out' && 'text-white',
                            )}
                          >
                            <Paperclip size={11} /> Вкладення
                          </a>
                        ) : (
                          <div key={i} className="flex items-center gap-1 text-xs text-text-muted">
                            <Paperclip size={11} /> Вкладення
                          </div>
                        ),
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      'mt-1 text-right text-[10px]',
                      m.direction === 'in' ? 'text-text-muted' : 'text-white/70',
                    )}
                  >
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
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
              <label className="flex items-center gap-1.5 text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={asReply}
                  onChange={(e) => setAsReply(e.target.checked)}
                  className="accent-brand"
                />
                Відповісти як reply (з цитатою повідомлення клієнта в Telegram)
              </label>
              {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {pendingAttachments.map((a) => (
                    <span
                      key={a.fileId}
                      className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs"
                    >
                      <Paperclip size={11} /> {a.fileId}
                      <button
                        onClick={() => removePendingAttachment(a.fileId)}
                        className="text-text-muted hover:text-priority-urgent"
                        title="Прибрати"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelected}
                className="hidden"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadFile.isPending}
                  title="Прикріпити файл"
                  className="rounded-lg border border-border px-2.5 text-text-muted hover:text-text disabled:opacity-50"
                >
                  {uploadFile.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Paperclip size={16} />
                  )}
                </button>
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
              {uploadFile.isError ? (
                <p className="text-xs text-priority-urgent">
                  Не вдалось завантажити файл: {(uploadFile.error as Error).message}
                </p>
              ) : null}
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
              <div className="mb-1 text-xs text-text-muted">Чат</div>
              <div className="truncate text-sm">{selected.chat.title}</div>
              {selected.chat.chatGroup ? (
                <div className="text-xs text-text-muted">{selected.chat.chatGroup.name}</div>
              ) : null}
            </div>
            <div>
              <div className="mb-1 text-xs text-text-muted">Пріоритет</div>
              <div className="flex items-center gap-2 text-sm">
                <PriorityDot priority={selected.priority} /> {selected.priority}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs text-text-muted">Виконавець</div>
              <div className="text-sm">{selected.assignee?.name ?? 'Не призначено'}</div>
              {!selected.assigneeId && (
                <button
                  onClick={() => claim.mutate()}
                  disabled={claim.isPending}
                  className="mt-2 flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  {claim.isPending && <Loader2 size={12} className="animate-spin" />}
                  Взяти на себе
                </button>
              )}
              {claim.isError ? (
                <p className="mt-1 text-xs text-priority-urgent">
                  {(claim.error as Error).message}
                </p>
              ) : null}
            </div>
            <div>
              <div className="mb-1 text-xs text-text-muted">Статус</div>
              <select
                value={selected.status}
                onChange={(e) => patchTicket.mutate({ status: e.target.value as TicketStatus })}
                disabled={patchTicket.isPending}
                className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-sm outline-none focus:border-brand disabled:opacity-50"
              >
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {patchTicket.isError ? (
                <p className="mt-1 text-xs text-priority-urgent">
                  {(patchTicket.error as Error).message}
                </p>
              ) : null}
            </div>
            <div>
              <div className="mb-1 text-xs text-text-muted">Клієнт</div>
              <div className="text-sm">{selected.customer.displayName ?? 'Без імені'}</div>
              {selected.customer.username ? (
                <div className="text-xs text-text-muted">@{selected.customer.username}</div>
              ) : null}
            </div>
          </>
        ) : (
          <p className="text-sm text-text-muted">Немає вибраного тікета</p>
        )}
      </aside>
    </div>
  );
}
