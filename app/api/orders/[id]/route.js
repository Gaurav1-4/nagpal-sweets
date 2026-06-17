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

    // Update the order status
    const { data: updatedOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*, session_id')
      .single();

    if (orderError) {
      console.error('Order update error:', orderError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Check if all orders in the session share the same status
    const { data: sessionOrders } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('session_id', updatedOrder.session_id)
      .neq('status', 'cancelled');

    if (sessionOrders && sessionOrders.length > 0) {
      const allSameStatus = sessionOrders.every(
        (o) => o.status === status
      );

      if (allSameStatus) {
        // Map order status to session status
        const sessionStatusMap = {
          placed: 'ordering',
          confirmed: 'ordering',
          cooking: 'cooking',
          ready: 'ready',
          served: 'served',
        };

        const newSessionStatus = sessionStatusMap[status];
        if (newSessionStatus) {
          await supabaseAdmin
            .from('sessions')
            .update({ status: newSessionStatus })
            .eq('id', updatedOrder.session_id);
        }
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (err) {
    console.error('Order PATCH error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
