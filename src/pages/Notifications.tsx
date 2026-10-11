import { Bell, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/complaintApi';
import { Card, Empty, btn, cx, fmtDateTime } from '../components/ui';

export default function Notifications() {
  const { user, notifications, unread, act, openComplaint } = useApp();
  const open = async (id: string, cid?: string) => { await act(() => api.markRead(user!.id, id)); if (cid) openComplaint(cid); };
  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold">Notifications</h1><p className="text-sm text-slate-500">{unread} unread</p></div>
        {unread > 0 && <button className={btn.secondary} onClick={() => act(() => api.markRead(user!.id), 'All notifications marked as read.')}><CheckCheck size={16} />Mark all as read</button>}
      </div>
      <Card className="!p-0">
        {notifications.length === 0 ? <Empty title="No notifications" text="Updates about your complaints will show up here." /> : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <li key={n.id}>
                <button onClick={() => open(n.id, n.complaintId)} className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
                  <span className={cx('mt-0.5 rounded-full p-2', n.read ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700')}><Bell size={15} /></span>
                  <span className="flex-1"><span className={cx('block text-sm', !n.read && 'font-bold')}>{n.text}</span><span className="text-xs text-slate-500">{fmtDateTime(n.at)}{n.complaintId ? ' · Tap to open complaint' : ''}</span></span>
                  {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-blue-700" aria-label="Unread" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
