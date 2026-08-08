import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const KPI = [
  { label: 'Відкриті тікети', value: 24 },
  { label: 'Сер. час першої відповіді', value: '8 хв' },
  { label: 'Беклог', value: 7 },
];

const trend = [
  { day: 'Пн', volume: 12 },
  { day: 'Вт', volume: 18 },
  { day: 'Ср', volume: 9 },
  { day: 'Чт', volume: 22 },
  { day: 'Пт', volume: 15 },
];

/** Section 11 skeleton: KPI cards + one placeholder chart. Real data comes from
 * GET /analytics/overview and /analytics/chats once the backend endpoints exist. */
export function AnalyticsPage() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-lg font-medium">Аналітика</h1>
      <div className="grid grid-cols-3 gap-4">
        {KPI.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border p-4">
            <div className="text-xs text-text-muted">{kpi.label}</div>
            <div className="mt-1 text-2xl font-medium">{kpi.value}</div>
          </div>
        ))}
      </div>
      <div className="h-64 rounded-lg border border-border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <XAxis dataKey="day" stroke="currentColor" fontSize={12} />
            <YAxis stroke="currentColor" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="volume" stroke="var(--color-brand)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
