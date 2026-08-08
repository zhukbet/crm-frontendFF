import { cn } from '@/lib/utils';
import type { TicketPriority } from '@/types/domain';

const PRIORITY_CLASS: Record<TicketPriority, string> = {
  urgent: 'bg-priority-urgent',
  high: 'bg-priority-high',
  normal: 'bg-priority-normal',
  low: 'bg-priority-low',
};

export function PriorityDot({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={cn('inline-block size-2 shrink-0 rounded-full', PRIORITY_CLASS[priority])}
      title={priority}
    />
  );
}
