import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import Link from 'next/link';

interface DvOrder {
  bb_orderid: string;
  bb_ordernumber?: string;
  createdon?: string;
  bb_grandtotal?: number;
  bb_subtotal?: number;
  bb_shippingamount?: number;
  bb_discountamount?: number;
  statuscode?: number;
  bb_shippingaddressline1?: string;
  bb_shippingaddressline2?: string;
  bb_shippingcity?: string;
  bb_shippingstate?: string;
  bb_shippingzipcode?: string;
  bb_trackingnumber?: string;
}

interface DvOrderItem {
  bb_orderitemid: string;
  bb_quantity?: number;
  bb_unitprice?: number;
  bb_giftcertcode?: string;
  bb_Product?: {
    bb_productname?: string;
    bb_productnumber?: string;
    bb_producttype?: number;
  };
}

const ORDER_STATUS: Record<number, { label: string; color: string }> = {
  1:         { label: 'Pending',    color: '#C5A028' },
  121120001: { label: 'Processing', color: '#1B2A4A' },
  121120002: { label: 'Shipped',    color: '#0A7ABF' },
  2:         { label: 'Delivered',  color: '#1B7A3E' },
  121120003: { label: 'Returned',   color: '#B22234' },
  121120004: { label: 'Cancelled',  color: '#888888' },
};

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.85rem',
  letterSpacing: '1px',
  color: '#1B2A4A',
  marginBottom: 16,
};

