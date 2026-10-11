import { useState } from 'react';
import { CheckCircle2, ImagePlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/complaintApi';
import { Card, Field, btn, inputCls } from '../components/ui';
import { CATEGORIES, LOCATIONS } from '../data/masterData';
import { Page } from '../types';

const empty = { title: '', description: '', category: '', district: '', mandal: '', village: '', imageName: '' };

export default function Submit({ go }: { go: (p: Page) => void }) {
  const { user, act, openComplaint } = useApp();
  const [f, setF] = useState(empty);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [doneId, setDoneId] = useState<string | null>(null);
  const set = (k: keyof typeof empty, v: string) => setF((p) => ({ ...p, [k]: v, ...(k === 'district' ? { mandal: '' } : {}) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (f.title.trim().length < 5) x.title = 'Enter a title of at least 5 characters.';
    if (f.description.trim().length < 20) x.description = 'Describe the problem in at least 20 characters.';
    if (!f.category) x.category = 'Select a category.';
    if (!f.district) x.district = 'Select a district.';
    if (!f.mandal) x.mandal = 'Select a mandal.';
    if (!f.village.trim()) x.village = 'Enter the village or locality.';
    setErrs(x);
    if (Object.keys(x).length) return;
    const c = await act(() => api.createComplaint({ ...f, title: f.title.trim(), description: f.description.trim(), village: f.village.trim(), imageName: f.imageName || undefined }, user!));
    if (c) { setDoneId(c.id); setF(empty); }
  };

  if (doneId) return (
    <Card className="mx-auto max-w-xl text-center">
      <CheckCircle2 className="mx-auto text-emerald-600" size={44} />
      <h1 className="mt-3 text-2xl font-extrabold">Complaint submitted</h1>
      <p className="mt-1 text-slate-600">Your complaint ID is</p>
      <p className="my-3 inline-block rounded-lg bg-blue-50 px-4 py-2 text-xl font-extrabold text-blue-800">{doneId}</p>
      <p className="text-sm text-slate-500">Save this ID. You will be notified as the status changes.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button className={btn.primary} onClick={() => openComplaint(doneId)}>View complaint</button>
        <button className={btn.secondary} onClick={() => go('complaints')}>Go to my complaints</button>
        <button className={btn.secondary} onClick={() => setDoneId(null)}>Submit another</button>
      </div>
    </Card>
  );

  return (
    <>
      <div className="mb-6"><h1 className="text-2xl font-extrabold">Submit a complaint</h1><p className="text-sm text-slate-500">Describe the problem and where it is. Fields marked * are required.</p></div>
      <form onSubmit={submit} noValidate>
        <Card className="mx-auto max-w-3xl space-y-4">
          <Field label="Title *" error={errs.title}><input className={inputCls} value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Deep pothole near the bus stand" /></Field>
          <Field label="Description *" error={errs.description}><textarea rows={4} className={inputCls} value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="What is wrong, since when, and who is affected?" /></Field>
          <Field label="Category *" error={errs.category}><select className={inputCls} value={f.category} onChange={(e) => set('category', e.target.value)}><option value="">Select category</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="District *" error={errs.district}><select className={inputCls} value={f.district} onChange={(e) => set('district', e.target.value)}><option value="">Select district</option>{Object.keys(LOCATIONS).map((d) => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Mandal *" error={errs.mandal}><select className={inputCls} value={f.mandal} onChange={(e) => set('mandal', e.target.value)} disabled={!f.district}><option value="">{f.district ? 'Select mandal' : 'Choose district first'}</option>{(LOCATIONS[f.district] ?? []).map((m) => <option key={m}>{m}</option>)}</select></Field>
            <Field label="Village *" error={errs.village}><input className={inputCls} value={f.village} onChange={(e) => set('village', e.target.value)} placeholder="Village or locality" /></Field>
          </div>
          <Field label="Photo (optional)" hint="Demo only: the file name is saved, the image is not uploaded."><div className="flex items-center gap-3"><label className={btn.secondary + ' cursor-pointer'}><ImagePlus size={16} />Choose photo<input type="file" accept="image/*" className="sr-only" onChange={(e) => set('imageName', e.target.files?.[0]?.name ?? '')} /></label><span className="text-sm text-slate-600">{f.imageName || 'No file chosen'}</span></div></Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className={btn.secondary} onClick={() => { setF(empty); setErrs({}); }}>Clear form</button>
            <button type="submit" className={btn.primary}>Submit complaint</button>
          </div>
        </Card>
      </form>
    </>
  );
}
