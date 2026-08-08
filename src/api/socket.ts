import { io, type Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000';

let socket: Socket | null = null;

/** Lazily connects to the backend's /ws namespace (see support-crm-backend README for the
 * documented event list: ticket:new, ticket:updated, ticket:assigned, message:new,
 * comment:new, agent:typing, notification:new). */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${WS_URL}/ws`, { withCredentials: true, autoConnect: false });
  }
  return socket;
}
