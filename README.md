# Tracked v2

Personal food and macro tracker. React + Vite PWA, Firestore for data, deployed on Vercel.

- `npm install` then `npm run dev` to run locally. Open `/?demo` to see sample data without touching Firestore.
- `npm run build` creates the production build in `dist/` (Vercel does this automatically).
- Data lives under `tracked/yasser-tracked` in the `ekk-hub` Firebase project: `days/{YYYY-MM-DD}`, `foods/{id}`, `meta/recent`, `meta/settings`.

Built so far: Home, Log (Recent, My foods, Manual with voice fill, AI scan), logo and loading screen. Next: Trends, Settings.

AI scan and voice call `/api/analyze`, which needs the `ANTHROPIC_API_KEY` environment variable in Vercel (enable it for Preview as well as Production). Set `ANTHROPIC_MODEL` to override the default model.
