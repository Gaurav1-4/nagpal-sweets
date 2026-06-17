import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import QRCode from 'qrcode';

export async function GET(request, { params }) {
  try {
    const { tableId } = await params;

    // Get the table
    const { data: table, error } = await supabaseAdmin
      .from('tables')
      .select('*')
      .eq('id', tableId)
      .single();

    if (error || !table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Generate QR code URL
    const baseUrl = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const menuUrl = `${protocol}://${baseUrl}/t/${table.qr_token}`;

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });

    return NextResponse.json({
      table,
      menuUrl,
      qrDataUrl,
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
