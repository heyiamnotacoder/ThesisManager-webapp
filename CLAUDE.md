# ThesisManager — webapp

Clinical thesis workspace for medical students running trials. Prototype built with Vite + React (JavaScript, no TypeScript). Backed by Supabase (auth, studies, patients).

## Commands

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Project layout

```
src/
├── App.jsx                  # Root shell: auth gate, routing, global state, Supabase handlers
├── main.jsx                 # ReactDOM.createRoot entry
├── styles.css               # Full design system (tokens, components, layouts)
├── lib/
│   ├── supabase.js          # Supabase client singleton (reads from .env)
│   ├── helpers.js           # Date formatters, color utils (shade/hexA/tinted), ARM_COLORS
│   └── icons.jsx            # SVG icon component — add new paths here
├── components/
│   ├── Sidebar.jsx          # Left nav with study pill + user footer (no collapse)
│   └── Topbar.jsx           # Page title bar with breadcrumb
└── screens/
    ├── Auth.jsx             # Sign up / sign in split layout
    ├── StudyDesign.jsx      # Study setup wizard (name, arms, timeline, fields)
    ├── Dashboard.jsx        # Hero ring + arm bars + notifications + activity
    ├── StudyDetail.jsx      # Patient table grouped by arm with filter bar; rows navigate to PatientDetail
    ├── PatientDetail.jsx    # Full patient profile: hero, demographics, visit timeline, baseline data
    └── AddPatient.jsx       # Enrollment form with arm allocation + computed follow-up dates
```

## Screen flow

```
Auth → StudyDesign → Dashboard ←→ StudyDetail ←→ PatientDetail
                              ←→ AddPatient
                              ←→ StudyDesign (edit mode)
```

`App.jsx` holds `selectedPatient` state; clicking a row in `StudyDetail` sets it and navigates to `patient-detail`.

## Data model

All state lives in `App.jsx`; persisted to Supabase. The active study object shape:

```js
{
  id, name, shortName, type,           // 'RCT' | 'Observational'
  arms: [{ name, target }],
  sampleSize, startDate, endDate, followUp, screened,
  followUpCount, followUpInterval: { value, unit },  // unit: 'days' | 'months'
  baselineFields: [{ name, unit? }],           // no `type` — shown as reference only
  followUpFields:  [{ name, type, unit?, visits: boolean[] }],
  patients: [{
    id,              // display_id e.g. "AMC-1001"
    _uuid,           // Supabase row id
    crNo, name, age, sex, phone, relativePhone,
    arm,             // index into study.arms
    enrollDate,      // Date object
    status,          // 'active' | 'completed' | 'lost'
    completedVisits, totalVisits,
    nextVisitDate,   // Date | null — computed dynamically via withComputedNextVisit() in App.jsx
                     //   = enrollDate + (completedVisits+1) × followUpInterval (NOT the DB value)
    overdueDays,     // 0 if not overdue — also recomputed dynamically, not from DB
    baseline,        // { [fieldName]: value }
  }]
}
```

## Key conventions

- `TODAY` constant in `helpers.js` drives all date math (`daysFromNow`) — update it for demos.
- `ARM_COLORS` array in `helpers.js` maps arm index → hex color. Currently supports 3 arms.
- `StatusPill` exported from `Dashboard.jsx` — reused in `StudyDetail.jsx` and `PatientDetail.jsx`.
- No routing library — screen state is a plain string in `App.jsx` (`setScreen`).
- Dark mode toggled via `document.documentElement.dataset.theme = 'dark' | 'light'`.
- Baseline fields have **no `type`** — they are informational only (shown as chips in AddPatient). Only follow-up fields carry a type (`text` | `number` | `date`).
- Adding a baseline field in `StudyDesign` automatically copies it to follow-up fields (one-time copy on add, independent after).
- Follow-up dates are computed as `enrollDate + n × followUpInterval` everywhere (AddPatient display, PatientDetail timeline, DB `next_visit_date`).
- `nextVisitDate` / `overdueDays` are **always recomputed** from live study+patient data via `withComputedNextVisit()` (App.jsx) — never trust the stored DB `next_visit_date` value, which can go stale if the study interval changes.
- PatientDetail baseline section only renders fields that have a recorded value (`p.baseline[f.name] != null`); fields with no data are hidden.
- Sidebar has no collapse toggle — the Account section was removed; sidebar is always expanded.

## Supabase schema

- `profiles` — links `auth.users`, stores `full_name`
- `studies` — `arms`, `baseline_fields`, `followup_fields` as JSONB arrays; `user_id` FK
- `patients` — `display_id`, `arm` as integer index, `baseline` as JSONB; `study_id` FK

`studyToRow` / `rowToStudy` / `rowToPatient` in `App.jsx` handle all mapping.

## Adding features

**New screen**: add a JSX file in `screens/`, import it in `App.jsx`, add a condition in the render block and a nav item in `Sidebar.jsx`.

**New icon**: add an entry to the `paths` object in `lib/icons.jsx`.

**New follow-up field type**: add a `<option>` to the type `<select>` in `FieldBuilderCard` (`StudyDesign.jsx`) and a render case in the follow-up form if one is built.
