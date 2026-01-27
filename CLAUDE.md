# Lightning Rounds - Project Instructions

## Overview
Web app for gameshow-style medical Q&A with 751 questions across 12 categories. Random selection with no repeats until manual reset. Built for teaching medical students in a fast-paced lightning round format.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (Postgres) — with local JSON fallback for development
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## Quick Reference

### Local Development
```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
```

### Database Scripts
```bash
npx tsx scripts/parse-docx.ts   # Parse docx → data/questions.json
npx tsx scripts/seed.ts         # Seed Supabase from questions.json
```

### Key Files
- `src/app/page.tsx` — Main app with tabbed interface
- `src/app/api/question/route.ts` — Random question, mark-asked
- `src/app/api/categories/route.ts` — Category list with counts
- `src/app/api/history/route.ts` — Answered questions list
- `src/app/api/reset/route.ts` — Reset all questions
- `src/lib/local-store.ts` — In-memory store for local dev
- `data/questions.json` — Question data (sample or parsed)

### Components
- `Tabs` — Tab navigation between pages
- `QuestionCard` — Displays question, reveal button, answer
- `CategorySelector` — Checkbox grid for multi-category selection
- `ProgressBar` — Visual remaining/total indicator
- `HistoryList` — Shows answered questions

## Local Development Mode

The app works **without Supabase** for testing. When env vars are missing:
- Uses `data/questions.json` as the data source
- Stores "asked" state in memory (resets on server restart)
- All features work: filtering, progress, reset

To test locally without database setup:
```bash
npm run dev
```

## Database Schema
```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  asked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_questions_asked ON questions(asked);
CREATE INDEX idx_questions_category ON questions(category);
```

## Environment Variables
Copy `.env.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_KEY` — Service role key (server-side only)

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/question?categories=X,Y,Z` | Random unasked question (comma-separated categories) |
| POST | `/api/question` | Mark question as asked (body: `{id}`) |
| GET | `/api/categories` | List categories with counts |
| GET | `/api/history` | List all answered questions |
| POST | `/api/reset` | Reset all asked flags |

## UI Structure

The app has 3 tabbed pages:

### Categories Tab
- Checkbox grid to select which categories to include
- "All" and "Clear" buttons for quick selection
- Shows remaining/total for each category
- "Start Playing" button to begin

### Play Tab
- Shows current question with reveal/next flow
- Progress bar for selected categories
- Keyboard shortcuts: Space = reveal, Enter = next
- Link to change category selection
- Reset button with confirmation

### History Tab
- Lists all answered questions (newest first)
- Shows category badge and Q&A for each
- "Clear History" triggers reset confirmation

## Data Flow

1. User selects categories on Categories tab
2. Switches to Play tab → fetches random unasked question from selected categories
3. User clicks "Show Answer" (or Space) → marks question as asked, reveals answer
4. User clicks "Next Question" (or Enter) → fetches new random question
5. History tab shows all answered questions from database
6. Reset → clears all asked flags and history

## Categories (12)

- Cardiology (105)
- Dermatology (29)
- Endocrinology (89)
- Gastroenterology (90)
- Geriatrics and Palliative Care (26)
- Hematology (63)
- Infectious Diseases (45)
- Neurology (86)
- Oncology (34)
- Pulmonology (77)
- Renal (69)
- Rheumatology (38)

## Deployment

1. Push to GitHub
2. Import to Vercel
3. Add Supabase env vars in project settings
4. Deploy

Production requires Supabase — local JSON mode is dev-only.

## Known Issues & Lessons Learned

### Supabase Client Caching Bug (2026-01-26)

**Problem:** The `@supabase/supabase-js` client caches query results in Vercel's serverless environment. Even creating fresh client instances per request doesn't help — the library has internal caching that persists across function invocations (warm starts).

**Symptoms:**
- Queries with `.eq('asked', true)` returned stale data
- Updates appeared successful (returned updated rows) but reads showed old values
- Different API routes got inconsistent data from the same table

**Root cause:** The Supabase JS client maintains internal state/caching that survives between serverless invocations when Vercel reuses the same function instance.

**Solution:** Use raw `fetch()` calls to the Supabase REST API instead of the JS client:

```typescript
// Instead of:
const { data } = await supabase.from('questions').select('*');

// Use:
const response = await fetch(
  `${supabaseUrl}/rest/v1/questions?select=*`,
  {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  }
);
const data = await response.json();
```

**Key points:**
- All API routes now use direct REST API calls
- Always include `cache: 'no-store'` in fetch options
- For updates, use `PATCH` method with query params for filtering
- The `src/lib/supabase.ts` shared client is no longer used

**Reference:** This issue may affect any Supabase + Vercel project. Document in main turing reference if encountered again.
