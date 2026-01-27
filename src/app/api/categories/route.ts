import { NextResponse } from 'next/server';
import { CategoryCount } from '@/types/question';
import * as localStore from '@/lib/local-store';

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';

// GET /api/categories - List categories with counts
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  // Use local store if Supabase isn't configured
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(localStore.getCategories());
  }

  // Use raw fetch to bypass any Supabase client caching
  const fetchResponse = await fetch(
    `${supabaseUrl}/rest/v1/questions?select=category,asked`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  if (!fetchResponse.ok) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const questions = await fetchResponse.json();

  // Aggregate counts by category
  const categoryMap = new Map<string, { total: number; remaining: number }>();

  for (const q of questions || []) {
    const current = categoryMap.get(q.category) || { total: 0, remaining: 0 };
    current.total++;
    if (!q.asked) {
      current.remaining++;
    }
    categoryMap.set(q.category, current);
  }

  // Convert to array and sort
  const categories: CategoryCount[] = Array.from(categoryMap.entries())
    .map(([category, counts]) => ({
      category,
      total: counts.total,
      remaining: counts.remaining,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  // Calculate overall totals
  const totalQuestions = questions?.length || 0;
  const totalRemaining = questions?.filter((q: { asked: boolean }) => !q.asked).length || 0;

  return NextResponse.json({
    categories,
    totalQuestions,
    totalRemaining,
  });
}
