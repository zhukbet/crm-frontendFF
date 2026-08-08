import { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useMeQuery, useTelegramLoginMutation, type TelegramLoginPayload } from '@/hooks/useAuth';

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramLoginPayload) => void;
  }
}

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined;

/** Section 7/22.2: Telegram Login Widget posts the signed user payload to
 * POST /api/auth/telegram/callback (verified server-side via HMAC), which sets the session
 * cookie. VITE_TELEGRAM_BOT_USERNAME must match the bot BOT_TOKEN belongs to on the backend. */
export function LoginPage() {
  const { data: me, isLoading } = useMeQuery();
  const login = useTelegramLoginMutation();
  const widgetContainerRef = useRef<HTMLDivElement>(null);

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
          <p className="text-xs text-priority-urgent">
            VITE_TELEGRAM_BOT_USERNAME не задано в .env — віджет не може завантажитись.
          </p>
        )}
        {login.isError ? (
          <p className="mt-3 text-xs text-priority-urgent">
            Не вдалось увійти: {(login.error as Error).message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
