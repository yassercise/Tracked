# Tracked v2

Personal food and macro tracker. React + Vite PWA, Firestore for data, deployed on Vercel.

- `npm install` then `npm run dev` to run locally. Open `/?demo` to see sample data without touching Firestore.
- `npm run build` creates the production build in `dist/` (Vercel does this automatically).
- Data lives under `tracked/yasser-tracked` in the `ekk-hub` Firebase project: `days/{YYYY-MM-DD}`, `foods/{id}`, `meta/recent`, `meta/settings`.

Built so far: project scaffold, data layer, Home, Log (Recent, My foods, Manual). Next: AI Scan and voice, Trends, Settings.
