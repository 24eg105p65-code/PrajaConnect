import { Department, User } from '../types';

export const CATEGORIES = [
  'Road Potholes', 'Garbage Accumulation', 'Water Leakage',
  'Drainage Problems', 'Broken Streetlights', 'Public Facility Maintenance',
];

export const DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Roads & Buildings' },
  { id: 'd2', name: 'Sanitation & Solid Waste' },
  { id: 'd3', name: 'Rural Water Supply' },
  { id: 'd4', name: 'Drainage & Sewerage' },
  { id: 'd5', name: 'Street Lighting (Electrical)' },
  { id: 'd6', name: 'Public Works & Maintenance' },
];

// Simple rule used to pre-select a department in the assign form (not real AI).
export const CATEGORY_DEPT: Record<string, string> = {
  'Road Potholes': 'd1', 'Garbage Accumulation': 'd2', 'Water Leakage': 'd3',
  'Drainage Problems': 'd4', 'Broken Streetlights': 'd5', 'Public Facility Maintenance': 'd6',
};

export const USERS: User[] = [
  { id: 'c1', name: 'Lakshmi Reddy', role: 'CITIZEN' },
  { id: 'c2', name: 'Venkat Rao', role: 'CITIZEN' },
  { id: 'c3', name: 'Ayesha Begum', role: 'CITIZEN' },
  { id: 'a1', name: 'K. Srinivas (Grievance Officer)', role: 'ADMIN' },
  { id: 's1', name: 'Ramesh Goud', role: 'STAFF', departmentId: 'd1' },
  { id: 's2', name: 'Naveen Kumar', role: 'STAFF', departmentId: 'd1' },
  { id: 's3', name: 'Sunitha Yadav', role: 'STAFF', departmentId: 'd2' },
  { id: 's4', name: 'Prakash Naik', role: 'STAFF', departmentId: 'd3' },
  { id: 's5', name: 'Mahesh Chary', role: 'STAFF', departmentId: 'd4' },
  { id: 's6', name: 'Anitha Sharma', role: 'STAFF', departmentId: 'd5' },
  { id: 's7', name: 'Rajesh Varma', role: 'STAFF', departmentId: 'd6' },
];

export const LOCATIONS: Record<string, string[]> = {
  Rangareddy: ['Shamshabad', 'Chevella', 'Ibrahimpatnam'],
  Warangal: ['Hanamkonda', 'Parkal', 'Narsampet'],
  Karimnagar: ['Huzurabad', 'Choppadandi', 'Manakondur'],
  Nizamabad: ['Armoor', 'Bodhan', 'Dichpally'],
  Khammam: ['Wyra', 'Madhira', 'Kusumanchi'],
  Medak: ['Narsapur', 'Toopran', 'Ramayampet'],
  Nalgonda: ['Miryalaguda', 'Devarakonda', 'Nakrekal'],
};

export const deptName = (id?: string) => DEPARTMENTS.find((d) => d.id === id)?.name ?? '—';
export const userName = (id?: string) => USERS.find((u) => u.id === id)?.name ?? '—';
