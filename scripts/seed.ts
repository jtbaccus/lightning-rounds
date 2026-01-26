/**
 * Seed Supabase database from questions.json
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Prerequisites:
 * 1. Create .env.local with Supabase credentials
 * 2. Create questions table in Supabase
 * 3. Run parse-docx.ts to generate questions.json
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') });

interface Question {
  category: string;
  subcategory: string | null;
  question: string;
  answer: string;
}

async function seed(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Load questions
  const questionsPath = path.join(__dirname, '../data/questions.json');
  if (!fs.existsSync(questionsPath)) {
    console.error('questions.json not found. Run parse-docx.ts first.');
    process.exit(1);
  }

  const questions: Question[] = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  console.log(`Loaded ${questions.length} questions from JSON`);

  // Clear existing questions
  console.log('Clearing existing questions...');
  const { error: deleteError } = await supabase
    .from('questions')
    .delete()
    .neq('id', 0);

  if (deleteError) {
    console.error('Error clearing questions:', deleteError.message);
    process.exit(1);
  }

  // Insert in batches
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);

    const { error } = await supabase.from('questions').insert(
      batch.map((q) => ({
        category: q.category,
        subcategory: q.subcategory,
        question: q.question,
        answer: q.answer,
        asked: false,
      }))
    );

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
      process.exit(1);
    }

    inserted += batch.length;
    console.log(`Inserted ${inserted}/${questions.length} questions`);
  }

  console.log('\nSeeding complete!');

  // Verify
  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  console.log(`Total questions in database: ${count}`);
}

seed().catch(console.error);
