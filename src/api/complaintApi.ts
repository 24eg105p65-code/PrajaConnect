// ---------------------------------------------------------------------------
// API layer. Now talks to the Spring Boot backend instead of localStorage.
// Same function names and signatures as before, so pages/components don't change.
// Backend URL comes from VITE_API_URL (falls back to localhost for development).
// ---------------------------------------------------------------------------
import { Complaint, ComplaintStatus, NewComplaint, Notification, User } from '../types';

const ROOT = (
  (import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_API_URL ??
  'http://localhost:8080'
).replace(/\/$/, '');
const BASE = `${ROOT}/api`;

async function http<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      if (err && err.message) msg = err.message;
    } catch { /* keep default message */ }
    throw new Error(msg);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

const actorOf = (u: User) => ({ id: u.id, name: u.name, role: u.role });

export const api = {
  getComplaints: () => http<Complaint[]>('GET', '/complaints'),
  getNotifications: () => http<Notification[]>('GET', '/notifications'),

  createComplaint: (input: NewComplaint, user: User) =>
    http<Complaint>('POST', '/complaints', { ...input, citizenId: user.id, citizenName: user.name }),

  async updateStatus(id: string, status: ComplaintStatus, note: string, actor: User): Promise<void> {
    await http('PATCH', `/complaints/${id}/status`, { status, note, actor: actorOf(actor) });
  },

  async assign(id: string, departmentId: string, staffId: string, note: string, actor: User): Promise<void> {
    await http('PATCH', `/complaints/${id}/assignment`, { departmentId, staffId, note, actor: actorOf(actor) });
  },

  async addAdminNote(id: string, text: string, actor: User): Promise<void> {
    await http('POST', `/complaints/${id}/notes`, { text, actor: actorOf(actor) });
  },

  async submitProgress(id: string, status: ComplaintStatus, note: string, evidence: string[], actor: User): Promise<void> {
    await http('POST', `/complaints/${id}/progress`, { status, note, evidence, actor: actorOf(actor) });
  },

  async citizenReply(id: string, text: string, actor: User): Promise<void> {
    await http('POST', `/complaints/${id}/reply`, { text, actor: actorOf(actor) });
  },

  async submitFeedback(id: string, rating: number, comment: string): Promise<void> {
    await http('POST', `/complaints/${id}/feedback`, { rating, comment });
  },

  async markRead(userId: string, id?: string): Promise<void> {
    await http('POST', '/notifications/read', { userId, id });
  },

  async resetDemo(): Promise<void> {
    await http('POST', '/demo/reset');
  },
};