export default async function OrderDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const session = await getSession();
  if (!session?.isLoggedIn) {
    redirect('/signin');
  }

  const neighborId = session.neighborId;

  // Verify the order belongs to this user
  let order: DvOrder | null = null;
  let orderItems: DvOrderItem[] = [];

  try {
    const [orderRes, itemsRes] = await Promise.all([
      dataverse.get<{ value: DvOrder[] }>(
        `bb_orders?$filter=bb_orderid eq '${id}'` +
        `&$select=bb_orderid,bb_ordernumber,createdon,bb_grandtotal,bb_subtotal,bb_shippingamount,bb_discountamount,statuscode,bb_shippingaddressline1,bb_shippingaddressline2,bb_shippingcity,bb_shippingstate,bb_shippingzipcode,bb_trackingnumber` +
        `&$top=1`
      ),
      dataverse.get<{ value: DvOrderItem[] }>(
        `bb_orderitems?$filter=_bb_order_value eq '${id}'` +
        `&$select=bb_orderitemid,bb_quantity,bb_unitprice,bb_giftcertcode` +
        `&$expand=bb_Product($select=bb_productname,bb_productnumber,bb_producttype)`
      ),
    ]);

    order = orderRes.value?.[0] ?? null;
    orderItems = itemsRes.value ?? [];

    if (!order) notFound();

    // Security check — verify order belongs to this neighbor
    const ownerCheck = await dataverse.get<{ value: { bb_orderid: string }[] }>(
      `bb_orders?$filter=bb_orderid eq '${id}' and _bb_neighbor_value eq '${neighborId}'&$select=bb_orderid&$top=1`
    );
    if (!ownerCheck.value?.[0]) notFound();

  } catch (err) {
    console.error('OrderDetail fetch failed:', err);
    notFound();
  }

  if (!order) notFound();

  const status = ORDER_STATUS[order.statuscode ?? 1];
  const hasPhysical = orderItems.some(i => i.bb_Product?.bb_producttype === 121120000 || i.bb_Product?.bb_producttype === 121120001 || i.bb_Product?.bb_producttype === 121120002 || i.bb_Product?.bb_producttype === 121120003);
  const gcItems = orderItems.filter(i => i.bb_giftcertcode);

  return (
    <div style={{ background: '#FAF7F2', minHeight: '80vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Back link */}
        <Link href="/my-activity" style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '0.85rem',
          color: '#1B2A4A',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 32,
        }}>
          ← Back to My Activity
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 700,
              color: '#1B2A4A',
              margin: '0 0 6px',
            }}>
              {order.bb_ordernumber}
            </h1>
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.85rem',
              color: '#888888',
              margin: 0,
            }}>
              Placed {formatDate(order.createdon ?? '')}
            </p>
          </div>
          {status && (
            <span style={{
              background: status.color,
              color: '#FFFFFF',
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '1px',
              padding: '6px 14px',
              borderRadius: 20,
              textTransform: 'uppercase',
            }}>
              {status.label}
            </span>
          )}
        </div>

        {/* Order Items */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 28, marginBottom: 20 }}>
          <div style={sectionLabelStyle}>★ Items</div>
          {orderItems.map(item => (
            <div key={item.bb_orderitemid} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '10px 0',
              borderBottom: '1px solid #F5F5F5',
              gap: 16,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.9rem',
                  color: '#333333',
                  marginBottom: 2,
                }}>
                  {item.bb_Product?.bb_productname} × {item.bb_quantity ?? 1}
                </div>
                {item.bb_Product?.bb_productnumber && (
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA', letterSpacing: '1px' }}>
                    {item.bb_Product?.bb_productnumber}
                  </div>
                )}
                {item.bb_giftcertcode && (
                  <div style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.82rem',
                    color: '#1B7A3E',
                    fontWeight: 700,
                    marginTop: 4,
                    letterSpacing: '1px',
                  }}>
                    Code: {item.bb_giftcertcode}
                  </div>
                )}
              </div>
              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#1B2A4A',
                flexShrink: 0,
              }}>
                ${((item.bb_unitprice ?? 0) * (item.bb_quantity ?? 1)).toFixed(2)}
              </div>
            </div>
          ))}

          {/* Totals */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {order.bb_subtotal != null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#666666' }}>
                <span>Subtotal</span><span>${order.bb_subtotal.toFixed(2)}</span>
              </div>
            )}
            {order.bb_shippingamount != null && order.bb_shippingamount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#666666' }}>
                <span>Shipping</span><span>${order.bb_shippingamount.toFixed(2)}</span>
              </div>
            )}
            {order.bb_discountamount != null && order.bb_discountamount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B7A3E' }}>
                <span>Gift Certificate</span><span>−${order.bb_discountamount.toFixed(2)}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#1B2A4A',
              borderTop: '1px solid #EEEEEE',
              paddingTop: 10,
              marginTop: 4,
            }}>
              <span>Total</span>
              <span>${(order.bb_grandtotal ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {hasPhysical && order.bb_shippingaddressline1 && (
          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 28, marginBottom: 20 }}>
            <div style={sectionLabelStyle}>★ Ships To</div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#444444', lineHeight: 1.7 }}>
              <div>{order.bb_shippingaddressline1}{order.bb_shippingaddressline2 ? `, ${order.bb_shippingaddressline2}` : ''}</div>
              <div>{order.bb_shippingcity}, {order.bb_shippingstate} {order.bb_shippingzipcode}</div>
            </div>
            {order.bb_trackingnumber && (
              <div style={{ marginTop: 12, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#555555' }}>
                <span style={{ color: '#AAAAAA', fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Tracking</span>
                <div style={{ fontWeight: 700, color: '#1B2A4A', marginTop: 2 }}>{order.bb_trackingnumber}</div>
              </div>
            )}
          </div>
        )}

        {/* GC reminder */}
        {gcItems.length > 0 && (
          <div style={{
            background: '#F0FBF4',
            border: '1px solid #1B7A3E',
            borderRadius: 8,
            padding: '16px 20px',
            marginBottom: 20,
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.88rem',
            color: '#1B7A3E',
            lineHeight: 1.6,
          }}>
            🎁 Gift certificate code{gcItems.length !== 1 ? 's' : ''} shown above. Use {gcItems.length !== 1 ? 'them' : 'it'} on your next Banner Bump or store purchase.
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/store" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#1B2A4A',
            color: '#FFFFFF',
            borderRadius: 4,
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}>
            Continue Shopping
          </Link>
          <Link href="/support" style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#FFFFFF',
            color: '#1B2A4A',
            borderRadius: 4,
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
            border: '1.5px solid #1B2A4A',
          }}>
            Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
}
