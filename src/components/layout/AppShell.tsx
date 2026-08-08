import { Navigate, Outlet } from 'react-router-dom';
import { useMeQuery } from '@/hooks/useAuth';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { CommandPalette } from './CommandPalette';
import { GlobalNav } from './GlobalNav';

/** Route guard for everything under `/`: redirects to /login if there's no active session
 * (GET /api/agents/me fails with 401), and only opens the WS connection once authenticated. */
export function AppShell() {
  const { data: me, isLoading, isError } = useMeQuery();
  useRealtimeSync(Boolean(me));

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-text-muted">Завантаження…</div>;
  }
  if (isError || !me) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-text">
      <GlobalNav />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  );
}
