import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { token } = await params;

    // 1. Look up table by token
    const { data: table, error: tableError } = await supabaseAdmin
      .from('tables')
      .select('*')
      .eq('qr_token', token)
      .eq('is_active', true)
      .single();

    if (tableError || !table) {
      return NextResponse.json(
        { error: 'Table not found or inactive' },
        { status: 404 }
      );
    }

    // 2. Check for an active session (status NOT 'closed')
    const { data: existingSession } = await supabaseAdmin
      .from('table_sessions')
      .select('*')
      .eq('table_id', table.id)
      .neq('status', 'closed')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSession) {
      return NextResponse.json({ table, session: existingSession });
    }

    // 3. No active session — create a new one
    const { data: newSession, error: sessionError } = await supabaseAdmin
      .from('table_sessions')
      .insert({ table_id: table.id, status: 'active' })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ table, session: newSession });
  } catch (err) {
    console.error('Table lookup error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
