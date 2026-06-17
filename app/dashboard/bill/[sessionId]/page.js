'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from '@/lib/constants';
import './bill.css';

export default function BillPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBill() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        }
      } catch (e) {
        console.error('Bill fetch error:', e);
      }
      setLoading(false);
    }

    if (sessionId) fetchBill();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="billPage">
        <div className="billLoading">Loading bill…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="billPage">
        <div className="billLoading">Session not found</div>
      </div>
    );
  }

  const orders = session.orders || [];
  const grandTotal = orders.reduce((sum, o) => sum + o.total_amount, 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="billPage">
      <div className="receipt">
        {/* ===== Header ===== */}
        <div className="receiptHeader">
          <h1 className="receiptBrand">
            <span className="receiptBrandAccent">{RESTAURANT_NAME}</span>
          </h1>
          <p className="receiptMeta">{RESTAURANT_TAGLINE}</p>
          <p className="receiptMeta">
            {session.table?.name || 'Table'} &nbsp;·&nbsp;{' '}
            {formatDate(session.started_at)} &nbsp;{' '}
            {formatTime(session.started_at)}
          </p>
        </div>

        {/* ===== Orders ===== */}
        {orders.map((order, idx) => (
          <div key={order.id} className="receiptOrder">
            <div className="receiptOrderTitle">
              Order {idx + 1}
              {order.customer_name && ` — ${order.customer_name}`}
            </div>

            <table className="receiptTable">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.menu_item?.name || 'Item'}
                      {item.size === 'half' && (
                        <span className="itemSizeTag">Half</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>
                      ₹{item.price_at_order}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      ₹{item.price_at_order * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receiptSubtotal">
              <span>Subtotal</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>
        ))}

        {/* ===== Grand Total ===== */}
        <div className="receiptGrandTotal">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>

        {/* ===== Footer ===== */}
        <div className="receiptFooter">
          <p>Thank you for dining with us!</p>
          <p>🙏 {RESTAURANT_NAME}</p>
        </div>

        {/* ===== Print ===== */}
        <div className="printBtnWrap">
          <button className="printBtn" onClick={() => window.print()}>
            🖨 Print Bill
          </button>
          <br />
          <a href="/dashboard" className="backLink">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
