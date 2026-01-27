import { NextResponse } from 'next/server';
import * as localStore from '@/lib/local-store';

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';

// GET /api/history - Get all asked questions
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const questions = localStore.loadQuestions().filter((q) => q.asked);
    return NextResponse.json(
      { questions, mode: 'local' },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  }

  // Use raw fetch to bypass any Supabase client caching
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

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const allQuestions = await response.json();

  // Filter and sort in JavaScript
  const questions = (allQuestions || [])
    .filter((q: { asked: boolean }) => q.asked === true)
    .sort((a: { id: number }, b: { id: number }) => b.id - a.id);

  return NextResponse.json(
    { questions },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      }
    }
  );
}
