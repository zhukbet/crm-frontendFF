import { mockTickets } from '@/lib/mock-data';

/** Section 8б skeleton: search/filter chrome + volume/backlog table. Static for now. */
export function ChatsDirectoryPage() {
  const chats = [...new Map(mockTickets.map((t) => [t.chat.id, t.chat])).values()];

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-medium">Директорія чатів</h1>
      <table className="w-full text-left text-sm">
        <thead className="text-text-muted">
          <tr className="border-b border-border">
            <th className="py-2 font-normal">Чат</th>
            <th className="py-2 font-normal">Беклог</th>
            <th className="py-2 font-normal">Всього тікетів</th>
          </tr>
        </thead>
        <tbody>
          {chats.map((chat) => (
            <tr key={chat.id} className="border-b border-border">
              <td className="py-2">{chat.title}</td>
              <td className="py-2">{chat.backlog}</td>
              <td className="py-2">{chat.ticketsTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
