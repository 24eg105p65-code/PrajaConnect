import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, Empty, btn, inputCls, statusLabel } from '../components/ui';
import { ComplaintTable } from '../components/ComplaintTable';
import { STATUSES, Complaint } from '../types';
import { CATEGORIES, LOCATIONS } from '../data/masterData';
import { PENDING } from './Dashboard';

export type Scope = 'mine' | 'all' | 'assigned' | 'completed';

const match = (c: Complaint, f: string) =>
  !f ? true
  : f === 'GROUP_PENDING' ? PENDING.includes(c.status)
  : f === 'GROUP_OPEN' ? c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  : c.status === f;

export default function ComplaintsPage({ scope, preset }: { scope: Scope; preset?: string }) {
  const { user, complaints } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [st, setSt] = useState(preset ?? '');
  const [dist, setDist] = useState('');

  const base = useMemo(() => complaints.filter((c) =>
    scope === 'all' ? true
    : scope === 'mine' ? c.citizenId === user!.id
    : scope === 'assigned' ? c.staffId === user!.id && (c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS')
    : c.staffId === user!.id && (c.status === 'RESOLUTION_SUBMITTED' || c.status === 'RESOLVED')), [complaints, scope, user]);

  const rows = base.filter((c) => {
    const hay = `${c.id} ${c.title} ${c.village} ${c.mandal} ${c.district} ${c.citizenName}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase()) && (!cat || c.category === cat) && (!dist || c.district === dist) && match(c, st);
  });
  const dirty = q || cat || st || dist;
  const copy = {
    mine: ['My complaints', 'Every complaint you have submitted.'],
    all: ['All complaints', 'Search, filter and open any complaint to assign or update it.'],
    assigned: ['My assignments', 'Open a complaint to post a progress update.'],
    completed: ['Completed work', 'Work you submitted for verification or that is already resolved.'],
  }[scope];

  return (
    <>
      <div className="mb-6"><h1 className="text-2xl font-extrabold">{copy[0]}</h1><p className="text-sm text-slate-500">{copy[1]}</p></div>
      <Card className="!p-0">
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search complaints" className={inputCls + ' pl-9'} placeholder="Search by ID, title, village, mandal…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select aria-label="Filter by category" className={inputCls} value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <select aria-label="Filter by district" className={inputCls} value={dist} onChange={(e) => setDist(e.target.value)}><option value="">All districts</option>{Object.keys(LOCATIONS).map((d) => <option key={d}>{d}</option>)}</select>
          <select aria-label="Filter by status" className={inputCls} value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="">All statuses</option>
            <option value="GROUP_PENDING">Pending review (group)</option>
            {scope === 'mine' && <option value="GROUP_OPEN">Open (not closed)</option>}
            {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
          {dirty && <button className={btn.secondary} onClick={() => { setQ(''); setCat(''); setSt(''); setDist(''); }}><X size={14} />Clear</button>}
        </div>
        <p className="px-4 py-2 text-xs font-medium text-slate-500" aria-live="polite">Showing {rows.length} of {base.length} complaints</p>
        {rows.length ? <ComplaintTable rows={rows} showCitizen={scope !== 'mine'} showAssignee={scope === 'all'} /> :
          <Empty title={base.length ? 'No complaints match these filters' : 'Nothing here yet'} text={base.length ? 'Try a different search or clear the filters.' : 'Complaints will appear here as they are created or assigned.'} action={dirty ? <button className={btn.secondary} onClick={() => { setQ(''); setCat(''); setSt(''); setDist(''); }}>Clear filters</button> : undefined} />}
      </Card>
    </>
  );
}
