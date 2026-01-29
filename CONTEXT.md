# Lightning Rounds - Current Context

## Status
**Phase:** Deployed
**Last Updated:** 2026-01-28

## Current Goals
- [x] Initialize Next.js project
- [x] Create basic structure
- [x] Build API routes
- [x] Build UI components
- [x] Add keyboard shortcuts
- [x] Add local dev mode (no DB required)
- [x] Add sample questions for testing
- [x] Parse real questions from docx
- [x] Set up Supabase
- [x] Seed production database (751 questions)
- [x] Multi-category selection (checkbox grid)
- [x] Tabbed interface (Categories, Play, History)
- [x] History tracking for answered questions
- [x] Deploy to Vercel

## What's Working

**Fully functional with Supabase:**
- 751 questions across 12 medical categories
- Multi-category selection via checkbox grid
- Random question selection from selected categories
- Progress tracking (remaining/total)
- Reveal answer flow with keyboard shortcuts
- Mark questions as asked (persists in database)
- History page showing all answered questions
- Reset all questions with confirmation
- Tabbed navigation between pages

**Categories (12):**
Cardiology, Dermatology, Endocrinology, Gastroenterology, Geriatrics and Palliative Care, Hematology, Infectious Diseases, Neurology, Oncology, Pulmonology, Renal, Rheumatology

## Architecture Decisions

### Single Table Design
Using one `questions` table with an `asked` boolean flag. Simple and sufficient for the use case.

### Supabase with Local Fallback
- Production: Supabase Postgres
- Development: In-memory store reading from `data/questions.json`
- Automatic detection via env var presence

### Server-side API Routes
All database operations go through Next.js API routes. Client never talks directly to Supabase or local store.

### Multi-Category Selection
- Empty selection array = all categories
- Checkbox grid with "All" and "Clear" buttons
- Categories passed as comma-separated query param

### Tabbed Interface
Three tabs keep the UI clean:
1. **Categories** — Setup/configuration
2. **Play** — Main gameplay
3. **History** — Review answered questions

### Cache Bypass for History
History API uses `force-dynamic` and `cache: 'no-store'` to ensure fresh data on every fetch.

## Known Issues
None.

## Next Steps

None — project is complete and deployed.

## File Structure
```
src/
├── app/
│   ├── page.tsx              # Main app with tabs
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── question/route.ts
│       ├── categories/route.ts
│       ├── history/route.ts
│       └── reset/route.ts
├── components/
│   ├── Tabs.tsx
│   ├── QuestionCard.tsx
│   ├── CategorySelector.tsx
│   ├── ProgressBar.tsx
│   └── HistoryList.tsx
├── lib/
│   ├── supabase.ts           # DB client
│   └── local-store.ts        # Dev fallback
└── types/
    └── question.ts
data/
├── merged_qbank.docx         # Source (original)
└── questions.json            # Parsed data
scripts/
├── parse-docx.ts
└── seed.ts
```

## Recent Changes
- 2026-01-26: Initial project setup
- 2026-01-26: Added local dev mode with sample questions
- 2026-01-26: Set up Supabase, parsed and seeded 751 questions
- 2026-01-26: Changed category selector from dropdown to checkbox grid
- 2026-01-26: Added tabbed interface (Categories, Play, History)
- 2026-01-26: Added history page to track answered questions
- 2026-01-26: Consolidated duplicate categories (Cardiovascular→Cardiology, etc.)
- 2026-01-26: Renamed Nervous→Neurology
