import type { ReactNode } from 'react';

export function Pill({ color, children }: { color?: string; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-text-muted"
      style={color ? { borderColor: color, color } : undefined}
    >
      {children}
    </span>
  );
}
