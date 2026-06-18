'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { APIProvider } from '@vis.gl/react-google-maps';
import StripePaymentElement from '@/components/StripePaymentElement';
import AddressAutocomplete from '@/components/AddressAutocomplete';

export interface NeighborData {
  neighborId: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
}

interface CartItem {
  productid: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  producttype: number;
}

interface AppliedGC {
  code: string;
  amount: number;
  orderItemId: string;
  remainingBalance: number;
}

interface CheckoutClientProps {
  userEmail: string | null;
  userFirstName: string;
  userLastName: string;
  neighbor: NeighborData | null;
  isPatriotsClub: boolean;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #DDDDDD',
  borderRadius: 4,
  fontFamily: 'Georgia, serif',
  fontSize: '0.95rem',
  color: '#2D2D2D',
  background: '#FFFFFF',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: '#888888',
  marginBottom: 6,
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif',
  fontSize: '0.72rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#C5A028',
  marginBottom: 16,
};

export default function CheckoutClient({ userEmail, userFirstName, userLastName, neighbor, isPatriotsClub }: CheckoutClientProps) {
  const router = useRouter();
  const stripeRef = useRef<{
    stripe: { confirmPayment: (opts: unknown) => Promise<{ error?: { message: string } }> };
    elements: unknown;
  } | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Contact
  const [firstName, setFirstName] = useState(neighbor?.firstName || userFirstName || '');
  const [lastName, setLastName] = useState(neighbor?.lastName || userLastName || '');
  const [email, setEmail] = useState(userEmail || '');
  const [phone, setPhone] = useState(neighbor?.phone || '');
  const [marketingOptin, setMarketingOptin] = useState(false);

  // Shipping
  const [address1, setAddress1] = useState(neighbor?.address1 || '');
  const [address2, setAddress2] = useState(neighbor?.address2 || '');
  const [city, setCity] = useState(neighbor?.city || '');
  const [state, setState] = useState(neighbor?.state || '');
  const [zipcode, setZipcode] = useState(neighbor?.zipcode || '');

  // GC
  const [gcInput, setGcInput] = useState('');
  const [appliedGCs, setAppliedGCs] = useState<AppliedGC[]>([]);
  const [gcTotal, setGcTotal] = useState(0);
  const [gcLoading, setGcLoading] = useState(false);
  const [gcError, setGcError] = useState('');

  // Terms + order state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [stripeReady, setStripeReady] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [mounted, setMounted] = useState(false);

  const hasPhysical = cart.some((i) => i.producttype !== 121120004);
  const hasGC = cart.some((i) => i.producttype === 121120004);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = hasPhysical ? 5.0 : 0;
  const amountDue = Math.max(0, subtotal + shipping - gcTotal);

  useEffect(() => { setMounted(true); }, []);

  // Load cart
  useEffect(() => {
    const raw = sessionStorage.getItem('bb_cart');
    if (!raw) { router.replace('/store'); return; }
    try {
      const c: CartItem[] = JSON.parse(raw);
      if (!c.length) { router.replace('/store'); return; }
      setCart(c);
    } catch {
      router.replace('/store');
    }

    // Restore applied GCs
    const savedGCs = sessionStorage.getItem('bb_applied_gcs');
    const savedGCTotal = sessionStorage.getItem('bb_gc_total');
    if (savedGCs) {
      try {
        const gcs: AppliedGC[] = JSON.parse(savedGCs);
        setAppliedGCs(gcs);
        setGcTotal(parseFloat(savedGCTotal ?? '0') || 0);
      } catch {}
    }

    setReady(true);
  }, [router]);

  // Fetch payment intent when cart is ready and payment is needed
  useEffect(() => {
    if (!ready || amountDue === 0 || clientSecret) return;

    fetch('/api/flows/stripe-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(amountDue * 100),
        currency: 'usd',
        customerEmail: email,
        shipAddress1: address1,
        shipCity: city,
        shipState: state,
        shipZip: zipcode,
        description: 'BannerBeauty Store Order',
      }),
    })
      .then((r) => r.json())
      .then((data) => setClientSecret(data.clientSecret as string))
      .catch((err) => {
        console.error('Stripe PI error:', err);
        setOrderError('Unable to load payment form. Please try again.');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, amountDue]);

  function formatPhone(val: string) {
    const digits = val.replace(/\D/g, '').substring(0, 10);
    if (digits.length >= 7) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    if (digits.length >= 4) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length > 0) return `(${digits}`;
    return '';
  }

  async function applyGC() {
    const code = gcInput.trim().toUpperCase();
    if (!code) return;
    if (appliedGCs.find((g) => g.code === code)) {
      setGcError('This gift certificate has already been applied.');
      return;
    }
    if (gcTotal >= subtotal + shipping) {
      setGcError('Your order is already fully covered by gift certificates.');
      return;
    }
    setGcLoading(true);
    setGcError('');
    try {
      const res = await fetch('/api/flows/validate-gc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gcCode: code, orderId: '' }),
      });
      const data = await res.json();
      if (data.valid) {
        const amountNeeded = subtotal + shipping - gcTotal;
        const amountApplied = Math.min(data.gcAmount, amountNeeded);
        const gc: AppliedGC = { code, amount: amountApplied, orderItemId: data.orderItemId, remainingBalance: data.gcAmount - amountApplied };
        const newGCs = [...appliedGCs, gc];
        const newTotal = gcTotal + amountApplied;
        setAppliedGCs(newGCs);
        setGcTotal(newTotal);
        setGcInput('');
        sessionStorage.setItem('bb_applied_gcs', JSON.stringify(newGCs));
        sessionStorage.setItem('bb_gc_total', String(newTotal));
      } else {
        setGcError(data.reason || 'Invalid gift certificate code.');
      }
    } catch {
      setGcError('Unable to validate gift certificate. Please try again.');
    } finally {
      setGcLoading(false);
    }
  }

  function removeGC(code: string) {
    const gc = appliedGCs.find((g) => g.code === code);
    if (!gc) return;
    const newGCs = appliedGCs.filter((g) => g.code !== code);
    const newTotal = gcTotal - gc.amount;
    setAppliedGCs(newGCs);
    setGcTotal(newTotal);
    sessionStorage.setItem('bb_applied_gcs', JSON.stringify(newGCs));
    sessionStorage.setItem('bb_gc_total', String(newTotal));
  }

  function saveOrderToSession() {
    const existingOrderData = {
      firstName, lastName, email, phone,
      address1: hasPhysical ? address1 : '',
      address2: hasPhysical ? address2 : '',
      city: hasPhysical ? city : '',
      state: hasPhysical ? state : '',
      zipcode: hasPhysical ? zipcode : '',
      cart,
      subtotal,
      shipping,
      total: amountDue,
      gcTotal,
      appliedGCs,
      marketingOptin,
      hasGC,
      hasPhysical,
    };
    const pointsAwarded = Math.round(amountDue * (isPatriotsClub ? 1.25 : 1));
    sessionStorage.setItem('bb_store_order', JSON.stringify({
      ...existingOrderData,
      pointsAwarded,
    }));
    sessionStorage.setItem('bb_applied_gcs', JSON.stringify(appliedGCs));
    sessionStorage.setItem('bb_gc_total', String(gcTotal));
  }

  async function placeOrder() {
    if (!email.trim()) { setOrderError('Email is required.'); return; }
    if (!termsAccepted) { setOrderError('Please accept the terms to continue.'); return; }
    if (hasPhysical && (!address1.trim() || !city.trim() || !state.trim() || !zipcode.trim())) {
      setOrderError('Please fill in all shipping fields.');
      return;
    }
    setOrderError('');

    if (amountDue === 0) {
      saveOrderToSession();
      router.push('/store-confirmation?status=success');
      return;
    }

    if (!stripeRef.current) { setOrderError('Payment form not ready. Please wait.'); return; }
    setPlacing(true);

    saveOrderToSession();

    const { stripe, elements } = stripeRef.current;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/store-confirmation?status=success`,
        payment_method_data: { billing_details: { name: `${firstName} ${lastName}`, email } },
      },
    });

    if (error) {
      setOrderError(error.message ?? 'Payment failed. Please try again.');
      setPlacing(false);
    }
  }

  if (!mounted) return null;
  if (!ready) return null;

  try { return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
    <div style={{ background: '#FAF7F2', minHeight: '80vh', padding: '40px 24px 80px' }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: 40,
        alignItems: 'start',
      }}
      className="bb-checkout-grid"
      >
        {/* LEFT: Form */}
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: 700, color: '#1B2A4A', margin: '0 0 32px 0' }}>
            Checkout
          </h1>

          {/* Contact */}
          <div style={{ background: '#FFFFFF', borderRadius: 8, padding: 28, marginBottom: 20, border: '1px solid #EEEEEE' }}>
            <div style={sectionTitleStyle}>★ Contact Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email Address *</label>
              <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Mobile Phone</label>
              <input
                style={inputStyle}
                type="tel"
                value={phone}
                placeholder="(805) 555-1234"
                onChange={(e) => setPhone(formatPhone(e.target.value))}
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={marketingOptin} onChange={(e) => setMarketingOptin(e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#555555', lineHeight: 1.5 }}>
                ✓ Send me Banner Bump stories, patriotic inspiration, and exclusive offers — I&apos;m in! 🇺🇸
              </span>
            </label>
          </div>

          {/* Shipping */}
          {hasPhysical && (
            <div style={{ background: '#FFFFFF', borderRadius: 8, padding: 28, marginBottom: 20, border: '1px solid #EEEEEE' }}>
              <div style={sectionTitleStyle}>★ Shipping Address</div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Address Line 1 *</label>
                <AddressAutocomplete
                  placeholder="Start typing the address..."
                  defaultValue={address1}
                  onAddressSelect={(addr) => {
                    setAddress1(addr.address1);
                    setCity(addr.city);
                    setState(addr.state);
                    setZipcode(addr.zipcode);
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Address Line 2</label>
                <input style={inputStyle} value={address2} placeholder="Apt, Suite, Unit (optional)" onChange={(e) => setAddress2(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input style={inputStyle} value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>State *</label>
                  <input style={inputStyle} value={state} placeholder="CA" maxLength={2} onChange={(e) => setState(e.target.value.toUpperCase())} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>ZIP Code *</label>
                <input style={inputStyle} value={zipcode} placeholder="93446" maxLength={10} onChange={(e) => setZipcode(e.target.value)} />
              </div>
            </div>
          )}

          {/* Gift Certificate */}
          <div style={{ background: '#FFFFFF', borderRadius: 8, padding: 28, marginBottom: 20, border: '1px solid #EEEEEE' }}>
            <div style={sectionTitleStyle}>★ Gift Certificate</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                style={{ ...inputStyle, flex: 1, textTransform: 'uppercase', letterSpacing: '1px' }}
                value={gcInput}
                placeholder="GC-XXXXXXXX"
                onChange={(e) => setGcInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && applyGC()}
              />
              <button
                onClick={applyGC}
                disabled={gcLoading}
                style={{
                  padding: '10px 18px',
                  background: '#1B2A4A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 4,
                  fontFamily: 'Georgia, serif',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: gcLoading ? 'not-allowed' : 'pointer',
                  opacity: gcLoading ? 0.6 : 1,
                  flexShrink: 0,
                }}
              >
                {gcLoading ? '…' : 'Apply'}
              </button>
            </div>
            {gcError && <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', margin: '4px 0 0' }}>{gcError}</p>}
            {appliedGCs.map((gc) => (
              <div key={gc.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '0.82rem', fontFamily: 'Trebuchet MS, sans-serif' }}>
                <span style={{ color: '#1B2A4A', fontWeight: 700 }}>
                  {gc.code} <span style={{ color: '#B22234' }}>−${gc.amount.toFixed(2)}</span>
                  {gc.remainingBalance > 0 && <span style={{ color: '#888888' }}> (${gc.remainingBalance.toFixed(2)} remaining)</span>}
                </span>
                <button onClick={() => removeGC(gc.code)} style={{ background: 'none', border: 'none', color: '#AAAAAA', cursor: 'pointer', fontSize: '1rem' }}>×</button>
              </div>
            ))}
          </div>

          {/* Payment */}
          {amountDue > 0 && mounted && (
            <div style={{ background: '#FFFFFF', borderRadius: 8, padding: 28, marginBottom: 20, border: '1px solid #EEEEEE' }}>
              <div style={sectionTitleStyle}>★ Payment</div>
              {!stripeReady && (
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#888888' }}>Loading payment form…</p>
              )}
              {clientSecret && (
                <StripePaymentElement
                  clientSecret={clientSecret}
                  onReady={() => setStripeReady(true)}
                  onInit={(stripe, elements) => { stripeRef.current = { stripe, elements }; }}
                />
              )}
            </div>
          )}

          {mounted && amountDue === 0 && gcTotal > 0 && (
            <div style={{ background: '#E8F5E9', border: '1px solid #1B7A3E', borderRadius: 8, padding: 20, marginBottom: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#1B7A3E', fontWeight: 700 }}>
              ✓ Your order is fully covered by gift certificate(s) — no payment needed!
            </div>
          )}

          {/* Terms */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#666666', lineHeight: 1.5 }}>
              I agree to the <a href="/terms-of-service" style={{ color: '#1B2A4A' }}>Terms of Service</a> and <a href="/privacy-policy" style={{ color: '#1B2A4A' }}>Privacy Policy</a>.
            </span>
          </label>

          {orderError && (
            <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', marginBottom: 12 }}>{orderError}</p>
          )}

          <button
            onClick={placeOrder}
            disabled={placing}
            style={{
              width: '100%',
              padding: '18px',
              background: placing ? '#AAAAAA' : '#B22234',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              fontFamily: 'Georgia, serif',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: placing ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {placing ? 'Processing…' : amountDue === 0 ? 'Place Order (No Charge)' : `Place Order — $${amountDue.toFixed(2)}`}
          </button>
        </div>

        {/* RIGHT: Order summary */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 8, padding: 24, border: '1px solid #EEEEEE' }}>
            <div style={sectionTitleStyle}>★ Order Summary</div>

            {cart.map((item) => (
              <div key={item.productid} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem' }}>
                <span style={{ color: '#444444' }}>{item.name} × {item.qty}</span>
                <span style={{ fontWeight: 700, color: '#1B2A4A' }}>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#666666' }}>
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              {hasPhysical && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#666666' }}>
                  <span>Shipping</span><span>${shipping.toFixed(2)}</span>
                </div>
              )}
              {gcTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B7A3E' }}>
                  <span>Gift Certificate</span><span>−${gcTotal.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', borderTop: '1px solid #EEEEEE', paddingTop: 10, marginTop: 4 }}>
                <span>Total</span><span>${amountDue.toFixed(2)} + tax</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .bb-checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
    </APIProvider>
  ); } catch (err) {
    console.error('CheckoutClient render error:', err);
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', fontFamily: 'Trebuchet MS, sans-serif', color: '#B22234' }}>
        Something went wrong loading checkout. Please{' '}
        <a href="/store" style={{ color: '#1B2A4A' }}>return to the store</a>.
      </div>
    );
  }
}
