import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Complaint, Notification, User } from '../types';
import { USERS } from '../data/masterData';
import { api } from '../api/complaintApi';

interface Toast { id: number; msg: string; type: 'success' | 'error' }
interface Ctx {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
  complaints: Complaint[];
  notifications: Notification[];
  unread: number;
  openId: string | null;
  openComplaint: (id: string | null) => void;
  toast: (msg: string, type?: 'success' | 'error') => void;
  toasts: Toast[];
  act: <T>(fn: () => Promise<T>, okMsg?: string) => Promise<T | null>;
  refresh: () => Promise<void>;
}
const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

const SESSION = 'prajaconnect.session';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => USERS.find((u) => u.id === localStorage.getItem(SESSION)) ?? null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [allNotifs, setAllNotifs] = useState<Notification[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const refresh = useCallback(async () => {
    setComplaints(await api.getComplaints());
    setAllNotifs(await api.getNotifications());
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const toast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const act = useCallback(async <T,>(fn: () => Promise<T>, okMsg?: string) => {
    try {
      const r = await fn();
      await refresh();
      if (okMsg) toast(okMsg);
      return r;
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Something went wrong.', 'error');
      return null;
    }
  }, [refresh, toast]);

  const login = (u: User) => { localStorage.setItem(SESSION, u.id); setUser(u); setOpenId(null); };
  const logout = () => { localStorage.removeItem(SESSION); setUser(null); setOpenId(null); };

  const notifications = user ? allNotifs.filter((n) => n.userId === user.id) : [];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AppCtx.Provider value={{ user, login, logout, complaints, notifications, unread, openId, openComplaint: setOpenId, toast, toasts, act, refresh }}>
      {children}
    </AppCtx.Provider>
  );
}
