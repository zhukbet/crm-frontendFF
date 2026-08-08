import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  useDevLoginMutation,
  useMeQuery,
  useTelegramLoginMutation,
  type TelegramLoginPayload,
} from '@/hooks/useAuth';

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramLoginPayload) => void;
  }
}

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined;

/** Section 7/22.2: Telegram Login Widget posts the signed user payload to
 * POST /api/auth/telegram/callback (verified server-side via HMAC), which sets the session
 * cookie. VITE_TELEGRAM_BOT_USERNAME must match the bot BOT_TOKEN belongs to on the backend.
 * Dev login (username -> POST /api/auth/dev-login) is a local-testing fallback the backend
 * hard-disables outside development — see AuthController.devLogin. */
export function LoginPage() {
  const { data: me, isLoading } = useMeQuery();
  const login = useTelegramLoginMutation();
  const devLogin = useDevLoginMutation();
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const [devUsername, setDevUsername] = useState('admin_agent');

  useEffect(() => {
    if (!BOT_USERNAME || !widgetContainerRef.current) return;

    window.onTelegramAuth = (user) => login.mutate(user);

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    widgetContainerRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [login]);

  if (!isLoading && me) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-border p-6 text-center">
        <h1 className="mb-2 text-lg font-medium">Support CRM</h1>
        <p className="mb-4 text-sm text-text-muted">Увійдіть через Telegram, щоб продовжити.</p>
        {BOT_USERNAME ? (
          <div ref={widgetContainerRef} className="flex justify-center" />
        ) : (
          <p className="text-xs text-text-muted">
            VITE_TELEGRAM_BOT_USERNAME не задано — Telegram-віджет не може завантажитись.
          </p>
        )}
        {login.isError ? (
          <p className="mt-3 text-xs text-priority-urgent">
            Не вдалось увійти: {(login.error as Error).message}
          </p>
        ) : null}

        <div className="my-4 border-t border-border" />

        <p className="mb-2 text-xs text-text-muted">
          Dev-логін (без Telegram, лише для локального тестування):
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            devLogin.mutate(devUsername);
          }}
        >
          <input
            value={devUsername}
            onChange={(e) => setDevUsername(e.target.value)}
            placeholder="username агента, напр. admin_agent"
            className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={devLogin.isPending || !devUsername.trim()}
            className="rounded-lg bg-brand px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Увійти
          </button>
        </form>
        {devLogin.isError ? (
          <p className="mt-3 text-xs text-priority-urgent">
            {(devLogin.error as Error).message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
