import { NextRequest, NextResponse } from 'next/server';
import { Question, QuestionResponse } from '@/types/question';
import * as localStore from '@/lib/local-store';

// GET /api/question?categories=X,Y,Z - Get random unasked question
export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  const searchParams = request.nextUrl.searchParams;
  const categoriesParam = searchParams.get('categories');
  const categories = categoriesParam ? categoriesParam.split(',').filter(Boolean) : [];

  // Use local store if Supabase isn't configured
  if (!supabaseUrl || !supabaseKey) {
    const question = localStore.getRandomUnasked(categories.length > 0 ? categories : undefined);
    const counts = localStore.getCounts(categories.length > 0 ? categories : undefined);

    const response: QuestionResponse = {
      question,
      remaining: counts.remaining,
      total: counts.total,
    };

    return NextResponse.json(response);
  }

  // Use raw fetch to bypass any Supabase client caching
  const fetchResponse = await fetch(
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

  if (!fetchResponse.ok) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const allQuestions = await fetchResponse.json();

  // Filter unasked questions
  let unaskedQuestions = (allQuestions || []).filter((q: Question) => q.asked === false);

  if (categories.length > 0) {
    unaskedQuestions = unaskedQuestions.filter((q: Question) => categories.includes(q.category));
  }

  // Get total count for selected categories
  let totalForCategories = allQuestions || [];
  if (categories.length > 0) {
    totalForCategories = totalForCategories.filter((q: Question) => categories.includes(q.category));
  }

  // Pick random question from unasked
  const remaining = unaskedQuestions.length;
  let question: Question | null = null;

  if (unaskedQuestions.length > 0) {
    const randomIndex = Math.floor(Math.random() * unaskedQuestions.length);
    question = unaskedQuestions[randomIndex] as Question;
  }

  const response: QuestionResponse = {
    question,
    remaining,
    total: totalForCategories.length,
  };

  return NextResponse.json(response);
}

// POST /api/question - Mark question as asked
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
  }

  // Use local store if Supabase isn't configured
  if (!supabaseUrl || !supabaseKey) {
    localStore.markAsked(id);
    return NextResponse.json({ success: true, mode: 'local' });
  }

  // Use raw fetch to update - PATCH request to Supabase REST API
  const fetchResponse = await fetch(
    `${supabaseUrl}/rest/v1/questions?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ asked: true }),
      cache: 'no-store',
    }
  );

  if (!fetchResponse.ok) {
    const errorText = await fetchResponse.text();
    return NextResponse.json({ error: errorText }, { status: 500 });
  }

  const updated = await fetchResponse.json();

  return NextResponse.json({ success: true, mode: 'supabase', updated });
}
