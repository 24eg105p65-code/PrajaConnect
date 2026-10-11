import { Eye } from 'lucide-react';
import { Complaint } from '../types';
import { useApp } from '../context/AppContext';
import { deptName } from '../data/masterData';
import { StatusBadge, btn, fmtDate } from './ui';

export function ComplaintTable({ rows, showCitizen, showAssignee }: { rows: Complaint[]; showCitizen?: boolean; showAssignee?: boolean }) {
  const { openComplaint } = useApp();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-slate-200 text-xs font-semibold text-slate-500">
          <tr>
            <th className="px-4 py-3">Complaint</th>
            <th className="px-4 py-3">Location</th>
            {showCitizen && <th className="px-4 py-3">Citizen</th>}
            {showAssignee && <th className="px-4 py-3">Assigned to</th>}
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Filed on</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3">
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-slate-500">{c.id} · {c.category}</p>
              </td>
              <td className="px-4 py-3 text-slate-600">{c.village}, {c.mandal}<br /><span className="text-xs text-slate-500">{c.district}</span></td>
              {showCitizen && <td className="px-4 py-3 text-slate-600">{c.citizenName}</td>}
              {showAssignee && <td className="px-4 py-3 text-slate-600">{c.staffId ? <>{deptName(c.departmentId)}</> : <span className="text-slate-400">Not assigned</span>}</td>}
              <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDate(c.createdAt)}</td>
              <td className="px-4 py-3 text-right"><button className={btn.small} onClick={() => openComplaint(c.id)}><Eye size={14} />Open</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
