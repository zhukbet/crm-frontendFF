// Hand-written placeholder types mirroring the backend's Prisma schema (support-crm-backend,
// section 5 of the spec). Replace with `src/api/generated` once `npm run codegen` can reach a
// live backend's /api/docs-json (see section 22.2 of the spec).

export type TicketStatus = 'open' | 'pending' | 'on_hold' | 'solved' | 'closed';
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';
export type AgentRole = 'admin' | 'lead' | 'agent';

export interface Agent {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  role: AgentRole;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  color?: string;
}

export interface Chat {
  id: string;
  title: string;
  chatGroup?: ChatGroup;
  backlog?: number;
  ticketsTotal?: number;
}

export interface Customer {
  id: string;
  displayName: string;
  username?: string;
}

export interface Ticket {
  id: string;
  status: TicketStatus;
  priority: TicketPriority;
  chat: Chat;
  customer: Customer;
  assignee?: Agent;
  labels: Label[];
  lastMessageSnippet?: string;
  unreadCount?: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  ticketId: string;
  direction: 'in' | 'out';
  sender: 'customer' | 'agent' | 'bot';
  agent?: Agent;
  text?: string;
  createdAt: string;
}

export interface InternalComment {
  id: string;
  ticketId: string;
  agent: Agent;
  body: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  ticketId?: string;
  isRead: boolean;
  createdAt: string;
  payload: Record<string, unknown>;
}
