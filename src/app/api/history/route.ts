import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import * as localStore from '@/lib/local-store';

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';

// GET /api/history - Get all asked questions
export async function GET() {
  if (!isSupabaseConfigured) {
    const questions = localStore.loadQuestions().filter((q) => q.asked);
    return NextResponse.json(
      { questions },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  }

  const { data: questions, error } = await supabase!
    .from('questions')
    .select('*')
    .eq('asked', true)
    .order('id', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { questions: questions || [] },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  );
}
