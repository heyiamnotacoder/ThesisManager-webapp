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
│   ├── helpers.js           # Date formatters, color utils (shade/hexA/tinted), ARM_COLORS, daysFromNow
│   └── icons.jsx            # SVG icon component — add new paths here
├── components/
│   ├── Sidebar.jsx          # Left nav: study pill, user footer, dark mode toggle, mobile off-canvas
│   └── Topbar.jsx           # Page title bar with breadcrumb, hamburger (mobile), dark mode toggle (mobile)
└── screens/
    ├── Auth.jsx             # Sign up / sign in split layout (blue banner on mobile)
    ├── StudyDesign.jsx      # Study setup wizard (name, arms, timeline, fields)
    ├── Dashboard.jsx        # Hero ring + arm bars + notifications + activity; delete study action
    ├── StudyDetail.jsx      # Patient table grouped by arm with filter bar; rows navigate to PatientDetail
    ├── PatientDetail.jsx    # Full patient profile: hero, demographics, visit timeline, baseline data; delete patient
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

- `daysFromNow()` in `helpers.js` uses `new Date()` (real system clock) — the old hardcoded `TODAY` constant was removed.
- `ARM_COLORS` array in `helpers.js` maps arm index → hex color. Currently supports 3 arms.
- `StatusPill` exported from `Dashboard.jsx` — reused in `StudyDetail.jsx` and `PatientDetail.jsx`.
- No routing library — screen state is a plain string in `App.jsx` (`setScreen`).
- Dark mode state (`darkMode`) lives in `App.jsx`, initialized from `localStorage` (`theme` key), applied as `document.documentElement.dataset.theme = 'dark' | 'light'`, and persisted on every toggle. Pass `darkMode` + `onToggleDark` to `Sidebar` and `Topbar`.
- Baseline fields have **no `type`** — they are informational only (shown as chips in AddPatient). Only follow-up fields carry a type (`text` | `number` | `date`).
- Adding a baseline field in `StudyDesign` automatically copies it to follow-up fields (one-time copy on add, independent after).
- Follow-up dates are computed as `enrollDate + n × followUpInterval` everywhere (AddPatient display, PatientDetail timeline, DB `next_visit_date`).
- `nextVisitDate` / `overdueDays` are **always recomputed** from live study+patient data via `withComputedNextVisit()` (App.jsx) — never trust the stored DB `next_visit_date` value, which can go stale if the study interval changes.
- PatientDetail baseline section only renders fields that have a recorded value (`p.baseline[f.name] != null`); fields with no data are hidden.
- Sidebar has no collapse toggle — always expanded on desktop. On mobile it slides in off-canvas via `mobileOpen` prop; `onToggle` closes it. A backdrop overlay is rendered inside `Sidebar.jsx` and dismisses the drawer on tap.

## Responsive layout

Two CSS breakpoints in `styles.css`:
- `≤1100px` — some grids collapse (stat-grid goes 3-col, split-2 goes 1-col).
- `≤768px` (mobile) — full off-canvas mode:
  - Sidebar hides behind hamburger; `.hamburger-btn` appears in Topbar.
  - Sidebar slides in with `transform: translateX(0)` when `data-mobile-open="true"`.
  - Dark mode toggle (`.topbar-theme-toggle`) appears in Topbar; hidden on desktop via `display: none`.
  - Hero ring scales to 160 px; metrics grid goes 2-col; all splits collapse to 1-col.
  - Auth screen: blue banner top, centered form, tagline footer strip.

## Delete actions

Three independent delete flows, all with confirmation:

| Action | Where | Confirmation | Handler in App.jsx |
|---|---|---|---|
| Delete patient | PatientDetail danger zone | 2-step inline button | `handleDeletePatient(uuid)` |
| Delete study | Dashboard StudyMetaCard | Confirm button (FK cascade wipes all patients) | `handleDeleteStudy()` |
| Delete account | Sidebar footer modal | Must type `DELETE` in input | `handleDeleteAccount()` |

`handleDeleteAccount` calls the `delete_user()` Supabase RPC (server-side), then signs out.

## Supabase schema

- `profiles` — links `auth.users`, stores `full_name`
- `studies` — `arms`, `baseline_fields`, `followup_fields` as JSONB arrays; `user_id` FK
- `patients` — `display_id`, `arm` as integer index, `baseline` as JSONB; `study_id` FK; FK cascade from studies (deleting a study removes all its patients)
- RPC: `delete_user()` — server-side function that deletes the calling user's auth record and cascades all their data

`studyToRow` / `rowToStudy` / `rowToPatient` in `App.jsx` handle all mapping.

## Adding features

**New screen**: add a JSX file in `screens/`, import it in `App.jsx`, add a condition in the render block and a nav item in `Sidebar.jsx`.

**New icon**: add an entry to the `paths` object in `lib/icons.jsx`. Current icons: `home`, `users`, `bell`, `plus`, `settings`, `search`, `chevronRight`, `chevronLeft`, `check`, `x`, `mail`, `lock`, `user`, `phone`, `calendar`, `clock`, `flask`, `chart`, `target`, `alert`, `file`, `arrowRight`, `arrowLeft`, `moreHoriz`, `download`, `upload`, `filter`, `book`, `activity`, `edit`, `logOut`, `menu`, `trash`, `sun`, `moon`.

**New follow-up field type**: add a `<option>` to the type `<select>` in `FieldBuilderCard` (`StudyDesign.jsx`) and a render case in the follow-up form if one is built.

**New mobile layout**: default to a 1-col stack at `≤768px`. Use `.topbar-theme-toggle` as a pattern for elements that should only appear in the topbar on mobile (set `display: none` globally, then `display: grid/flex` inside the `@media (max-width: 768px)` block).
