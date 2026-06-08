import clsx from 'clsx';

const STATUS_CONFIG: Record<string, { label: string; dot: string; cls: string }> = {
  active:   { label: 'Active',   dot: 'bg-emerald-500', cls: 'badge-active' },
  on_hold:  { label: 'On Hold',  dot: 'bg-amber-500',   cls: 'badge-on_hold' },
  matched:  { label: 'Matched',  dot: 'bg-violet-500',  cls: 'badge-matched' },
  paused:   { label: 'Paused',   dot: 'bg-slate-400',   cls: 'badge-paused' },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, dot: 'bg-gray-400', cls: 'badge' };
  return (
    <span className={cfg.cls}>
      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
