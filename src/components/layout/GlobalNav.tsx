import { BarChart3, Bell, Inbox, MessagesSquare, Moon, Search, Settings, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui.store';

const NAV_ITEMS = [
  { to: '/', label: 'Inbox', icon: Inbox, end: true },
  { to: '/chats', label: 'Чати', icon: MessagesSquare },
  { to: '/analytics', label: 'Аналітика', icon: BarChart3 },
  { to: '/notifications', label: 'Нотифікації', icon: Bell },
  { to: '/settings', label: 'Налаштування', icon: Settings },
];

export function GlobalNav() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);

  return (
    <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-border bg-surface-muted py-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={label}
          className={({ isActive }) =>
            cn(
              'flex size-11 flex-col items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface hover:text-text',
              isActive && 'bg-surface text-brand',
            )
          }
        >
          <Icon size={20} strokeWidth={1.75} />
        </NavLink>
      ))}

      <div className="flex-1" />

      <button
        title="Command palette (⌘K)"
        onClick={() => setCommandPaletteOpen(true)}
        className="flex size-11 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text"
      >
        <Search size={18} strokeWidth={1.75} />
      </button>
      <button
        title="Toggle theme"
        onClick={toggleTheme}
        className="flex size-11 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text"
      >
        {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
      </button>
    </nav>
  );
}
