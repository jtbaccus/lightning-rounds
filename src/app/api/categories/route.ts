import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { CategoryCount } from '@/types/question';
import * as localStore from '@/lib/local-store';

// GET /api/categories - List categories with counts
export async function GET() {
  // Use local store if Supabase isn't configured
  if (!isSupabaseConfigured) {
    return NextResponse.json(localStore.getCategories());
  }

  // Get all questions to compute category counts
  const { data: questions, error } = await supabase!
    .from('questions')
    .select('category, asked');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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
  const totalRemaining = questions?.filter(q => !q.asked).length || 0;

  return NextResponse.json({
    categories,
    totalQuestions,
    totalRemaining,
  });
}
