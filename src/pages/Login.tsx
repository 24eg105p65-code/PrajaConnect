import { useState } from 'react';
import { Landmark, ShieldAlert, UserRound, ClipboardCheck, HardHat } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { USERS, deptName } from '../data/masterData';
import { btn, cx, inputCls } from '../components/ui';

const ROLES: { role: Role; title: string; text: string; icon: React.ReactNode }[] = [
  { role: 'CITIZEN', title: 'Citizen', text: 'Report a problem, track its progress and give feedback.', icon: <UserRound size={22} /> },
  { role: 'ADMIN', title: 'Administrator', text: 'Review complaints, assign departments and close cases.', icon: <ClipboardCheck size={22} /> },
  { role: 'STAFF', title: 'Department staff', text: 'Work on assigned complaints and submit evidence.', icon: <HardHat size={22} /> },
];

export default function Login() {
  const { login } = useApp();
  const [role, setRole] = useState<Role>('CITIZEN');
  const options = USERS.filter((u) => u.role === role);
  const [userId, setUserId] = useState(options[0].id);
  const pick = (r: Role) => { setRole(r); setUserId(USERS.find((u) => u.role === r)!.id); };

  return (
    <div className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
      <div className="flex flex-col justify-between bg-ink p-8 text-white lg:p-12">
        <div className="flex items-center gap-2 font-extrabold"><Landmark size={22} />PrajaConnect AI</div>
        <div className="py-12">
          <h1 className="max-w-md text-4xl font-extrabold leading-tight">Report a local problem. Follow it until it is fixed.</h1>
          <p className="mt-4 max-w-md text-blue-100">A location-based grievance platform for villages, mandals and districts in Telangana. Every complaint has an ID, an owner and a visible history.</p>
        </div>
        <p className="text-sm text-blue-200">College project prototype. All names, places and complaints are fictional sample data.</p>
      </div>
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          <h2 className="text-2xl font-extrabold">Choose a demo role</h2>
          <div className="mt-4 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <ShieldAlert size={18} className="mt-0.5 shrink-0" />
            <p><b>Demo authentication only.</b> There is no password and no real security. This is not suitable for production use.</p>
          </div>
          <div className="mt-5 space-y-3">
            {ROLES.map((r) => (
              <button key={r.role} onClick={() => pick(r.role)} aria-pressed={role === r.role} className={cx('flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700', role === r.role ? 'border-blue-700 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-400')}>
                <span className={cx('rounded-lg p-2', role === r.role ? 'bg-blue-700 text-white' : 'bg-slate-100')}>{r.icon}</span>
                <span><span className="block font-bold">{r.title}</span><span className="text-sm text-slate-600">{r.text}</span></span>
              </button>
            ))}
          </div>
          {options.length > 1 && (
            <label className="mt-5 block">
              <span className="mb-1 block text-sm font-semibold">Sign in as</span>
              <select className={inputCls} value={userId} onChange={(e) => setUserId(e.target.value)}>
                {options.map((u) => <option key={u.id} value={u.id}>{u.name}{u.departmentId ? ` — ${deptName(u.departmentId)}` : ''}</option>)}
              </select>
            </label>
          )}
          <button className={btn.primary + ' mt-5 w-full py-3'} onClick={() => login(USERS.find((u) => u.id === userId)!)}>Enter demo as {USERS.find((u) => u.id === userId)!.name.split(' (')[0]}</button>
        </div>
      </div>
    </div>
  );
}
