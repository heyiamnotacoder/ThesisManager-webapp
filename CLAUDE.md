# ThesisManager — webapp

Clinical thesis workspace for medical students running trials. Prototype built with Vite + React (JavaScript, no TypeScript). All data is hardcoded/in-memory — no backend, no database.

## Commands

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Project layout

```
src/
├── App.jsx                  # Root shell: auth gate, routing, global state
├── main.jsx                 # ReactDOM.createRoot entry
├── styles.css               # Full design system (tokens, components, layouts)
├── components/
│   ├── Sidebar.jsx          # Collapsible left nav with study pill + user footer
│   └── Topbar.jsx           # Page title bar with breadcrumb and notification dot
├── lib/
│   ├── helpers.js           # Date formatters, color utils (shade/hexA/tinted), ARM_COLORS
│   └── icons.jsx            # SVG icon component — add new paths here
└── screens/
    ├── Auth.jsx             # Sign up / sign in split layout
    ├── StudyDesign.jsx      # Study setup wizard (name, arms, timeline, fields)
    ├── Dashboard.jsx        # Hero ring + arm bars + notifications + activity
    ├── StudyDetail.jsx      # Patient table grouped by arm with filter bar
    └── AddPatient.jsx       # Enrollment form with arm allocation + baseline fields
```

## Screen flow

```
Auth → StudyDesign → Dashboard ←→ StudyDetail
                              ←→ AddPatient
                              ←→ StudyDesign (edit mode)
```

## Data model

All state lives in `App.jsx`. The active study object shape:

```js
{
  id, name, shortName, type,           // 'RCT' | 'Observational'
  arms: [{ name, target }],
  sampleSize, startDate, endDate, followUp, screened,
  baselineFields: [{ name, type, unit?, options? }],
  followUpFields:  [{ name, type, unit?, options? }],
  patients: [{
    id, crNo, name, age, sex, phone, relativePhone,
    arm,             // index into study.arms
    enrollDate,      // Date object
    status,          // 'active' | 'completed' | 'lost'
    completedVisits, totalVisits,
    nextVisitDate,   // Date | null
    overdueDays,     // 0 if not overdue
    baseline,        // { [fieldName]: value }
  }]
}
```

## Key conventions

- `TODAY` constant in `helpers.js` drives all date math (`daysFromNow`) — update it for demos.
- `ARM_COLORS` array in `helpers.js` maps arm index → hex color. Currently supports 3 arms.
- The `StatusPill` component is exported from `Dashboard.jsx` and reused in `StudyDetail.jsx`.
- No routing library — screen state is a plain string in `App.jsx` (`setScreen`).
- Dark mode toggled via `document.documentElement.dataset.theme = 'dark' | 'light'`.

## Adding features

**New screen**: add a JSX file in `screens/`, import it in `App.jsx`, add a condition in the render block and a nav item in `Sidebar.jsx`.

**New icon**: add an entry to the `paths` object in `lib/icons.jsx`.

**New field type in baseline/follow-up**: add a case to `BaselineField` in `AddPatient.jsx`.
