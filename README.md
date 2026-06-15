# ThesisManager

A clinical thesis workspace for medical students running trials. ThesisManager helps you design a study, enrol patients into treatment arms, and track follow-up visits — turning the bookkeeping of a clinical trial into a guided, visual workflow.

> Prototype built with Vite + React (JavaScript, no TypeScript), backed by Supabase for auth and data.

## Features

- **Authentication** — email/password sign up and sign in via Supabase Auth.
- **Study design wizard** — name your study, define treatment arms with targets, set the timeline, and configure baseline + follow-up data fields. Supports `RCT` and `Observational` study types.
- **Dashboard** — enrolment progress ring, per-arm bars, overdue-visit notifications, and a recent-activity feed.
- **Patient enrolment** — allocate patients to arms with automatically computed follow-up visit dates.
- **Patient profiles** — demographics, a visit timeline, and recorded baseline data per patient.
- **Dark mode** — toggle persisted to `localStorage`, applied app-wide.
- **Responsive** — full off-canvas mobile layout at ≤768px.
- **Safe deletes** — patient, study, and account deletion flows, each with confirmation (account deletion runs a server-side `delete_user()` RPC that cascades all data).

## Tech stack

| Layer | Choice |
|---|---|
| Build tool | [Vite](https://vitejs.dev) 8 |
| UI | [React](https://react.dev) 19 |
| Backend | [Supabase](https://supabase.com) (Auth + Postgres) |
| Styling | Hand-written design system in `src/styles.css` (no UI framework) |
| Linting | ESLint 10 |
| Hosting | Vercel |

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project (free tier is fine)

### 1. Install

```bash
npm install
```

### 2. Configure environment

The Supabase client (`src/lib/supabase.js`) reads two environment variables. Create a `.env.local` file in the project root — it is gitignored, so each developer supplies their own:

```bash
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-anon-key>
```

> Both must be prefixed with `VITE_` — Vite only exposes variables with that prefix to client-side code. You can find these values in your Supabase project under **Settings → API**.

### 3. Run

```bash
npm run dev      # dev server at http://localhost:5173
```

## Scripts

```bash
npm run dev      # start the dev server with HMR
npm run build    # production build → dist/
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

## Project layout

```
src/
├── App.jsx                  # Root shell: auth gate, routing, global state, Supabase handlers
├── main.jsx                 # ReactDOM.createRoot entry
├── styles.css               # Full design system (tokens, components, layouts)
├── lib/
│   ├── supabase.js          # Supabase client singleton (reads from env)
│   ├── helpers.js           # Date formatters, color utils, ARM_COLORS, daysFromNow
│   └── icons.jsx            # SVG icon component
├── components/
│   ├── Sidebar.jsx          # Left nav: study pill, user footer, dark mode toggle, mobile drawer
│   └── Topbar.jsx           # Page title bar with breadcrumb + hamburger (mobile)
└── screens/
    ├── Auth.jsx             # Sign up / sign in
    ├── StudyDesign.jsx      # Study setup wizard
    ├── Dashboard.jsx        # Hero ring + arm bars + notifications + activity
    ├── StudyDetail.jsx      # Patient table grouped by arm
    ├── PatientDetail.jsx    # Full patient profile
    └── AddPatient.jsx       # Enrolment form
```

### Screen flow

```
Auth → StudyDesign → Dashboard ←→ StudyDetail ←→ PatientDetail
                              ←→ AddPatient
                              ←→ StudyDesign (edit mode)
```

There is no routing library — the current screen is a plain string in `App.jsx` (`setScreen`), and all study/patient state lives in `App.jsx` and is persisted to Supabase.

## Data model

The Supabase schema is three tables plus one RPC:

- **`profiles`** — links `auth.users`, stores `full_name`.
- **`studies`** — `arms`, `baseline_fields`, `followup_fields` as JSONB arrays; `user_id` FK.
- **`patients`** — `display_id`, `arm` (integer index), `baseline` as JSONB; `study_id` FK with cascade delete from `studies`.
- **`delete_user()`** RPC — server-side function that deletes the calling user's auth record and cascades all their data.

Mapping between app objects and database rows is handled by `studyToRow` / `rowToStudy` / `rowToPatient` in `App.jsx`.

> **Note on computed dates:** a patient's `nextVisitDate` and `overdueDays` are always recomputed from live study + patient data (`enrollDate + n × followUpInterval`), never trusted from the stored DB value, which can go stale if the study interval changes.

## Deployment

The project is configured for [Vercel](https://vercel.com). Push to the connected repository, and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables in the Vercel project settings. The build command is `npm run build`; the output directory is `dist/`.

## Contributing

See [`CLAUDE.md`](./CLAUDE.md) for detailed architecture notes, conventions, and step-by-step guides for adding screens, icons, and field types.
