# PrajaConnect AI — Location-Based Public Grievance Platform (Frontend Demo)

React + TypeScript + Tailwind prototype with local sample data (browser localStorage).
No backend, database or real authentication. Roles are demo-only.

## Run on your laptop
1. Install Node.js 18+ from https://nodejs.org
2. In this folder:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

Other commands: `npm run build` (production build), `npm run typecheck`.

## Demo flow (about 5 minutes)
1. **Citizen** (Lakshmi Reddy): dashboard counts, Submit complaint (try an empty form to show validation), copy the new ID, see it under My complaints.
2. Switch role (top bar) to **Administrator**: new complaint appears in the stats and the "Needs your attention" list. Open it, assign to a department and staff, change status, add a note. Show the charts and filters.
3. Switch to **Department staff** (the person you assigned): open the complaint, post "In progress", then "Resolution submitted" with sample evidence.
4. Back to **Administrator**: mark it Resolved.
5. Back to **Citizen**: notifications show every step, history timeline is updated, submit feedback.
6. "Reset demo data" restores the 15 sample complaints. Refresh the page to show persistence.

## Structure (ready for Spring Boot)
```
src/api/complaintApi.ts   all data access; each function maps to a future REST endpoint
src/types/index.ts        Complaint, User, ComplaintStatus (match future Java entities/enums)
src/data/                 sample data and master data (departments, districts, users)
src/context/              app state, session, toasts
src/components/ pages/    UI
```
To connect Java later: replace the function bodies in `src/api/complaintApi.ts` with `fetch('/api/...')`
calls (Vite already proxies `/api` to http://localhost:8080). The endpoint list is in the file header.

## Deployment
The demo needs no server: `npm run build` and upload `dist/` to Vercel or Netlify.
The Spring Boot backend cannot run on Vercel; use Render, Railway, AWS or Azure with a managed MySQL,
or serve the built React files from inside the Spring Boot JAR.

## Honest limits
Sample data is fictional. No live GPS, no government connection, no real security, no Java backend yet.
Photos and evidence store file names only. The department pre-selection is a simple category rule, not AI.
