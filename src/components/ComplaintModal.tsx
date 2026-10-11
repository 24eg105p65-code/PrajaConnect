import { useState } from 'react';
import { Paperclip, Plus, X, MapPin, User as UserIcon, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/complaintApi';
import { Complaint, ComplaintStatus, STATUSES } from '../types';
import { CATEGORY_DEPT, DEPARTMENTS, USERS, deptName, userName } from '../data/masterData';
import { Field, Modal, StatusBadge, Stars, btn, fmtDateTime, inputCls, statusLabel } from './ui';

export function ComplaintModal() {
  const { openId, openComplaint, complaints, user } = useApp();
  const c = complaints.find((x) => x.id === openId);
  if (!openId || !c || !user) return null;
  return (
    <Modal title={`Complaint ${c.id}`} wide onClose={() => openComplaint(null)}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2"><StatusBadge status={c.status} /><span className="text-xs text-slate-500">{c.category}</span></div>
            <h3 className="text-xl font-extrabold leading-snug">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.description}</p>
          </div>
          <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
            <Info icon={<MapPin size={15} />} label="Location" value={`${c.village}, ${c.mandal}, ${c.district}`} />
            <Info icon={<UserIcon size={15} />} label="Citizen" value={c.citizenName} />
            <Info icon={<Building2 size={15} />} label="Department" value={deptName(c.departmentId)} />
            <Info icon={<UserIcon size={15} />} label="Staff" value={userName(c.staffId)} />
          </dl>
          {(c.imageName || c.evidence.length > 0) && (
            <div className="space-y-1 text-sm">
              {c.imageName && <p className="flex items-center gap-2 text-slate-600"><Paperclip size={14} />Citizen photo: {c.imageName}</p>}
              {c.evidence.map((e, i) => <p key={i} className="flex items-center gap-2 text-slate-600"><Paperclip size={14} />Resolution evidence: {e}</p>)}
            </div>
          )}
          {c.feedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="mb-1 text-sm font-bold">Citizen feedback</p>
              <Stars value={c.feedback.rating} />
              {c.feedback.comment && <p className="mt-2 text-sm text-slate-700">{c.feedback.comment}</p>}
            </div>
          )}
          {c.adminNotes.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-bold">Administrative notes</p>
              <ul className="space-y-2">{c.adminNotes.map((n, i) => (
                <li key={i} className="rounded-lg border border-slate-200 p-3 text-sm"><p>{n.text}</p><p className="mt-1 text-xs text-slate-500">{n.by} · {fmtDateTime(n.at)}</p></li>
              ))}</ul>
            </div>
          )}
          <div>
            <p className="mb-3 text-sm font-bold">Status history</p>
            <ol className="ml-2 border-l-2 border-slate-200">
              {[...c.history].reverse().map((h, i) => (
                <li key={i} className="relative pb-4 pl-5 last:pb-0">
                  <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-700" />
                  <div className="flex flex-wrap items-center gap-2"><StatusBadge status={h.status} /><span className="text-xs text-slate-500">{fmtDateTime(h.at)}</span></div>
                  <p className="mt-1 text-sm text-slate-700">{h.note}</p>
                  <p className="text-xs text-slate-500">by {h.by}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <aside className="space-y-4">
          {user.role === 'ADMIN' && <AdminPanel key={c.updatedAt + c.adminNotes.length} c={c} />}
          {user.role === 'STAFF' && <StaffPanel key={c.updatedAt} c={c} />}
          {user.role === 'CITIZEN' && <CitizenPanel key={c.updatedAt} c={c} />}
        </aside>
      </div>
    </Modal>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div><dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">{icon}{label}</dt><dd className="mt-0.5 font-medium">{value}</dd></div>;
}
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-200 p-4"><p className="mb-3 text-sm font-bold">{title}</p><div className="space-y-3">{children}</div></div>
);

function AdminPanel({ c }: { c: Complaint }) {
  const { user, act } = useApp();
  const staff = USERS.filter((u) => u.role === 'STAFF');
  const [dept, setDept] = useState(c.departmentId ?? CATEGORY_DEPT[c.category] ?? '');
  const [staffId, setStaffId] = useState(c.staffId ?? '');
  const [aNote, setANote] = useState('');
  const [status, setStatus] = useState<ComplaintStatus>(c.status);
  const [sNote, setSNote] = useState('');
  const [note, setNote] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});
  const fail = (k: string, m: string) => setErrs({ [k]: m });

  const assign = () => {
    if (!dept) return fail('assign', 'Choose a department.');
    if (!staffId) return fail('assign', 'Choose a staff member.');
    setErrs({});
    act(() => api.assign(c.id, dept, staffId, aNote.trim(), user!), 'Complaint assigned.');
  };
  const change = () => {
    if (status === c.status) return fail('status', 'Choose a different status.');
    if (status === 'ASSIGNED' && !c.staffId) return fail('status', 'Use the assignment form to assign this complaint.');
    if ((status === 'REJECTED' || status === 'NEEDS_INFORMATION') && !sNote.trim()) return fail('status', 'Add a note explaining this decision to the citizen.');
    setErrs({});
    act(() => api.updateStatus(c.id, status, sNote.trim(), user!), 'Status updated.');
  };
  const addNote = () => {
    if (!note.trim()) return fail('note', 'Write a note first.');
    setErrs({});
    act(() => api.addAdminNote(c.id, note.trim(), user!), 'Note added.');
  };
  const E = ({ k }: { k: string }) => errs[k] ? <p role="alert" className="text-xs font-medium text-red-600">{errs[k]}</p> : null;

  return (
    <>
      <Panel title="Assign to department">
        <Field label="Department" hint="Pre-selected from the complaint category."><select className={inputCls} value={dept} onChange={(e) => { setDept(e.target.value); setStaffId(''); }}><option value="">Select department</option>{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
        <Field label="Staff member"><select className={inputCls} value={staffId} onChange={(e) => setStaffId(e.target.value)}><option value="">Select staff</option>{staff.filter((s) => s.departmentId === dept).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label="Instruction (optional)"><input className={inputCls} value={aNote} onChange={(e) => setANote(e.target.value)} placeholder="e.g. Complete within 3 days" /></Field>
        <E k="assign" />
        <button className={btn.primary + ' w-full'} onClick={assign}>{c.staffId ? 'Reassign complaint' : 'Assign complaint'}</button>
      </Panel>
      <Panel title="Change status">
        <Field label="New status"><select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as ComplaintStatus)}>{STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}</select></Field>
        <Field label="Note to citizen"><textarea rows={2} className={inputCls} value={sNote} onChange={(e) => setSNote(e.target.value)} placeholder="Required for Rejected and Needs information" /></Field>
        <E k="status" />
        <button className={btn.primary + ' w-full'} onClick={change}>Update status</button>
      </Panel>
      <Panel title="Administrative note">
        <textarea rows={2} aria-label="Administrative note" className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note, visible to admin and staff" />
        <E k="note" />
        <button className={btn.secondary + ' w-full'} onClick={addNote}>Add note</button>
      </Panel>
    </>
  );
}

