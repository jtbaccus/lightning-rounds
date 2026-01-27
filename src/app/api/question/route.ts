import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Question, QuestionResponse } from '@/types/question';
import * as localStore from '@/lib/local-store';

// GET /api/question?categories=X,Y,Z - Get random unasked question
// Empty categories or no param = all categories
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoriesParam = searchParams.get('categories');
  const categories = categoriesParam ? categoriesParam.split(',').filter(Boolean) : [];

  // Use local store if Supabase isn't configured
  if (!isSupabaseConfigured) {
    const question = localStore.getRandomUnasked(categories.length > 0 ? categories : undefined);
    const counts = localStore.getCounts(categories.length > 0 ? categories : undefined);

    const response: QuestionResponse = {
      question,
      remaining: counts.remaining,
      total: counts.total,
    };

    return NextResponse.json(response);
  }

  // Build query for unasked questions
  let query = supabase!
    .from('questions')
    .select('*')
    .eq('asked', false);

  if (categories.length > 0) {
    query = query.in('category', categories);
  }

  const { data: unaskedQuestions, error: fetchError } = await query;

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // Get counts
  let countQuery = supabase!
    .from('questions')
    .select('id', { count: 'exact' });

  if (categories.length > 0) {
    countQuery = countQuery.in('category', categories);
  }

  const { count: total } = await countQuery;

  // Pick random question from unasked
  const remaining = unaskedQuestions?.length || 0;
  let question: Question | null = null;

  if (unaskedQuestions && unaskedQuestions.length > 0) {
    const randomIndex = Math.floor(Math.random() * unaskedQuestions.length);
    question = unaskedQuestions[randomIndex] as Question;
  }

  const response: QuestionResponse = {
    question,
    remaining,
    total: total || 0,
  };

  return NextResponse.json(response);
}

// POST /api/question - Mark question as asked
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
  }

  // Use local store if Supabase isn't configured
  if (!isSupabaseConfigured) {
    localStore.markAsked(id);
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase!
    .from('questions')
    .update({ asked: true })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
