import { NextResponse } from 'next/server';
import * as localStore from '@/lib/local-store';

// POST /api/reset - Reset all asked flags
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  // Use local store if Supabase isn't configured
  if (!supabaseUrl || !supabaseKey) {
    localStore.resetAll();
    return NextResponse.json({ success: true, mode: 'local' });
  }

  // Use raw fetch to reset - PATCH request to Supabase REST API
  // Update all rows where id != 0 (all rows)
  const fetchResponse = await fetch(
    `${supabaseUrl}/rest/v1/questions?id=neq.0`,
    {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asked: false }),
      cache: 'no-store',
    }
  );

  if (!fetchResponse.ok) {
    const errorText = await fetchResponse.text();
    return NextResponse.json({ error: errorText }, { status: 500 });
  }

  return NextResponse.json({ success: true, mode: 'supabase' });
}
