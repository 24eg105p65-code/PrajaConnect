import { useState } from 'react';
import { Bell, LayoutDashboard, PlusCircle, ClipboardList, Landmark, LogOut, RotateCcw, ListChecks, Inbox, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from './context/AppContext';
import { api } from './api/complaintApi';
import { Page, Role } from './types';
import { USERS } from './data/masterData';
import { Modal, btn, cx, inputCls } from './components/ui';
import { ComplaintModal } from './components/ComplaintModal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComplaintsPage from './pages/Complaints';
import Submit from './pages/Submit';
import Notifications from './pages/Notifications';

const NAV: Record<Role, { page: Page; label: string; icon: React.ReactNode }[]> = {
  CITIZEN: [
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { page: 'submit', label: 'Submit complaint', icon: <PlusCircle size={17} /> },
    { page: 'complaints', label: 'My complaints', icon: <ClipboardList size={17} /> },
    { page: 'notifications', label: 'Notifications', icon: <Bell size={17} /> },
  ],
  ADMIN: [
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { page: 'complaints', label: 'All complaints', icon: <ClipboardList size={17} /> },
    { page: 'notifications', label: 'Notifications', icon: <Bell size={17} /> },
  ],
  STAFF: [
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { page: 'assigned', label: 'My assignments', icon: <Inbox size={17} /> },
    { page: 'completed', label: 'Completed work', icon: <ListChecks size={17} /> },
    { page: 'notifications', label: 'Notifications', icon: <Bell size={17} /> },
  ],
};
const ROLE_LABEL: Record<Role, string> = { CITIZEN: 'Citizen', ADMIN: 'Administrator', STAFF: 'Department staff' };

export default function App() {
  const { user, login, logout, unread, toasts, act } = useApp();
  const [view, setView] = useState<{ page: Page; preset?: string }>({ page: 'dashboard' });
  const [confirmReset, setConfirmReset] = useState(false);
  if (!user) return <><Login /><Toasts list={toasts} /></>;

  const go = (page: Page, preset?: string) => { setView({ page, preset }); window.scrollTo(0, 0); };
  const nav = NAV[user.role];
  const switchUser = (id: string) => { login(USERS.find((u) => u.id === id)!); setView({ page: 'dashboard' }); };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 px-5 py-4 font-extrabold"><Landmark size={20} className="text-blue-700" />PrajaConnect AI</div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          {nav.map((n) => (
            <button key={n.page} onClick={() => go(n.page)} aria-current={view.page === n.page ? 'page' : undefined} className={cx('flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700', view.page === n.page ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100')}>
              {n.icon}{n.label}
              {n.page === 'notifications' && unread > 0 && <span className="ml-auto rounded-full bg-blue-700 px-2 py-0.5 text-xs text-white">{unread}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-8">
          <div className="mr-auto rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">Demo mode · sample data · no real authentication</div>
          <label className="flex items-center gap-2 text-sm">
            <span className="font-semibold">Switch role</span>
            <select aria-label="Switch demo user" className={inputCls + ' !w-auto'} value={user.id} onChange={(e) => switchUser(e.target.value)}>
              {(['CITIZEN', 'ADMIN', 'STAFF'] as Role[]).map((r) => (
                <optgroup key={r} label={ROLE_LABEL[r]}>{USERS.filter((u) => u.role === r).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</optgroup>
              ))}
            </select>
          </label>
          <button className={btn.secondary} onClick={() => go('notifications')} aria-label={`Notifications, ${unread} unread`}><Bell size={16} />{unread > 0 && <span className="rounded-full bg-blue-700 px-1.5 text-xs text-white">{unread}</span>}</button>
          <button className={btn.secondary} onClick={() => setConfirmReset(true)}><RotateCcw size={15} />Reset demo data</button>
          <button className={btn.secondary} onClick={logout}><LogOut size={15} />Sign out</button>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-8">
          {view.page === 'dashboard' && <Dashboard go={go} />}
          {view.page === 'submit' && <Submit go={go} />}
          {view.page === 'complaints' && <ComplaintsPage key={'c' + view.preset} scope={user.role === 'ADMIN' ? 'all' : 'mine'} preset={view.preset} />}
          {view.page === 'assigned' && <ComplaintsPage key="a" scope="assigned" />}
          {view.page === 'completed' && <ComplaintsPage key="d" scope="completed" />}
          {view.page === 'notifications' && <Notifications />}
        </main>
      </div>

      <ComplaintModal />
      {confirmReset && (
        <Modal title="Reset demo data?" onClose={() => setConfirmReset(false)}>
          <p className="text-sm text-slate-600">This deletes every complaint you created and restores the original 15 sample complaints.</p>
          <div className="mt-5 flex justify-end gap-3">
            <button className={btn.secondary} onClick={() => setConfirmReset(false)}>Cancel</button>
            <button className={btn.danger} onClick={async () => { await act(() => api.resetDemo(), 'Demo data restored.'); setConfirmReset(false); go('dashboard'); }}>Reset data</button>
          </div>
        </Modal>
      )}
      <Toasts list={toasts} />
    </div>
  );
}

function Toasts({ list }: { list: { id: number; msg: string; type: 'success' | 'error' }[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className={cx('flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg', t.type === 'success' ? 'bg-emerald-700' : 'bg-red-700')}>
          {t.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}{t.msg}
        </div>
      ))}
    </div>
  );
}
