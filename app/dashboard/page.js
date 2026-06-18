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

// Tables designated for online orders
const ONLINE_TABLE_NAMES = ['Takeaway', 'Online'];

export default function DashboardPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [tables, setTables] = useState([]);
  const [sessions, setSessions] = useState({}); // tableId -> active session
  const [orders, setOrders] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Active Tab state
  const [activeTab, setActiveTab] = useState('overview'); // overview, dinein, online

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

  // ---------- Fetch Data ----------
  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch tables
      const { data: tablesData } = await supabase
        .from('tables')
        .select('*')
        .eq('is_active', true)
        .order('name');
        
      if (tablesData) setTables(tablesData);

      // 2. Fetch active sessions
      const { data: sessionsData } = await supabase
        .from('table_sessions')
        .select('*')
        .neq('status', 'closed');
        
      if (sessionsData) {
        const sessionMap = {};
        sessionsData.forEach(s => {
          sessionMap[s.table_id] = s;
        });
        setSessions(sessionMap);
      }

      // 3. Fetch active orders
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- Initial load & Polling ----------
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ---------- Supabase Realtime ----------
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_sessions' }, fetchData)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchData]);

  // ---------- Actions ----------
  const updateOrderStatus = async (orderId, status) => {
    setActionLoading(`order-${orderId}`);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Order updated to ${ORDER_STATUS_LABELS[status]}`);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
    setActionLoading(null);
  };

  const updateSessionStatus = async (sessionId, status) => {
    setActionLoading(`session-${sessionId}`);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(status === 'closed' ? 'Session closed & paid' : `Session updated`);
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
    setActionLoading(null);
  };

  const createNewSession = async (token) => {
    setActionLoading(`new-session-${token}`);
    try {
      const res = await fetch(`/api/tables/${token}`);
      if (res.ok) {
        showToast('New session started');
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
    setActionLoading(null);
  };

  // ---------- Computed & Helpers ----------
  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const getElapsedTime = (dateString) => {
    if (!dateString) return '';
    const start = new Date(dateString);
    const diff = Math.floor((currentTime - start) / 1000 / 60);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  };

  const dineInTables = tables.filter(t => !ONLINE_TABLE_NAMES.includes(t.name));
  const onlineTables = tables.filter(t => ONLINE_TABLE_NAMES.includes(t.name));

  const dineInOrders = orders.filter(o => o.session && !ONLINE_TABLE_NAMES.includes(o.session.table?.name));
  const onlineOrders = orders.filter(o => o.session && ONLINE_TABLE_NAMES.includes(o.session.table?.name));

  // KPIs
  const totalOrdersToday = orders.length; // Approximated by active orders for now
  const totalRevenueToday = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const activeDineInSessions = dineInTables.filter(t => sessions[t.id]).length;

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="dashboard-wrapper loading-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  // ---------- Render Order List ----------
  const renderOrderList = (orderList) => {
    if (orderList.length === 0) {
      return (
        <div className="emptyState">
          <div className="emptyIcon">📋</div>
          <p>No active orders</p>
        </div>
      );
    }

    return (
      <div className="ordersGrid">
        {orderList.map((order) => {
          const table = order.session?.table;
          return (
            <div key={order.id} className="orderCard">
              <div className="orderCardHeader">
                <div>
                  <span className="orderTableName">{table?.name || 'Unknown Table'}</span>
                  <span className="orderId">#{order.id.slice(0, 5)}</span>
                </div>
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

              <p className="orderCustomer">
                <strong>{order.customer_name || 'Customer'}</strong>
                {order.customer_phone && <span>📞 {order.customer_phone}</span>}
                <span className="timeElapsed">{getElapsedTime(order.created_at)}</span>
              </p>

              <ul className="orderItems">
                {order.order_items?.map((item) => (
                  <li key={item.id} className="orderItem">
                    <span>
                      <span className="itemQty">{item.quantity}×</span>
                      <span className="itemName">{item.menu_item?.name || 'Item'}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="orderFooter">
                <span className="orderTotal">₹{order.total_amount}</span>

                {order.status === 'placed' && (
                  <button
                    className="btn btnWarning"
                    onClick={() => updateOrderStatus(order.id, 'cooking')}
                    disabled={actionLoading === `order-${order.id}`}
                  >
                    🔥 Start Cooking
                  </button>
                )}
                {order.status === 'cooking' && (
                  <button
                    className="btn btnSuccess"
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    disabled={actionLoading === `order-${order.id}`}
                  >
                    ✓ Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    className="btn btnPrimary"
                    onClick={() => updateOrderStatus(order.id, 'served')}
                    disabled={actionLoading === `order-${order.id}`}
                  >
                    🍽 Mark Served
                  </button>
                )}
                {order.status === 'served' && (
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Awaiting bill</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dashboard-wrapper">
      {/* ===== Top Navbar ===== */}
      <nav className="dashNav">
        <div className="navBrand">
          <h1>{RESTAURANT_NAME}</h1>
          <span className="versionBadge">Pro</span>
        </div>
        <div className="navTime">{formatTime(currentTime)}</div>
      </nav>

      {/* ===== KPI Header ===== */}
      <div className="kpiBar">
        <div className="kpiCard">
          <div className="kpiValue">{activeDineInSessions} / {dineInTables.length}</div>
          <div className="kpiLabel">Active Tables</div>
        </div>
        <div className="kpiCard">
          <div className="kpiValue">{totalOrdersToday}</div>
          <div className="kpiLabel">Active Orders</div>
        </div>
        <div className="kpiCard">
          <div className="kpiValue">₹{totalRevenueToday}</div>
          <div className="kpiLabel">Current Revenue</div>
        </div>
        <div className="kpiCard qrShortcut">
          <button onClick={() => router.push('/dashboard/qr')} className="btn btnGhost">
            🖨️ QR Codes
          </button>
        </div>
      </div>

      {/* ===== Main Content Area ===== */}
      <div className="dashContent">
        {/* Sidebar / Tabs */}
        <div className="dashTabs">
          <button 
            className={`tabBtn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Tables Overview
          </button>
          <button 
            className={`tabBtn ${activeTab === 'dinein' ? 'active' : ''}`}
            onClick={() => setActiveTab('dinein')}
          >
            🍽️ Dine-in Orders {dineInOrders.length > 0 && <span className="tabBadge">{dineInOrders.length}</span>}
          </button>
          <button 
            className={`tabBtn ${activeTab === 'online' ? 'active' : ''}`}
            onClick={() => setActiveTab('online')}
          >
            🛍️ Online Orders {onlineOrders.length > 0 && <span className="tabBadge onlineBadge">{onlineOrders.length}</span>}
          </button>
        </div>

        {/* Tab Content */}
        <div className="tabContent">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="tablesGrid">
              {[...dineInTables, ...onlineTables].map(table => {
                const session = sessions[table.id];
                const isOnlineTable = ONLINE_TABLE_NAMES.includes(table.name);
                
                return (
                  <div key={table.id} className={`tableCard ${session ? 'activeSession' : ''} ${isOnlineTable ? 'onlineTable' : ''}`}>
                    <div className="tableHeader">
                      <h3>{table.name}</h3>
                      {session && (
                        <span className="badge" style={{ background: `${SESSION_STATUS_COLORS[session.status]}22`, color: SESSION_STATUS_COLORS[session.status] }}>
                          {SESSION_STATUS_LABELS[session.status]}
                        </span>
                      )}
                    </div>
                    <div className="tableBody">
                      {session ? (
                        <>
                          <div className="sessionTime">Session active for {getElapsedTime(session.started_at)}</div>
                          <div className="tableActions">
                            <button className="btn btnGhost btnSmall" onClick={() => router.push(`/dashboard/bill/${session.id}`)}>🧾 Bill</button>
                            {session.status === 'awaiting_payment' ? (
                              <button className="btn btnSuccess btnSmall" onClick={() => updateSessionStatus(session.id, 'closed')}>✓ Paid</button>
                            ) : (
                              <button className="btn btnDanger btnSmall" onClick={() => updateSessionStatus(session.id, 'awaiting_payment')}>💳 Checkout</button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="emptyTableActions">
                          <p className="noSession">Available</p>
                          <button 
                            className="btn btnPrimary btnSmall" 
                            onClick={() => createNewSession(table.qr_token)}
                            disabled={actionLoading === `new-session-${table.qr_token}`}
                          >
                            ＋ Start
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DINE-IN ORDERS TAB */}
          {activeTab === 'dinein' && (
            <div className="ordersSection">
              <h2 className="sectionHeader">🍽️ Dine-in Live Orders</h2>
              {renderOrderList(dineInOrders)}
            </div>
          )}

          {/* ONLINE ORDERS TAB */}
          {activeTab === 'online' && (
            <div className="ordersSection">
              <h2 className="sectionHeader">🛍️ Online (Takeaway)</h2>
              {renderOrderList(onlineOrders)}
            </div>
          )}

        </div>
      </div>

      {/* ===== Toast ===== */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

