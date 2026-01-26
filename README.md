# Lightning Rounds

Gameshow-style medical Q&A web app for teaching medical students. Randomizes ~659 questions with no repeats until manual reset.

## Features

- Random question selection from question bank
- Category/subcategory filtering
- Tracks asked questions (persistent across sessions)
- One-click reset for new student groups
- Keyboard shortcuts (Space = reveal, Enter = next)
- Mobile-friendly responsive design

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (Postgres)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run:

```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  asked BOOLEAN DEFAULT FALSE
);

-- Create index for faster queries
CREATE INDEX idx_questions_asked ON questions(asked);
CREATE INDEX idx_questions_category ON questions(category);
```

3. Get your credentials from Project Settings > API:
   - Project URL
   - Service role key (secret)

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 4. Parse Questions

Extract questions from the docx file:

```bash
npx tsx scripts/parse-docx.ts
```

This creates `data/questions.json`. Review and edit if needed.

### 5. Seed Database

```bash
npx tsx scripts/seed.ts
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy

## Usage

1. **Start a session:** The app loads a random unasked question
2. **Reveal answer:** Click "Show Answer" or press Space
3. **Next question:** Click "Next Question" or press Enter
4. **Filter:** Use the dropdown to limit to a specific category
5. **Reset:** When starting with a new group, click Reset to clear all asked flags

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main game UI
│   │   └── api/
│   │       ├── question/      # GET random, POST mark-asked
│   │       ├── categories/    # GET list with counts
│   │       └── reset/         # POST reset all
│   ├── components/
│   │   ├── QuestionCard.tsx
│   │   ├── CategorySelector.tsx
│   │   └── ProgressBar.tsx
│   ├── lib/supabase.ts
│   └── types/question.ts
├── data/
│   ├── merged_qbank.docx      # Source document
│   └── questions.json         # Parsed Q&A (after running parse-docx)
└── scripts/
    ├── parse-docx.ts          # Extract Q&A from docx
    └── seed.ts                # Populate Supabase
```

## License

Private - Internal use only
