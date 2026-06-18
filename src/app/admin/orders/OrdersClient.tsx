'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminOrder } from './page';

const PAYMENT_STATUS_LABELS: Record<number, string> = {
  121120000: 'Pending',
  121120001: 'Paid',
  121120002: 'Failed',
  121120003: 'Refunded',
};

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const PAYMENT_STATUS_COLORS: Record<number, { bg: string; color: string }> = {
  121120000: { bg: '#FFF8E1', color: '#C5A028' },
  121120001: { bg: '#F0FFF4', color: '#1B7A3E' },
  121120002: { bg: '#FFF0F0', color: '#B22234' },
  121120003: { bg: '#F5F5F5', color: '#888888' },
};

export default function OrdersClient({ orders }: { orders: AdminOrder[] }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.firstName.toLowerCase().includes(q) ||
      o.lastName.toLowerCase().includes(q) ||
      o.phone.includes(q);
    const matchesStatus = filterStatus === 'all' || o.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 121120001)
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1B2A4A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028' }}>
            Banner Beauty Admin
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Orders
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/admin/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Back to Site
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Revenue summary */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '16px 24px', marginBottom: 20, display: 'flex', gap: 32, alignItems: 'center', borderTop: '3px solid #1B7A3E' }}>
          <div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 4 }}>Total Revenue</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1B2A4A' }}>${totalRevenue.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 4 }}>Total Orders</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1B2A4A' }}>{orders.length}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 4 }}>Paid Orders</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#1B7A3E' }}>{orders.filter(o => o.paymentStatus === 121120001).length}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 4 }}>Failed</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 700, color: '#B22234' }}>{orders.filter(o => o.paymentStatus === 121120002).length}</div>
          </div>
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number, name, or phone..."
            style={{
              flex: 1,
              minWidth: 200,
              padding: '10px 16px',
              fontSize: '16px',
              fontFamily: 'Trebuchet MS, sans-serif',
              border: '1.5px solid #DDDDDD',
              borderRadius: 6,
              outline: 'none',
              background: '#FFFFFF',
            }}
          />
          {(['all', 121120000, 121120001, 121120002, 121120003] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '10px 16px',
                borderRadius: 20,
                border: `2px solid ${status === 'all' ? '#1B2A4A' : (PAYMENT_STATUS_COLORS[status]?.color ?? '#888')}`,
                background: filterStatus === status ? (status === 'all' ? '#1B2A4A' : (PAYMENT_STATUS_COLORS[status]?.bg ?? '#F5F5F5')) : 'transparent',
                color: filterStatus === status ? (status === 'all' ? '#FFFFFF' : (PAYMENT_STATUS_COLORS[status]?.color ?? '#888')) : '#888888',
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {status === 'all' ? 'All' : PAYMENT_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {/* Count */}
        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginBottom: 12 }}>
          {filtered.length} of {orders.length} orders
        </div>

        {/* Orders list */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
              No orders found.
            </div>
          ) : (
            filtered.map((o, i) => {
              const statusStyle = PAYMENT_STATUS_COLORS[o.paymentStatus] ?? { bg: '#F5F5F5', color: '#888888' };
              return (
                <div key={o.orderId} style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 100px 100px 120px',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid #F5F5F5' : 'none',
                  background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                }}>

                  {/* Order number */}
                  <div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A' }}>
                      {o.orderNumber}
                    </div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA' }}>
                      {formatDate(o.createdOn)}
                    </div>
                  </div>

                  {/* Customer */}
                  <div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B2A4A', fontWeight: 600 }}>
                      {o.firstName} {o.lastName}
                    </div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888' }}>
                      {o.phone} · {o.isBannerBump ? '🚩 Banner Bump' : '🛍️ Store'}
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', fontSize: '0.95rem' }}>
                    ${o.total.toFixed(2)}
                  </div>

                  {/* Payment status */}
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: 20,
                    background: statusStyle.bg,
                    color: statusStyle.color,
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textAlign: 'center',
                  }}>
                    {PAYMENT_STATUS_LABELS[o.paymentStatus] ?? 'Unknown'}
                  </div>

                  {/* View neighbor */}
                  {o.neighborId ? (
                    <Link href={`/neighbor/${o.neighborId}`} target="_blank"
                      style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#1B2A4A', textDecoration: 'none', textAlign: 'center' }}>
                      View Neighbor →
                    </Link>
                  ) : (
                    <div />
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
