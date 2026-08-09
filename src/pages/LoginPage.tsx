import { Inbox, Loader2, TriangleAlert } from 'lucide-react';
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
 * hard-disables outside development — see AuthController.devLogin. Tucked behind a closed
 * <details> below so the real Telegram flow reads as the primary, intended path. */
export function LoginPage() {
  const { data: me, isLoading } = useMeQuery();
  const login = useTelegramLoginMutation();
  const devLogin = useDevLoginMutation();
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const [devUsername, setDevUsername] = useState('admin_agent');

  // Always-current ref instead of a `login.mutate` effect dependency: injecting the widget
  // script must happen exactly once (on mount), full stop. Depending on `login` (or even just
  // `login.mutate`) re-ran the effect on renders where that reference changed, tearing down and
  // re-injecting the script — visible in production as a container that's *empty* (caught
  // mid-teardown) as often as it shows the button, and it once escalated into React's "Maximum
  // update depth exceeded". A ref-captured callback sidesteps the question of whether `mutate`
  // is stable entirely: the effect only ever runs once, and always calls the latest mutate.
  const loginMutateRef = useRef(login.mutate);
  loginMutateRef.current = login.mutate;

  useEffect(() => {
    if (!BOT_USERNAME || !widgetContainerRef.current) return;

    window.onTelegramAuth = (user) => loginMutateRef.current(user);

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', BOT_USERNAME);
    script.setAttribute('data-size', 'medium');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    const container = widgetContainerRef.current;
    container.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
      container.replaceChildren();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-text-muted" />
      </div>
    );
  }
  if (me) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen items-center justify-center bg-surface px-4">
      <div className="animate-fade-up w-full max-w-sm rounded-lg border border-border bg-surface-muted p-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Inbox size={24} strokeWidth={1.75} />
        </div>
        <h1 className="mb-1 text-lg font-semibold">Support CRM</h1>
        <p className="mb-6 text-sm text-text-muted">Увійдіть через Telegram, щоб продовжити.</p>

        {BOT_USERNAME ? (
          // Telegram's widget itself (the blue pill button) has its own colors and reads fine
          // directly on a dark card — no light backdrop needed for the common case. The iframe
          // can still occasionally render plain black-on-transparent text (e.g. a misconfigured
          // domain) which would be low-contrast here, but that's a rare setup error, not the
          // normal path, so it's not worth a permanent jarring white box for.
          <div ref={widgetContainerRef} className="flex justify-center py-1" />
        ) : (
          <p className="rounded-lg border border-dashed border-border p-3 text-xs text-text-muted">
            VITE_TELEGRAM_BOT_USERNAME не задано — Telegram-віджет не може завантажитись.
          </p>
        )}

        {login.isError ? (
          <div className="animate-fade-up mt-4 flex items-start gap-2 rounded-lg bg-priority-urgent/10 p-3 text-left text-xs text-priority-urgent">
            <TriangleAlert size={14} className="mt-0.5 shrink-0" />
            <span>Не вдалось увійти: {(login.error as Error).message}</span>
          </div>
        ) : null}

        <details className="group mt-6 text-left">
          <summary className="cursor-pointer list-none text-xs text-text-muted transition-colors hover:text-text">
            Локальний тестовий вхід (без Telegram)
          </summary>
          <form
            className="mt-3 flex gap-2"
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
              {devLogin.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Увійти'}
            </button>
          </form>
          {devLogin.isError ? (
            <p className="mt-2 text-xs text-priority-urgent">{(devLogin.error as Error).message}</p>
          ) : null}
        </details>
      </div>
    </div>
  );
}
