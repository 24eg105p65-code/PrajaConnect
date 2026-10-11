import { Complaint, ComplaintStatus, HistoryEntry, Notification } from '../types';
import { USERS, deptName, userName } from './masterData';

const DAY = 86_400_000;
const CHAIN: ComplaintStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLUTION_SUBMITTED', 'RESOLVED'];

const pathTo = (s: ComplaintStatus): ComplaintStatus[] =>
  s === 'REJECTED' ? ['SUBMITTED', 'UNDER_REVIEW', 'REJECTED']
  : s === 'NEEDS_INFORMATION' ? ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION']
  : CHAIN.slice(0, CHAIN.indexOf(s) + 1);

type Row = [string, string, string, string, string, string, string, number, ComplaintStatus, string?];
// title, description, category, village, mandal, district, citizenId, daysAgo, status, staffId
const ROWS: Row[] = [
  ['Deep potholes near the bus stand', 'Three deep potholes on the main road next to the village bus stand are causing two-wheeler accidents, especially after rain.', 'Road Potholes', 'Kothur', 'Shamshabad', 'Rangareddy', 'c1', 21, 'RESOLVED', 's1'],
  ['Garbage piled up near weekly market', 'Waste from the weekly market has not been collected for over a week. Stray animals are spreading it onto the road.', 'Garbage Accumulation', 'Kamalapur', 'Huzurabad', 'Karimnagar', 'c2', 12, 'IN_PROGRESS', 's3'],
  ['Drinking water pipeline leaking', 'The main pipeline near the overhead tank has been leaking for four days and a large amount of drinking water is being wasted.', 'Water Leakage', 'Peddapur', 'Armoor', 'Nizamabad', 'c3', 9, 'ASSIGNED', 's4'],
  ['Open drain overflowing on school lane', 'Drain water overflows onto the lane leading to the primary school. Children have to walk through dirty water.', 'Drainage Problems', 'Rampur', 'Hanamkonda', 'Warangal', 'c1', 7, 'IN_PROGRESS', 's5'],
  ['Streetlights off on highway service road', 'Six streetlights along the service road have not worked for two weeks. The stretch is dark and unsafe at night.', 'Broken Streetlights', 'Gollapally', 'Madhira', 'Khammam', 'c2', 5, 'SUBMITTED'],
  ['Community hall roof leaking', 'The roof of the community hall leaks heavily during rain and the ceiling plaster is falling in the main room.', 'Public Facility Maintenance', 'Bhimaram', 'Toopran', 'Medak', 'c3', 15, 'RESOLUTION_SUBMITTED', 's7'],
  ['Road edge caved in after rain', 'Part of the road edge near the culvert has collapsed. Vehicles are forced to use a narrow strip.', 'Road Potholes', 'Chinnakodur', 'Chevella', 'Rangareddy', 'c1', 3, 'UNDER_REVIEW'],
  ['Waste burning near the high school', 'Garbage is being dumped and burned behind the high school. Smoke reaches the classrooms every morning.', 'Garbage Accumulation', 'Venkatapur', 'Miryalaguda', 'Nalgonda', 'c2', 18, 'RESOLVED', 's3'],
  ['Leaking public water tank tap stand', 'Taps at the public water tank are broken and water runs all day, flooding the area around the stand.', 'Water Leakage', 'Lingapur', 'Bodhan', 'Nizamabad', 'c3', 25, 'RESOLVED', 's4'],
  ['Streetlight pole leaning dangerously', 'A streetlight pole near the temple has tilted after a storm and may fall on the road.', 'Broken Streetlights', 'Rayaparthi', 'Parkal', 'Warangal', 'c1', 11, 'IN_PROGRESS', 's6'],
  ['Drain blocked with plastic waste', 'The drain along the main street is choked with plastic and sewage is backing up near homes.', 'Drainage Problems', 'Sirpur', 'Narsapur', 'Medak', 'c2', 2, 'NEEDS_INFORMATION'],
  ['Public toilet block locked and damaged', 'The public toilet block near the bus shelter is locked, the doors are broken and there is no water supply.', 'Public Facility Maintenance', 'Kusumanchi', 'Kusumanchi', 'Khammam', 'c3', 6, 'ASSIGNED', 's7'],
  ['Duplicate: drain complaint near market', 'Drain issue near the market road. A similar complaint was already filed for the same spot.', 'Drainage Problems', 'Ramannapet', 'Nakrekal', 'Nalgonda', 'c1', 14, 'REJECTED'],
  ['Pothole cluster near railway crossing', 'A cluster of potholes before the railway crossing slows traffic and damages vehicles.', 'Road Potholes', 'Wyra', 'Wyra', 'Khammam', 'c2', 2, 'ASSIGNED', 's2'],
  ['Broken footpath tiles at panchayat office', 'Footpath tiles in front of the panchayat office are broken and have injured elderly visitors.', 'Public Facility Maintenance', 'Choppadandi', 'Choppadandi', 'Karimnagar', 'c3', 1, 'SUBMITTED'],
];

