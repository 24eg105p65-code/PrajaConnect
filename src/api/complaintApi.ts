// ---------------------------------------------------------------------------
// API layer. Today: localStorage. Later: replace each body with fetch('/api/...')
// to the Spring Boot REST controllers. Pages/components do not need to change.
//   getComplaints      -> GET   /api/complaints
//   createComplaint    -> POST  /api/complaints
//   updateStatus       -> PATCH /api/complaints/{id}/status
//   assign             -> PATCH /api/complaints/{id}/assignment
//   addAdminNote       -> POST  /api/complaints/{id}/notes
//   submitProgress     -> POST  /api/complaints/{id}/progress
//   submitFeedback     -> POST  /api/complaints/{id}/feedback
// ---------------------------------------------------------------------------
import { Complaint, ComplaintStatus, NewComplaint, Notification, User } from '../types';
import { buildSeed } from '../data/seed';
import { deptName, userName } from '../data/masterData';

const KEY = 'prajaconnect.db.v1';
interface DB { complaints: Complaint[]; notifications: Notification[] }

function read(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch { /* fall through to seed */ }
  const db = buildSeed();
  write(db);
  return db;
}
const write = (db: DB) => localStorage.setItem(KEY, JSON.stringify(db));
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

function notify(db: DB, userId: string | undefined, text: string, complaintId?: string) {
  if (!userId) return;
  db.notifications.unshift({ id: uid(), userId, text, complaintId, at: now(), read: false });
}
function find(db: DB, id: string): Complaint {
  const c = db.complaints.find((x) => x.id === id);
  if (!c) throw new Error('Complaint not found.');
  return c;
}
function push(c: Complaint, status: ComplaintStatus, note: string, actor: User) {
  c.status = status;
  c.updatedAt = now();
  c.history.push({ status, note, by: actor.name, role: actor.role, at: c.updatedAt });
}
const label = (s: string) => s.replace(/_/g, ' ').toLowerCase();

export const api = {
  async getComplaints(): Promise<Complaint[]> { return read().complaints; },
  async getNotifications(): Promise<Notification[]> { return read().notifications; },

  async createComplaint(input: NewComplaint, user: User): Promise<Complaint> {
    const db = read();
    const next = db.complaints.reduce((m, c) => Math.max(m, parseInt(c.id.split('-')[2], 10)), 0) + 1;
    const id = `PC-${new Date().getFullYear()}-${String(next).padStart(4, '0')}`;
    const t = now();
    const c: Complaint = {
      ...input, id, citizenId: user.id, citizenName: user.name, status: 'SUBMITTED',
      createdAt: t, updatedAt: t, adminNotes: [], evidence: [],
      history: [{ status: 'SUBMITTED', note: 'Complaint submitted by citizen.', by: user.name, role: 'CITIZEN', at: t }],
    };
    db.complaints.unshift(c);
    notify(db, 'a1', `New complaint ${id} submitted in ${c.mandal}, ${c.district}.`, id);
    write(db);
    return c;
  },

  async updateStatus(id: string, status: ComplaintStatus, note: string, actor: User): Promise<void> {
    const db = read(); const c = find(db, id);
    push(c, status, note || `Status changed to ${label(status)}.`, actor);
    notify(db, c.citizenId, `${id} is now ${label(status)}.`, id);
    if (c.staffId && actor.role === 'ADMIN') notify(db, c.staffId, `${id} status changed to ${label(status)}.`, id);
    write(db);
  },

  async assign(id: string, departmentId: string, staffId: string, note: string, actor: User): Promise<void> {
    const db = read(); const c = find(db, id);
    c.departmentId = departmentId; c.staffId = staffId;
    push(c, 'ASSIGNED', `Assigned to ${deptName(departmentId)} (${userName(staffId)}).${note ? ' ' + note : ''}`, actor);
    notify(db, c.citizenId, `${id} was assigned to ${deptName(departmentId)}.`, id);
    notify(db, staffId, `You were assigned ${id}: ${c.title}.`, id);
    write(db);
  },

  async addAdminNote(id: string, text: string, actor: User): Promise<void> {
    const db = read(); const c = find(db, id);
    c.adminNotes.push({ text, by: actor.name, at: now() });
    c.updatedAt = now();
    write(db);
  },

  async submitProgress(id: string, status: ComplaintStatus, note: string, evidence: string[], actor: User): Promise<void> {
    const db = read(); const c = find(db, id);
    c.evidence = [...c.evidence, ...evidence];
    push(c, status, note, actor);
    notify(db, c.citizenId, `${id}: work update. Status is now ${label(status)}.`, id);
    if (status === 'RESOLUTION_SUBMITTED') notify(db, 'a1', `${id}: resolution submitted by ${actor.name}. Verify and close it.`, id);
    write(db);
  },

  async citizenReply(id: string, text: string, actor: User): Promise<void> {
    const db = read(); const c = find(db, id);
    push(c, 'UNDER_REVIEW', `Citizen provided information: ${text}`, actor);
    notify(db, 'a1', `${id}: citizen replied with the requested information.`, id);
    write(db);
  },

  async submitFeedback(id: string, rating: number, comment: string): Promise<void> {
    const db = read(); const c = find(db, id);
    c.feedback = { rating, comment, at: now() };
    notify(db, 'a1', `Feedback received on ${id}: ${rating}/5.`, id);
    write(db);
  },

  async markRead(userId: string, id?: string): Promise<void> {
    const db = read();
    db.notifications.forEach((n) => { if (n.userId === userId && (!id || n.id === id)) n.read = true; });
    write(db);
  },

  async resetDemo(): Promise<void> { write(buildSeed()); },
};
