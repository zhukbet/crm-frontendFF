/** Section 22.2 p.3: Telegram Login Widget goes here, posting to
 * {VITE_API_URL}/auth/telegram/callback. Widget script embed is left for real integration —
 * this is just the page shell. */
export function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-border p-6 text-center">
        <h1 className="mb-2 text-lg font-medium">Support CRM</h1>
        <p className="mb-4 text-sm text-text-muted">Увійдіть через Telegram, щоб продовжити.</p>
        <div id="telegram-login-widget" />
      </div>
    </div>
  );
}
