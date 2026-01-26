# Lightning Rounds - Current Context

## Status
**Phase:** MVP Complete (Local Testing)
**Last Updated:** 2026-01-26

## Current Goals
- [x] Initialize Next.js project
- [x] Create basic structure
- [x] Build API routes
- [x] Build UI components
- [x] Add keyboard shortcuts
- [x] Add local dev mode (no DB required)
- [x] Add sample questions for testing
- [ ] Parse real questions from docx
- [ ] Set up Supabase
- [ ] Seed production database
- [ ] Deploy to Vercel

## What's Working

**Fully functional locally:**
- Random question selection
- Category filtering (6 categories in sample data)
- Progress tracking (remaining/total)
- Reveal answer flow
- Mark questions as asked
- Reset all questions
- Keyboard shortcuts (Space/Enter)
- Category badge hidden when "All" selected

**Sample data:** 10 medical questions across Cardiovascular, Pulmonary, Endocrine, Infectious Disease, Gastroenterology, and Neurology.

## Architecture Decisions

### Single Table Design
Using one `questions` table with an `asked` boolean flag. Simple and sufficient for the use case.

### Supabase with Local Fallback
- Production: Supabase Postgres
- Development: In-memory store reading from `data/questions.json`
- Automatic detection via env var presence

### Server-side API Routes
All database operations go through Next.js API routes. Client never talks directly to Supabase or local store.

### Category Badge Logic
Category/subcategory badge only displays when user has filtered to a specific category. Hidden on "All" to reduce visual clutter during general play.

## Known Issues
None.

## Next Steps

1. **Parse real questions:** Run `npx tsx scripts/parse-docx.ts` and review output
   - Parser may need adjustment based on actual docx format
   - Edit `data/questions.json` manually if needed

2. **Set up Supabase:**
   - Create project at supabase.com
   - Run schema SQL (see CLAUDE.md)
   - Copy credentials to `.env.local`

3. **Seed database:** Run `npx tsx scripts/seed.ts`

4. **Deploy:** Connect to Vercel, add env vars

## File Structure
```
src/
├── app/
│   ├── page.tsx              # Main game UI
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── question/route.ts
│       ├── categories/route.ts
│       └── reset/route.ts
├── components/
│   ├── QuestionCard.tsx
│   ├── CategorySelector.tsx
│   └── ProgressBar.tsx
├── lib/
│   ├── supabase.ts           # DB client
│   └── local-store.ts        # Dev fallback
└── types/
    └── question.ts
data/
├── merged_qbank.docx         # Source (659 questions)
└── questions.json            # Sample/parsed data
scripts/
├── parse-docx.ts
└── seed.ts
```

## Recent Changes
- 2026-01-26: Initial project setup
- 2026-01-26: Added local dev mode with sample questions
- 2026-01-26: Category badge only shows when filtering
