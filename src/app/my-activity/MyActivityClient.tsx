'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type Order, type BannerBump, ORDER_STATUS, BANNER_STATUS } from './page';

const BANNER_OPTION_LABEL: Record<number, string> = {
  121120000: 'Letter Only',
  121120001: 'Letter + Gift Certificate',
  121120002: 'Letter + Flag',
};

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#C5A028',
  marginBottom: 16,
};

interface Props {
  orders: Order[];
  bannerBumps: BannerBump[];
}

export default function MyActivityClient({ orders, bannerBumps }: Props) {
  const [orderFilter, setOrderFilter] = useState<number | null>(null);
  const [bannerFilter, setBannerFilter] = useState<number | null>(null);

  const filteredOrders = orderFilter === null
    ? orders
    : orders.filter(o => o.statusCode === orderFilter);

  const filteredBanners = bannerFilter === null
    ? bannerBumps
    : bannerBumps.filter(b => b.statusCode === bannerFilter);

  const uniqueOrderStatuses = Array.from(new Set(orders.map(o => o.statusCode)));
  const uniqueBannerStatuses = Array.from(new Set(bannerBumps.map(b => b.statusCode)));

  return (
    <div style={{ background: '#FAF7F2', minHeight: '80vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            margin: '0 0 8px',
          }}>
            My Activity
          </h1>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.95rem',
            color: '#666666',
            margin: 0,
          }}>
            Your Banner Bumps and store orders in one place.
          </p>
        </div>

        {/* Banner Bumps Section */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={sectionLabelStyle}>★ My Banner Bumps ({filteredBanners.length})</div>
            {uniqueBannerStatuses.length > 1 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setBannerFilter(null)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    border: '1.5px solid',
                    borderColor: bannerFilter === null ? '#1B2A4A' : '#CCCCCC',
                    background: bannerFilter === null ? '#1B2A4A' : '#FFFFFF',
                    color: bannerFilter === null ? '#FFFFFF' : '#666666',
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  All
                </button>
                {uniqueBannerStatuses.map(code => (
                  <button
                    key={code}
                    onClick={() => setBannerFilter(bannerFilter === code ? null : code)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      border: '1.5px solid',
                      borderColor: bannerFilter === code ? BANNER_STATUS[code]?.color ?? '#1B2A4A' : '#CCCCCC',
                      background: bannerFilter === code ? BANNER_STATUS[code]?.color ?? '#1B2A4A' : '#FFFFFF',
                      color: bannerFilter === code ? '#FFFFFF' : '#666666',
                      fontFamily: 'Trebuchet MS, sans-serif',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    {BANNER_STATUS[code]?.label ?? code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {bannerBumps.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#888888', margin: '0 0 16px' }}>
                You haven&apos;t sent any Banner Bumps yet.
              </p>
              <Link href="/submit-banner" style={{
                display: 'inline-block',
                background: '#B22234',
                color: '#FFFFFF',
                fontFamily: 'Georgia, serif',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '12px 28px',
                borderRadius: 4,
                textDecoration: 'none',
              }}>
                ★ Banner Bump a Patriot
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredBanners.map(banner => {
                const status = BANNER_STATUS[banner.statusCode];
                return (
                  <Link
                    key={banner.bannerId}
                    href={`/banner-bump?token=${banner.qrToken}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #EEEEEE',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                      transition: 'box-shadow 0.2s',
                      cursor: 'pointer',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,42,74,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#1B2A4A',
                          }}>
                            {banner.bannerNumber}
                          </span>
                          {status && (
                            <span style={{
                              background: status.color,
                              color: '#FFFFFF',
                              fontFamily: 'Trebuchet MS, sans-serif',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                              padding: '2px 8px',
                              borderRadius: 20,
                              textTransform: 'uppercase',
                            }}>
                              {status.label}
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#666666' }}>
                          {BANNER_OPTION_LABEL[banner.bannerOption] ?? 'Letter'} · {banner.recipientCity}, {banner.recipientState}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#AAAAAA' }}>
                          {formatDate(banner.date)}
                        </div>
                        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#C5A028', marginTop: 4 }}>
                          View →
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Store Orders Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={sectionLabelStyle}>★ My Store Orders ({filteredOrders.length})</div>
            {uniqueOrderStatuses.length > 1 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setOrderFilter(null)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    border: '1.5px solid',
                    borderColor: orderFilter === null ? '#1B2A4A' : '#CCCCCC',
                    background: orderFilter === null ? '#1B2A4A' : '#FFFFFF',
                    color: orderFilter === null ? '#FFFFFF' : '#666666',
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  All
                </button>
                {uniqueOrderStatuses.map(code => (
                  <button
                    key={code}
                    onClick={() => setOrderFilter(orderFilter === code ? null : code)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      border: '1.5px solid',
                      borderColor: orderFilter === code ? ORDER_STATUS[code]?.color ?? '#1B2A4A' : '#CCCCCC',
                      background: orderFilter === code ? ORDER_STATUS[code]?.color ?? '#1B2A4A' : '#FFFFFF',
                      color: orderFilter === code ? '#FFFFFF' : '#666666',
                      fontFamily: 'Trebuchet MS, sans-serif',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    {ORDER_STATUS[code]?.label ?? code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {orders.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#888888', margin: '0 0 16px' }}>
                You haven&apos;t placed any store orders yet.
              </p>
              <Link href="/store" style={{
                display: 'inline-block',
                background: '#1B2A4A',
                color: '#FFFFFF',
                fontFamily: 'Georgia, serif',
                fontSize: '0.9rem',
                fontWeight: 700,
                padding: '12px 28px',
                borderRadius: 4,
                textDecoration: 'none',
              }}>
                Shop the Store →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredOrders.map(order => {
                const status = ORDER_STATUS[order.statusCode];
                return (
                  <Link
                    key={order.orderId}
                    href={`/order-detail?id=${order.orderId}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #EEEEEE',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                      cursor: 'pointer',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,42,74,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#1B2A4A',
                          }}>
                            {order.orderNumber}
                          </span>
                          {status && (
                            <span style={{
                              background: status.color,
                              color: '#FFFFFF',
                              fontFamily: 'Trebuchet MS, sans-serif',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                              padding: '2px 8px',
                              borderRadius: 20,
                              textTransform: 'uppercase',
                            }}>
                              {status.label}
                            </span>
                          )}
                        </div>
                        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#666666' }}>
                          ${order.total.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#AAAAAA' }}>
                          {formatDate(order.date)}
                        </div>
                        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#C5A028', marginTop: 4 }}>
                          View →
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
