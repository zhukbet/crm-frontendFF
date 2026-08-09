// Hand-written types mirroring crm-backendFF's actual REST responses (Prisma includes and
// all). Not codegen: `npm run codegen` needs a live backend's /api/docs-json (see README) —
// until then, this file is the source of truth and must be kept in sync by hand.

export type TicketStatus = 'open' | 'pending' | 'on_hold' | 'solved' | 'closed' | 'archived';
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';
export type AgentRole = 'admin' | 'lead' | 'agent';
export type RoutingStrategy = 'manual' | 'round_robin' | 'least_busy';

export interface Agent {
  id: string;
  telegramUserId: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  role: AgentRole;
  isActive: boolean;
}

export interface AgentTeam {
  id: string;
  name: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface TicketLabel {
  ticketId: string;
  labelId: string;
  label: Label;
}

export interface ChatGroup {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
}

export interface Chat {
  id: string;
  telegramChatId: string;
  title: string;
  isActive: boolean;
  chatGroupId: string | null;
  chatGroup?: ChatGroup | null;
  defaultTeamId: string | null;
  defaultAssigneeId: string | null;
  routingStrategy: RoutingStrategy;
  defaultPriority: TicketPriority;
  tags: unknown[];
  /** Only present on GET /chats (directory) and /chats/:id. */
  backlog?: number;
  ticketsTotal?: number;
}

export interface Customer {
  id: string;
  telegramUserId: string;
  username: string | null;
  displayName: string | null;
  organizationId: string | null;
}

export interface Ticket {
  id: string;
  chatId: string;
  customerId: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
  teamId: string | null;
  jiraKey: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  snoozeUntil: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  chat: Chat;
  customer: Customer;
  assignee: Agent | null;
  team: AgentTeam | null;
  labels: TicketLabel[];
}

export interface TicketListResponse {
  data: Ticket[];
  next_cursor: string | null;
}

export interface Message {
  id: string;
  ticketId: string;
  direction: 'in' | 'out';
  sender: 'customer' | 'agent' | 'bot';
  agentId: string | null;
  agent: Agent | null;
  tgMessageId: string | null;
  text: string | null;
  attachments: Array<{ type: string; fileId: string }>;
  createdAt: string;
}

export interface InternalComment {
  id: string;
  ticketId: string;
  agentId: string;
  agent: Agent;
  body: string;
  mentions: string[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  agentId: string;
  type: string;
  ticketId: string | null;
  isRead: boolean;
  createdAt: string;
  payload: Record<string, unknown>;
}

export type NotificationChannel = 'in_app' | 'browser' | 'telegram' | 'email';

export interface NotificationPref {
  agentId: string;
  channel: NotificationChannel;
  eventType: string;
  enabled: boolean;
}

export interface ChatAnalytics {
  chatId: string;
  title: string;
  ticketsOpened: number;
  ticketsClosed: number;
  messagesIn: number;
  messagesOut: number;
  avgFirstResponseSec: number | null;
  avgResolutionSec: number | null;
  backlog: number;
}

export interface AnalyticsOverview {
  ticketsCreated: number;
  byAgent: Array<{ agentId: string | null; agentName?: string; count: number }>;
  byLabel: Array<{ labelId: string; labelName?: string; count: number }>;
}

export interface SavedView {
  id: string;
  ownerId: string | null;
  name: string;
  filter: Record<string, unknown>;
  sort: Record<string, unknown> | null;
}

export interface CannedResponse {
  id: string;
  title: string;
  body: string;
  scope: string;
  variables: unknown[];
}

export interface Organization {
  id: string;
  name: string;
}

export interface ExcludedSender {
  id: string;
  telegramUserId: string | null;
  telegramUsername: string | null;
  name: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
}
