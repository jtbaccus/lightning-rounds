# Lightning Rounds - Project Instructions

## Overview
Web app for gameshow-style medical Q&A with ~659 questions. Random selection with no repeats until manual reset. Built for teaching medical students in a fast-paced lightning round format.

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
- `src/app/page.tsx` — Main game UI
- `src/app/api/question/route.ts` — Random question, mark-asked
- `src/app/api/categories/route.ts` — Category list
- `src/app/api/reset/route.ts` — Reset all questions
- `src/lib/supabase.ts` — Database client (with config check)
- `src/lib/local-store.ts` — In-memory store for local dev
- `data/questions.json` — Question data (sample or parsed)

### Components
- `QuestionCard` — Displays question, reveal button, answer
- `CategorySelector` — Dropdown with category counts
- `ProgressBar` — Visual remaining/total indicator

## Local Development Mode

The app works **without Supabase** for testing. When env vars are missing:
- Uses `data/questions.json` as the data source
- Stores "asked" state in memory (resets on server restart)
- All features work: filtering, progress, reset

To test locally without database setup:
```bash
npm run dev
# Opens with 10 sample medical questions
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
| GET | `/api/question?category=X` | Random unasked question |
| POST | `/api/question` | Mark question as asked (body: `{id}`) |
| GET | `/api/categories` | List categories with counts |
| POST | `/api/reset` | Reset all asked flags |

## UI Behavior

- **Keyboard shortcuts:** Space = reveal answer, Enter = next question
- **Category badge:** Only shown when filtering by a specific category (hidden on "All")
- **Reset:** Requires confirmation modal to prevent accidental resets
- **Progress:** Shows remaining/total for current filter

## Data Flow

1. Page loads → fetches random unasked question
2. User clicks "Show Answer" (or Space) → marks question as asked, reveals answer
3. User clicks "Next Question" (or Enter) → fetches new random question
4. Category change → refetches with new filter
5. Reset → clears all asked flags, refetches

## Deployment

1. Push to GitHub
2. Import to Vercel
3. Add Supabase env vars in project settings
4. Deploy

Production requires Supabase — local JSON mode is dev-only.
