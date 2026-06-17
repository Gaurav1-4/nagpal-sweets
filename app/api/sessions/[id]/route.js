import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updateData = { status };

    // If closing session, set closed_at
    if (status === 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    const { data: updatedSession, error } = await supabaseAdmin
      .from('table_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Session update error:', error);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedSession);
  } catch (err) {
    console.error('Session PATCH error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Get session with table info
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('table_sessions')
      .select('*, table:tables ( id, name, qr_token )')
      .eq('id', id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get all orders for this session with items and menu details
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(
        `
        *,
        order_items (
          *,
          menu_item:menu_items ( id, name, price, half_price )
        )
      `
      )
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    if (ordersError) {
      console.error('Session orders fetch error:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch session orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ...session, orders });
  } catch (err) {
    console.error('Session GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
