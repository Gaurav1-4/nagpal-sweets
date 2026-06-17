'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  RESTAURANT_NAME,
} from '@/lib/constants';
import './dashboard.css';

const ORDER_STATUS_COLORS = {
  placed: '#3b82f6',
  confirmed: '#6366f1',
  cooking: '#f59e0b',
  ready: '#22c55e',
  served: '#8b5cf6',
  cancelled: '#6b7280',
};

export default function DashboardPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [table, setTable] = useState(null);
  const [session, setSession] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // ---------- Clock ----------
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // ---------- Toast helper ----------
  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ---------- Fetch table & session ----------
  const fetchTableSession = useCallback(async () => {
    // Fetch the first active table
    const { data: tables } = await supabase
      .from('tables')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (!tables || tables.length === 0) {
      setLoading(false);
      return;
    }

    const tbl = tables[0];
    setTable(tbl);

    // Fetch active session for this table
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('table_id', tbl.id)
      .neq('status', 'closed')
      .order('started_at', { ascending: false })
      .limit(1);

    if (sessions && sessions.length > 0) {
      setSession(sessions[0]);
    } else {
      setSession(null);
    }

    setLoading(false);
  }, []);

  // ---------- Fetch orders ----------
  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  }, []);

  // ---------- Initial load ----------
  useEffect(() => {
    fetchTableSession();
    fetchOrders();
  }, [fetchTableSession, fetchOrders]);

  // ---------- Polling fallback (every 5s) ----------
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
      fetchTableSession();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchTableSession]);

  // ---------- Supabase Realtime ----------
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'table_sessions' },
        () => {
          fetchTableSession();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, fetchTableSession]);

  // ---------- Actions ----------
  const updateOrderStatus = async (orderId, status) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Order updated to ${ORDER_STATUS_LABELS[status]}`);
        await fetchOrders();
        await fetchTableSession();
      }
    } catch (e) {
      console.error(e);
    }
    setActionLoading(null);
  };

  const updateSessionStatus = async (status) => {
    if (!session) return;
    setActionLoading('session-' + status);
    try {
      const res = await fetch(`/api/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSession(status === 'closed' ? null : updated);
        showToast(
          status === 'closed'
            ? 'Session closed — table is available'
            : `Session → ${SESSION_STATUS_LABELS[status]}`
        );
        if (status === 'closed') {
          setOrders([]);
          await fetchTableSession();
        }
      }
    } catch (e) {
      console.error(e);
    }
    setActionLoading(null);
  };

  const createNewSession = async () => {
    if (!table) return;
    setActionLoading('new-session');
    try {
      const res = await fetch(`/api/tables/${table.token}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        showToast('New session started');
      }
    } catch (e) {
      console.error(e);
    }
    setActionLoading(null);
  };

  // ---------- Helpers ----------
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const getSessionDuration = () => {
    if (!session) return '';
    const start = new Date(session.started_at);
    const diff = Math.floor((currentTime - start) / 1000 / 60);
    if (diff < 1) return 'Just started';
    if (diff < 60) return `${diff} min`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner" />
          Loading dashboard…
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* ===== Header ===== */}
      <header className="dashHeader">
        <h1 className="dashTitle">
          <span>{RESTAURANT_NAME}</span> — Dashboard
        </h1>
        <div className="dashTime">
          {formatDate(currentTime)} &nbsp;·&nbsp; {formatTime(currentTime)}
        </div>
      </header>

      <div className="dashBody">
        {/* ===== Table Status Card ===== */}
        {table && (
          <div className="card tableCard">
            <div className="tableCardInner">
              <div className="tableInfo">
                <div className="tableIcon">🪑</div>
                <div>
                  <div className="tableName">{table.name}</div>
                  <div className="tableMeta">
                    {session
                      ? `Started ${formatTime(session.started_at)} · ${getSessionDuration()}`
                      : 'No active session'}
                  </div>
                </div>
                {session && (
                  <span
                    className="badge"
                    style={{
                      background: `${SESSION_STATUS_COLORS[session.status]}22`,
                      color: SESSION_STATUS_COLORS[session.status],
                    }}
                  >
                    {SESSION_STATUS_LABELS[session.status]}
                  </span>
                )}
              </div>
              <div className="tableActions">
                {(!session || session.status === 'closed') && (
                  <button
                    className="btn btnPrimary"
                    onClick={createNewSession}
                    disabled={actionLoading === 'new-session'}
                  >
                    {actionLoading === 'new-session'
                      ? 'Starting…'
                      : '＋ New Session'}
                  </button>
                )}
                {session && session.status === 'awaiting_payment' && (
                  <button
                    className="btn btnSuccess"
                    onClick={() => updateSessionStatus('closed')}
                    disabled={actionLoading === 'session-closed'}
                  >
                    {actionLoading === 'session-closed'
                      ? 'Closing…'
                      : '✓ Mark Paid & Close'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Orders Section ===== */}
        <h2 className="sectionTitle">Live Orders</h2>

        {orders.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">📋</div>
            <p>No active orders right now</p>
            <p style={{ fontSize: '0.82rem', color: '#4a5568' }}>
              Orders will appear here in real-time when customers place them
            </p>
          </div>
        ) : (
          <div className="ordersGrid">
            {orders.map((order) => (
              <div key={order.id} className="orderCard">
                {/* Header */}
                <div className="orderCardHeader">
                  <span className="orderId">#{order.id.slice(0, 8)}</span>
                  <span
                    className="badge"
                    style={{
                      background: `${ORDER_STATUS_COLORS[order.status]}22`,
                      color: ORDER_STATUS_COLORS[order.status],
                    }}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Customer */}
                <p className="orderCustomer">
                  <strong>{order.customer_name || 'Walk-in'}</strong>
                  {order.customer_phone && (
                    <span>📞 {order.customer_phone}</span>
                  )}
                </p>

                {/* Items */}
                <ul className="orderItems">
                  {order.order_items?.map((item) => (
                    <li key={item.id} className="orderItem">
                      <span>
                        <span className="itemName">
                          {item.menu_item?.name || 'Item'}
                        </span>
                        <span className="itemQty">×{item.quantity}</span>
                        {item.size === 'half' && (
                          <span className="itemSize">Half</span>
                        )}
                      </span>
                      <span className="itemPrice">
                        ₹{item.price_at_order * item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="orderFooter">
                  <span className="orderTotal">₹{order.total_amount}</span>

                  {order.status === 'placed' && (
                    <button
                      className="btn btnWarning"
                      onClick={() => updateOrderStatus(order.id, 'cooking')}
                      disabled={actionLoading === order.id}
                    >
                      {actionLoading === order.id
                        ? 'Updating…'
                        : '🔥 Start Cooking'}
                    </button>
                  )}
                  {order.status === 'cooking' && (
                    <button
                      className="btn btnSuccess"
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      disabled={actionLoading === order.id}
                    >
                      {actionLoading === order.id
                        ? 'Updating…'
                        : '✓ Mark Ready'}
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      className="btn btnPrimary"
                      onClick={() => updateOrderStatus(order.id, 'served')}
                      disabled={actionLoading === order.id}
                    >
                      {actionLoading === order.id
                        ? 'Updating…'
                        : '🍽 Mark Served'}
                    </button>
                  )}
                  {order.status === 'served' && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: '#64748b',
                      }}
                    >
                      Awaiting bill
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== Bill & Close Section ===== */}
        {session && session.status !== 'closed' && orders.length > 0 && (
          <div className="billSection">
            <h2 className="sectionTitle">Billing</h2>
            <div className="card">
              <div className="billActions">
                <button
                  className="btn btnGhost"
                  onClick={() =>
                    router.push(`/dashboard/bill/${session.id}`)
                  }
                >
                  🧾 Generate Bill
                </button>

                {session.status !== 'awaiting_payment' && (
                  <button
                    className="btn btnDanger"
                    onClick={() =>
                      updateSessionStatus('awaiting_payment')
                    }
                    disabled={
                      actionLoading === 'session-awaiting_payment'
                    }
                  >
                    {actionLoading === 'session-awaiting_payment'
                      ? 'Updating…'
                      : '💰 Close & Collect Payment'}
                  </button>
                )}

                {session.status === 'awaiting_payment' && (
                  <button
                    className="btn btnSuccess"
                    onClick={() => updateSessionStatus('closed')}
                    disabled={actionLoading === 'session-closed'}
                  >
                    {actionLoading === 'session-closed'
                      ? 'Closing…'
                      : '✓ Mark Paid'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== Toast ===== */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
