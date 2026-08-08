import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/store/ui.store';

const ACTIONS = [
  { label: 'Перейти в Inbox', to: '/' },
  { label: 'Перейти в Чати', to: '/chats' },
  { label: 'Перейти в Аналітику', to: '/analytics' },
  { label: 'Перейти в Нотифікації', to: '/notifications' },
];

/** Cmd/Ctrl-K palette (section 12/13). Skeleton: navigation only, no fuzzy search/actions yet. */
export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-32"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          placeholder="Швидка дія…"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none"
        />
        <ul className="max-h-72 overflow-y-auto py-1">
          {ACTIONS.map((action) => (
            <li key={action.to}>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-surface-muted"
                onClick={() => {
                  navigate(action.to);
                  setOpen(false);
                }}
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
