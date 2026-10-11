import { ClipboardList, Clock, CheckCircle2, UserCheck, Wrench, ShieldCheck, ListChecks, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Complaint, Page, STATUSES } from '../types';
import { BarList, CHART_COLORS, Card, Donut, Empty, STATUS_COLOR, StatCard, btn, statusLabel } from '../components/ui';
import { ComplaintTable } from '../components/ComplaintTable';
import { CATEGORIES } from '../data/masterData';

export const PENDING = ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION'];
type Go = (p: Page, preset?: string) => void;

export default function Dashboard({ go }: { go: Go }) {
  const { user, complaints } = useApp();
  if (!user) return null;
  if (user.role === 'ADMIN') return <Admin all={complaints} go={go} />;
  if (user.role === 'STAFF') return <Staff mine={complaints.filter((c) => c.staffId === user.id)} go={go} />;
  return <Citizen mine={complaints.filter((c) => c.citizenId === user.id)} go={go} />;
}

const Title = ({ t, s, action }: { t: string; s: string; action?: React.ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold">{t}</h1><p className="text-sm text-slate-500">{s}</p></div>{action}</div>
);
const count = (l: Complaint[], f: (c: Complaint) => boolean) => l.filter(f).length;
const statusItems = (l: Complaint[]) => STATUSES.map((s) => ({ label: statusLabel(s), value: count(l, (c) => c.status === s), color: STATUS_COLOR[s] }));

function Citizen({ mine, go }: { mine: Complaint[]; go: Go }) {
  const { user } = useApp();
  const recent = [...mine].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return (
    <>
      <Title t={`Welcome, ${user!.name.split(' ')[0]}`} s="Here is where your complaints stand." action={<button className={btn.primary} onClick={() => go('submit')}><PlusCircle size={16} />Submit a complaint</button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total complaints" value={mine.length} icon={<ClipboardList size={20} />} onClick={() => go('complaints')} />
        <StatCard label="Pending complaints" value={count(mine, (c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED')} icon={<Clock size={20} />} tone="bg-amber-50 text-amber-700" onClick={() => go('complaints', 'GROUP_OPEN')} />
        <StatCard label="Resolved complaints" value={count(mine, (c) => c.status === 'RESOLVED')} icon={<CheckCircle2 size={20} />} tone="bg-emerald-50 text-emerald-700" onClick={() => go('complaints', 'RESOLVED')} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card><h2 className="mb-4 font-bold">By status</h2><BarList items={statusItems(mine).filter((i) => i.value > 0)} />{mine.length === 0 && <p className="text-sm text-slate-500">No complaints yet.</p>}</Card>
        <Card className="!p-0">
          <div className="flex items-center justify-between p-5 pb-2"><h2 className="font-bold">Recent complaints</h2><button className={btn.small} onClick={() => go('complaints')}>View all</button></div>
          {recent.length ? <ComplaintTable rows={recent} /> : <Empty title="No complaints yet" text="Report a pothole, garbage, leak or broken light near you." action={<button className={btn.primary} onClick={() => go('submit')}>Submit a complaint</button>} />}
        </Card>
      </div>
    </>
  );
}

function Admin({ all, go }: { all: Complaint[]; go: Go }) {
  const cat = CATEGORIES.map((c, i) => ({ label: c, value: count(all, (x) => x.category === c), color: CHART_COLORS[i % CHART_COLORS.length] }));
  const districts = Object.entries(all.reduce<Record<string, number>>((m, c) => ({ ...m, [c.district]: (m[c.district] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const rated = all.filter((c) => c.feedback);
  const avg = rated.length ? (rated.reduce((s, c) => s + c.feedback!.rating, 0) / rated.length).toFixed(1) : '–';
  const queue = all.filter((c) => PENDING.includes(c.status) || c.status === 'RESOLUTION_SUBMITTED').slice(0, 6);
  return (
    <>
      <Title t="Administrator dashboard" s={`All complaints across districts. Average citizen rating: ${avg} / 5 (${rated.length} reviews).`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total" value={all.length} icon={<ClipboardList size={20} />} onClick={() => go('complaints')} />
        <StatCard label="Pending review" value={count(all, (c) => PENDING.includes(c.status))} icon={<Clock size={20} />} tone="bg-amber-50 text-amber-700" onClick={() => go('complaints', 'GROUP_PENDING')} />
        <StatCard label="Assigned" value={count(all, (c) => c.status === 'ASSIGNED')} icon={<UserCheck size={20} />} tone="bg-sky-50 text-sky-700" onClick={() => go('complaints', 'ASSIGNED')} />
        <StatCard label="In progress" value={count(all, (c) => c.status === 'IN_PROGRESS')} icon={<Wrench size={20} />} tone="bg-orange-50 text-orange-700" onClick={() => go('complaints', 'IN_PROGRESS')} />
        <StatCard label="To verify" value={count(all, (c) => c.status === 'RESOLUTION_SUBMITTED')} icon={<ShieldCheck size={20} />} tone="bg-violet-50 text-violet-700" onClick={() => go('complaints', 'RESOLUTION_SUBMITTED')} />
        <StatCard label="Resolved" value={count(all, (c) => c.status === 'RESOLVED')} icon={<CheckCircle2 size={20} />} tone="bg-emerald-50 text-emerald-700" onClick={() => go('complaints', 'RESOLVED')} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><h2 className="mb-4 font-bold">Complaints by category</h2><Donut items={cat} /></Card>
        <Card><h2 className="mb-4 font-bold">Complaints by status</h2><BarList items={statusItems(all)} /></Card>
        <Card><h2 className="mb-4 font-bold">Complaints by district</h2><BarList items={districts.map(([label, value]) => ({ label, value, color: '#1d4ed8' }))} /></Card>
        <Card className="!p-0">
          <div className="flex items-center justify-between p-5 pb-2"><h2 className="font-bold">Needs your attention</h2><button className={btn.small} onClick={() => go('complaints')}>All complaints</button></div>
          {queue.length ? <ComplaintTable rows={queue} /> : <Empty title="Nothing waiting" text="New and awaiting-verification complaints appear here." />}
        </Card>
      </div>
    </>
  );
}

function Staff({ mine, go }: { mine: Complaint[]; go: Go }) {
  const { user } = useApp();
  const active = mine.filter((c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS');
  return (
    <>
      <Title t={`Hello, ${user!.name.split(' ')[0]}`} s="Complaints assigned to you." action={<button className={btn.secondary} onClick={() => go('completed')}><ListChecks size={16} />Completed work</button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New assignments" value={count(mine, (c) => c.status === 'ASSIGNED')} icon={<UserCheck size={20} />} tone="bg-sky-50 text-sky-700" onClick={() => go('assigned')} />
        <StatCard label="In progress" value={count(mine, (c) => c.status === 'IN_PROGRESS')} icon={<Wrench size={20} />} tone="bg-amber-50 text-amber-700" onClick={() => go('assigned')} />
        <StatCard label="Awaiting verification" value={count(mine, (c) => c.status === 'RESOLUTION_SUBMITTED')} icon={<ShieldCheck size={20} />} tone="bg-violet-50 text-violet-700" onClick={() => go('completed')} />
        <StatCard label="Resolved" value={count(mine, (c) => c.status === 'RESOLVED')} icon={<CheckCircle2 size={20} />} tone="bg-emerald-50 text-emerald-700" onClick={() => go('completed')} />
      </div>
      <Card className="mt-6 !p-0">
        <h2 className="p-5 pb-2 font-bold">Open work</h2>
        {active.length ? <ComplaintTable rows={active} showCitizen /> : <Empty title="No open assignments" text="When the administrator assigns you a complaint, it will appear here." />}
      </Card>
    </>
  );
}
