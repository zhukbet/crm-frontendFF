import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAnalyticsChatsQuery, useAnalyticsOverviewQuery } from '@/hooks/useAnalytics';

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const TODAY = new Date();
const WEEK_AGO = new Date(TODAY.getTime() - 6 * 24 * 60 * 60 * 1000);
const RANGE = { from: isoDate(WEEK_AGO), to: isoDate(TODAY) };

/** Section 11: KPI cards + per-chat volume, GET /api/analytics/{overview,chats} over the last
 * 7 days. Note: /analytics/chats sums each chat's activity over the whole range into one
 * number (see backend's chat_stats_daily design) — there's no daily breakdown to plot a real
 * time trend from, so this shows per-chat volume instead of volume-over-time. */
export function AnalyticsPage() {
  const overviewQuery = useAnalyticsOverviewQuery(RANGE);
  const chatsQuery = useAnalyticsChatsQuery(RANGE);

  const totalBacklog = chatsQuery.data?.reduce((sum, c) => sum + c.backlog, 0) ?? 0;
  const responseTimes = (chatsQuery.data ?? [])
    .map((c) => c.avgFirstResponseSec)
    .filter((v): v is number => v !== null);
  const avgFirstResponseMin = responseTimes.length
    ? Math.round(responseTimes.reduce((sum, v) => sum + v, 0) / responseTimes.length / 60)
    : null;

  const KPI = [
    { label: 'Нових тікетів за 7 днів', value: overviewQuery.data?.ticketsCreated ?? '—' },
    { label: 'Сер. час першої відповіді', value: avgFirstResponseMin !== null ? `${avgFirstResponseMin} хв` : '—' },
    { label: 'Поточний беклог', value: totalBacklog },
  ];

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-lg font-medium">Аналітика (останні 7 днів)</h1>

      {(overviewQuery.isError || chatsQuery.isError) && (
        <p className="text-sm text-priority-urgent">Не вдалось завантажити аналітику.</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {KPI.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border p-4">
            <div className="text-xs text-text-muted">{kpi.label}</div>
            <div className="mt-1 text-2xl font-medium">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-text-muted">Обсяг по чатах</h2>
        <div className="h-64 rounded-lg border border-border p-4">
          {chatsQuery.isLoading ? (
            <p className="text-sm text-text-muted">Завантаження…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chatsQuery.data ?? []}>
                <XAxis dataKey="title" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} />
                <Tooltip />
                <Bar dataKey="ticketsOpened" fill="var(--color-brand)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-2 text-sm font-medium text-text-muted">Навантаження по агентах</h2>
          <ul className="space-y-1 text-sm">
            {overviewQuery.data?.byAgent.map((row) => (
              <li key={row.agentId ?? 'unassigned'} className="flex justify-between">
                <span>{row.agentName ?? 'Не призначено'}</span>
                <span className="text-text-muted">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h2 className="mb-2 text-sm font-medium text-text-muted">Обсяг по лейблах</h2>
          <ul className="space-y-1 text-sm">
            {overviewQuery.data?.byLabel.map((row) => (
              <li key={row.labelId} className="flex justify-between">
                <span>{row.labelName ?? row.labelId}</span>
                <span className="text-text-muted">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
