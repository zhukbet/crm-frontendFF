import type { Agent, Chat, InternalComment, Label, Message, NotificationItem, Ticket } from '@/types/domain';

// Placeholder fixtures so the layout is visibly correct before the backend is wired up
// (see support-crm-frontend README — replace with real react-query hooks against `api`).

export const mockAgents: Agent[] = [
  { id: 'a1', name: 'Olga Lead', username: 'olga_lead', role: 'lead' },
  { id: 'a2', name: 'Support Agent', username: 'support_agent', role: 'agent' },
];

export const mockLabels: Label[] = [
  { id: 'l1', name: 'bug', color: '#ef4444' },
  { id: 'l2', name: 'billing', color: '#f59e0b' },
];

const mockChat: Chat = { id: 'c1', title: 'Acme Corp — Support', backlog: 3, ticketsTotal: 12 };

export const mockTickets: Ticket[] = [
  {
    id: 't1',
    status: 'open',
    priority: 'urgent',
    chat: mockChat,
    customer: { id: 'cu1', displayName: 'Ivan Petrenko', username: 'ivan_p' },
    assignee: mockAgents[1],
    labels: [mockLabels[0]],
    lastMessageSnippet: 'Застосунок падає при відкритті звіту…',
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: 't2',
    status: 'pending',
    priority: 'normal',
    chat: mockChat,
    customer: { id: 'cu2', displayName: 'Maria K.' },
    labels: [mockLabels[1]],
    lastMessageSnippet: 'Дякую, чекаю на рахунок',
    updatedAt: new Date(Date.now() - 60 * 60_000).toISOString(),
  },
  {
    id: 't3',
    status: 'open',
    priority: 'low',
    chat: mockChat,
    customer: { id: 'cu3', displayName: 'Denys' },
    labels: [],
    lastMessageSnippet: '👍',
    updatedAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
  },
];

export const mockMessages: Message[] = [
  {
    id: 'm1',
    ticketId: 't1',
    direction: 'in',
    sender: 'customer',
    text: 'Застосунок падає при відкритті звіту за квітень',
    createdAt: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
  {
    id: 'm2',
    ticketId: 't1',
    direction: 'out',
    sender: 'agent',
    agent: mockAgents[1],
    text: 'Привіт! Дивимось, зараз повернемось з деталями.',
    createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
  },
];

export const mockComments: InternalComment[] = [
  {
    id: 'ic1',
    ticketId: 't1',
    agent: mockAgents[0],
    body: '@support_agent це схоже на баг з експортом PDF з минулого тижня',
    createdAt: new Date(Date.now() - 8 * 60_000).toISOString(),
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'message.received',
    ticketId: 't1',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    payload: { ticketId: 't1' },
  },
  {
    id: 'n2',
    type: 'ticket.assigned',
    ticketId: 't2',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
    payload: { ticketId: 't2' },
  },
];