export function buildSeed(): { complaints: Complaint[]; notifications: Notification[] } {
  const now = Date.now();
  const year = new Date().getFullYear();
  const complaints: Complaint[] = ROWS.map((r, i) => {
    const [title, description, category, village, mandal, district, cid, daysAgo, status, staffId] = r;
    const created = now - daysAgo * DAY;
    const path = pathTo(status);
    const step = (daysAgo * DAY) / path.length;
    const staff = USERS.find((u) => u.id === staffId);
    const citizenName = userName(cid);
    const notes: Record<string, [string, string, HistoryEntry['role']]> = {
      SUBMITTED: ['Complaint submitted by citizen.', citizenName, 'CITIZEN'],
      UNDER_REVIEW: ['Complaint is under review by the grievance cell.', userName('a1'), 'ADMIN'],
      ASSIGNED: [`Assigned to ${deptName(staff?.departmentId)} (${staff?.name}).`, userName('a1'), 'ADMIN'],
      IN_PROGRESS: ['Field team has started work at the location.', staff?.name ?? '', 'STAFF'],
      RESOLUTION_SUBMITTED: ['Work completed. Evidence attached for verification.', staff?.name ?? '', 'STAFF'],
      RESOLVED: ['Verified and closed by the grievance officer.', userName('a1'), 'ADMIN'],
      REJECTED: ['Rejected: duplicate of a complaint already being handled.', userName('a1'), 'ADMIN'],
      NEEDS_INFORMATION: ['Please share a nearby landmark so the team can locate the issue.', userName('a1'), 'ADMIN'],
    };
    const history: HistoryEntry[] = path.map((s, k) => ({
      status: s, note: notes[s][0], by: notes[s][1], role: notes[s][2], at: new Date(created + k * step).toISOString(),
    }));
    const done = status === 'RESOLUTION_SUBMITTED' || status === 'RESOLVED';
    return {
      id: `PC-${year}-${String(i + 1).padStart(4, '0')}`,
      title, description, category, village, mandal, district,
      citizenId: cid, citizenName, status,
      departmentId: staff?.departmentId, staffId,
      createdAt: history[0].at, updatedAt: history[history.length - 1].at,
      history, adminNotes: [], evidence: done ? ['after-work-photo.jpg'] : [],
      feedback: i === 0 ? { rating: 4, comment: 'Repaired well, but it took a little long.', at: new Date(now - 18 * DAY).toISOString() } : undefined,
    };
  });
  complaints[1].adminNotes.push({ text: 'Priority: market day is Thursday. Clear before then.', by: userName('a1'), at: new Date(now - 11 * DAY).toISOString() });

  const mk = (userId: string, text: string, complaintId: string, hrs: number): Notification => ({
    id: `n-${userId}-${complaintId}`, userId, text, complaintId, at: new Date(now - hrs * 3_600_000).toISOString(), read: false,
  });
  const id = (n: number) => complaints[n - 1].id;
  const notifications: Notification[] = [
    mk('c2', `Your complaint ${id(8)} was resolved. Please share feedback.`, id(8), 30),
    mk('c3', `Your complaint ${id(9)} was resolved. Please share feedback.`, id(9), 50),
    mk('c2', `${id(11)} needs more information from you.`, id(11), 20),
    mk('c1', `${id(4)} is now in progress.`, id(4), 40),
    mk('a1', `New complaint ${id(15)} submitted in Choppadandi, Karimnagar.`, id(15), 20),
    mk('a1', `${id(6)}: resolution submitted. Verify and close it.`, id(6), 60),
    mk('s2', `You were assigned ${id(14)}: Pothole cluster near railway crossing.`, id(14), 40),
    mk('s7', `You were assigned ${id(12)}: Public toilet block locked and damaged.`, id(12), 140),
  ];
  return { complaints, notifications };
}
