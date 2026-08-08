import { Outlet } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';
import { GlobalNav } from './GlobalNav';

export function AppShell() {
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