function StaffPanel({ c }: { c: Complaint }) {
  const { user, act } = useApp();
  const mine = c.staffId === user!.id;
  const [status, setStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [err, setErr] = useState('');
  if (!mine) return <Panel title="Work updates"><p className="text-sm text-slate-500">This complaint is not assigned to you, so you can view it but not update it.</p></Panel>;
  if (c.status !== 'ASSIGNED' && c.status !== 'IN_PROGRESS') return <Panel title="Work updates"><p className="text-sm text-slate-500">{c.status === 'RESOLUTION_SUBMITTED' ? 'Your resolution is waiting for admin verification.' : 'No further updates are needed for this complaint.'}</p></Panel>;

  const submit = () => {
    if (!note.trim()) return setErr('Add a progress note.');
    if (status === 'RESOLUTION_SUBMITTED' && files.length === 0 && c.evidence.length === 0) return setErr('Attach at least one piece of evidence to submit a resolution.');
    setErr('');
    act(() => api.submitProgress(c.id, status, note.trim(), files, user!), status === 'RESOLUTION_SUBMITTED' ? 'Resolution submitted for verification.' : 'Progress update saved.');
  };
  return (
    <Panel title="Update work progress">
      <Field label="Status"><select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as ComplaintStatus)}><option value="IN_PROGRESS">In progress</option><option value="RESOLUTION_SUBMITTED">Resolution submitted</option></select></Field>
      <Field label="Progress note"><textarea rows={3} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was done, what is pending" /></Field>
      <div>
        <p className="mb-1 text-sm font-semibold">Resolution evidence (simulated)</p>
        {files.length > 0 && <ul className="mb-2 space-y-1">{files.map((f, i) => <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm"><span className="flex items-center gap-2"><Paperclip size={13} />{f}</span><button aria-label={`Remove ${f}`} onClick={() => setFiles(files.filter((_, k) => k !== i))}><X size={14} /></button></li>)}</ul>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn.secondary} onClick={() => setFiles([...files, `after-work-photo-${files.length + 1}.jpg`])}><Plus size={14} />Add sample photo</button>
          <label className={btn.secondary + ' cursor-pointer'}>Choose files<input type="file" multiple accept="image/*" className="sr-only" onChange={(e) => { setFiles([...files, ...Array.from(e.target.files ?? []).map((f) => f.name)]); e.target.value = ''; }} /></label>
        </div>
        <p className="mt-1 text-xs text-slate-500">Only the file name is saved in this demo.</p>
      </div>
      {err && <p role="alert" className="text-xs font-medium text-red-600">{err}</p>}
      <button className={btn.primary + ' w-full'} onClick={submit}>Save update</button>
    </Panel>
  );
}

function CitizenPanel({ c }: { c: Complaint }) {
  const { user, act } = useApp();
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [err, setErr] = useState('');
  if (c.citizenId !== user!.id) return <Panel title="Complaint"><p className="text-sm text-slate-500">You are viewing a complaint filed by another citizen.</p></Panel>;

  if (c.status === 'NEEDS_INFORMATION') return (
    <Panel title="Officer needs more information">
      <textarea rows={3} aria-label="Your reply" className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add the landmark, photo details or other information requested" />
      {err && <p role="alert" className="text-xs font-medium text-red-600">{err}</p>}
      <button className={btn.primary + ' w-full'} onClick={() => text.trim().length < 5 ? setErr('Write at least a few words.') : act(() => api.citizenReply(c.id, text.trim(), user!), 'Information sent to the officer.')}>Send information</button>
    </Panel>
  );
  if (c.status === 'RESOLVED' && !c.feedback) return (
    <Panel title="How did we do?">
      <Stars value={rating} onChange={setRating} />
      <textarea rows={3} aria-label="Feedback comment" className={inputCls} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us about the work (optional)" />
      {err && <p role="alert" className="text-xs font-medium text-red-600">{err}</p>}
      <button className={btn.primary + ' w-full'} onClick={() => rating === 0 ? setErr('Select a star rating.') : act(() => api.submitFeedback(c.id, rating, comment.trim()), 'Thank you. Feedback saved.')}>Submit feedback</button>
    </Panel>
  );
  return <Panel title="Your complaint"><p className="text-sm text-slate-500">{c.status === 'RESOLVED' ? 'This complaint is closed. Thank you for your feedback.' : 'You will get a notification when the status changes.'}</p></Panel>;
}
