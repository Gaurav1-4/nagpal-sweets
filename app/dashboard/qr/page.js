'use client';

import { useState, useEffect } from 'react';
import { RESTAURANT_NAME } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import '../dashboard.css';

export default function QRPage() {
  const [tables, setTables] = useState([]);
  const [qrData, setQrData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('is_active', true);

    if (data) {
      setTables(data);
      // Generate QR for each table
      for (const table of data) {
        const res = await fetch(`/api/qr/${table.id}`);
        const result = await res.json();
        setQrData(prev => ({ ...prev, [table.id]: result }));
      }
    }
    setLoading(false);
  };

  const downloadQR = (tableId, tableName) => {
    const data = qrData[tableId];
    if (!data) return;

    const link = document.createElement('a');
    link.download = `QR-${tableName}.png`;
    link.href = data.qrDataUrl;
    link.click();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>{RESTAURANT_NAME}</h1>
          <p className="dashboard-subtitle">QR Code Management</p>
        </div>
        <Link href="/dashboard" className="nav-link">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="qr-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Generating QR codes...</p>
          </div>
        ) : (
          tables.map((table) => (
            <div key={table.id} className="qr-card">
              <h3>{table.name}</h3>
              {qrData[table.id] ? (
                <>
                  <div className="qr-image-wrapper">
                    <img
                      src={qrData[table.id].qrDataUrl}
                      alt={`QR Code for ${table.name}`}
                      className="qr-image"
                    />
                  </div>
                  <p className="qr-url">{qrData[table.id].menuUrl}</p>
                  <button
                    className="download-qr-btn"
                    onClick={() => downloadQR(table.id, table.name)}
                  >
                    📥 Download QR
                  </button>
                </>
              ) : (
                <div className="loading-spinner small"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
