import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import * as localStore from '@/lib/local-store';

// POST /api/reset - Reset all asked flags
export async function POST() {
  // Use local store if Supabase isn't configured
  if (!isSupabaseConfigured) {
    localStore.resetAll();
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase!
    .from('questions')
    .update({ asked: false })
    .neq('id', 0); // Update all rows

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
