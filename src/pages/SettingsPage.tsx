import { LogOut } from 'lucide-react';
import { useMeQuery, useLogoutMutation } from '@/hooks/useAuth';

export function SettingsPage() {
  const { data: me } = useMeQuery();
  const logout = useLogoutMutation();

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-medium">Налаштування</h1>

      <div className="max-w-sm rounded-lg border border-border p-4">
        <div className="mb-1 text-xs text-text-muted">Ти увійшов як</div>
        <div className="text-sm font-medium">{me?.name}</div>
        <div className="mb-4 text-xs text-text-muted">{me?.role}</div>

        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-priority-urgent disabled:opacity-50"
        >
          <LogOut size={14} strokeWidth={1.75} />
          Вийти
        </button>
      </div>

      <p className="mt-4 text-sm text-text-muted">
        Агенти, команди, лейбли, канали нотифікацій — заглушка, підключити до backend API.
      </p>
    </div>
  );
}
