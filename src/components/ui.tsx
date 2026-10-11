import React, { useEffect } from 'react';
import { X, Inbox, Star } from 'lucide-react';
import { ComplaintStatus } from '../types';

export const cx = (...a: (string | false | undefined | null)[]) => a.filter(Boolean).join(' ');
export const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const fmtDateTime = (s: string) => new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export const statusLabel = (s: string) => { const t = s.replace(/_/g, ' ').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); };

export const btn = {
  primary: 'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50',
  secondary: 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700',
  danger: 'inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600',
  small: 'inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700',
};
export const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20';

const STYLE: Record<ComplaintStatus, string> = {
  SUBMITTED: 'bg-slate-100 text-slate-700 ring-slate-300',
  UNDER_REVIEW: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  ASSIGNED: 'bg-sky-50 text-sky-700 ring-sky-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-800 ring-amber-200',
  RESOLUTION_SUBMITTED: 'bg-violet-50 text-violet-700 ring-violet-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
  NEEDS_INFORMATION: 'bg-orange-50 text-orange-800 ring-orange-200',
};
export const STATUS_COLOR: Record<ComplaintStatus, string> = {
  SUBMITTED: '#94a3b8', UNDER_REVIEW: '#6366f1', ASSIGNED: '#0ea5e9', IN_PROGRESS: '#f59e0b',
  RESOLUTION_SUBMITTED: '#8b5cf6', RESOLVED: '#10b981', REJECTED: '#ef4444', NEEDS_INFORMATION: '#f97316',
};
export const CHART_COLORS = ['#1d4ed8', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return <span className={cx('inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', STYLE[status])}>{statusLabel(status)}</span>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cx('rounded-xl border border-slate-200 bg-white p-5', className)}>{children}</section>;
}

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-3 sm:p-8" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={cx('w-full rounded-2xl bg-white shadow-xl', wide ? 'max-w-4xl' : 'max-w-md')}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500"><Inbox size={22} /></div>
      <p className="font-bold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon, tone = 'text-blue-700 bg-blue-50', onClick }: { label: string; value: number; icon: React.ReactNode; tone?: string; onClick?: () => void }) {
  const inner = (
    <>
      <div className={cx('mb-3 inline-flex rounded-lg p-2', tone)}>{icon}</div>
      <p className="text-3xl font-extrabold tabular-nums">{value}</p>
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </>
  );
  return onClick
    ? <button onClick={onClick} className="rounded-xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">{inner}</button>
    : <div className="rounded-xl border border-slate-200 bg-white p-5">{inner}</div>;
}

export function BarList({ items }: { items: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label} className="grid grid-cols-[8.5rem_1fr_1.5rem] items-center gap-3 text-sm">
          <span className="truncate text-slate-600">{i.label}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${(i.value / max) * 100}%`, background: i.color }} /></span>
          <span className="text-right font-bold tabular-nums">{i.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function Donut({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  const r = 42, C = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label="Complaints by category">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
          {items.filter((i) => i.value > 0).map((i) => {
            const len = (i.value / total) * C;
            const el = <circle key={i.label} cx="50" cy="50" r={r} fill="none" stroke={i.color} strokeWidth="14" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />;
            off += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-extrabold">{total}</span><span className="text-xs text-slate-500">total</span></div>
      </div>
      <ul className="min-w-[10rem] flex-1 space-y-1.5 text-sm">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} /><span className="flex-1 text-slate-600">{i.label}</span><span className="font-bold tabular-nums">{i.value}</span></li>
        ))}
      </ul>
    </div>
  );
}

export function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1" role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={cx(onChange ? 'cursor-pointer' : 'cursor-default')}>
          <Star size={22} className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
        </button>
      ))}
    </div>
  );
}
