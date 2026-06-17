import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { sessionId, customerName, customerPhone, items } =
      await request.json();

    if (!sessionId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'sessionId and items are required' },
        { status: 400 }
      );
    }

    // Calculate total from items
    const totalAmount = items.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0
    );

    // Insert order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        session_id: sessionId,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        total_amount: totalAmount,
        status: 'placed',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      size: item.size || 'full',
      price_at_order: item.priceAtOrder,
    }));

    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
      // Rollback order on failure
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // Update session status to 'ordering'
    await supabaseAdmin
      .from('table_sessions')
      .update({ status: 'ordering' })
      .eq('id', sessionId);

    return NextResponse.json(
      { ...order, order_items: insertedItems },
      { status: 201 }
    );
  } catch (err) {
    console.error('Order creation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Return all orders for this session with items and menu_item names
      const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            menu_item:menu_items ( id, name, price_full, price_half )
          )
        `
        )
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Orders fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch orders' },
          { status: 500 }
        );
      }

      return NextResponse.json(orders);
    }

    // Dashboard: return all non-closed orders with session and table info
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(
        `
        *,
        order_items (
          *,
          menu_item:menu_items ( id, name, price, half_price )
        ),
        session:table_sessions (
          *,
          table:tables ( id, name, qr_token )
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Dashboard orders fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Filter out orders whose session is closed
    const activeOrders = orders.filter(
      (o) => o.session && o.session.status !== 'closed'
    );

    return NextResponse.json(activeOrders);
  } catch (err) {
    console.error('Orders GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
