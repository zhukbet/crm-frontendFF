import { useState } from 'react';
import { useChatsDirectoryQuery } from '@/hooks/useChats';

/** Section 8б: search/filter chrome + volume/backlog table, GET /api/chats. */
export function ChatsDirectoryPage() {
  const [q, setQ] = useState('');
  const chatsQuery = useChatsDirectoryQuery({ q: q || undefined });

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-medium">Директорія чатів</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Пошук за назвою чату…"
        className="mb-4 w-full max-w-sm rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
      />

      {chatsQuery.isLoading && <p className="text-sm text-text-muted">Завантаження…</p>}
      {chatsQuery.isError && (
        <p className="text-sm text-priority-urgent">
          Не вдалось завантажити чати: {(chatsQuery.error as Error).message}
        </p>
      )}

      {chatsQuery.data && (
        <table className="w-full text-left text-sm">
          <thead className="text-text-muted">
            <tr className="border-b border-border">
              <th className="py-2 font-normal">Чат</th>
              <th className="py-2 font-normal">Група</th>
              <th className="py-2 font-normal">Беклог</th>
              <th className="py-2 font-normal">Всього тікетів</th>
            </tr>
          </thead>
          <tbody>
            {chatsQuery.data.map((chat) => (
              <tr key={chat.id} className="border-b border-border">
                <td className="py-2">{chat.title}</td>
                <td className="py-2 text-text-muted">{chat.chatGroup?.name ?? '—'}</td>
                <td className="py-2">{chat.backlog}</td>
                <td className="py-2">{chat.ticketsTotal}</td>
              </tr>
            ))}
            {chatsQuery.data.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-text-muted">
                  Чатів не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
