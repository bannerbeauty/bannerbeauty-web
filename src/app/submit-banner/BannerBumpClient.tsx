'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { APIProvider } from '@vis.gl/react-google-maps';
import StripePaymentElement from '@/components/StripePaymentElement';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import type { ActiveBlitz } from './page';

// ── Exported types (consumed by page.tsx) ────────────────────────────────────

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
  bumpBalance: number;
}

export interface LetterTemplate {
  id: string;
  name: string;
  previewText: string;
  bodyHtml: string;
}

export interface FlagProduct {
  productid: string;
  name: string;
  price: number;
  productnumber: string;
}

export interface GcProduct {
  productid: string;
  name: string;
  price: number;
  productnumber: string;
}

interface AppliedGC {
  code: string;
  amount: number;
  orderItemId: string;
  remainingBalance: number;
}

interface BannerBumpClientProps {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  neighbor: NeighborData | null;
  letterTemplates: LetterTemplate[];
  flagProducts: FlagProduct[];
  gcProducts: GcProduct[];
  letterPrice: number;
  activeBlitzes: ActiveBlitz[];
  patriotsClubBalance: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STEP_NAMES = ['You', 'Recipient', 'Recognition', 'Banner Option', 'Sharing', 'Letter', 'Review & Pay'];
const TOTAL_STEPS = 7;

const BANNER_OPTIONS = [
  { value: '121120000', label: 'Letter Only',              icon: '✉️',  description: 'Send a heartfelt patriotic letter to your neighbor.' },
  { value: '121120001', label: 'Letter + Gift Certificate', icon: '🎁',  description: 'A letter plus a gift certificate so they can pick their own flag.' },
  { value: '121120002', label: 'Letter + Flag',            icon: '',  description: 'A brand new flag delivered straight to their door, with a letter.' },
];

const ATTRIBUTION_TYPES = [
  { value: 'in_memoriam', label: 'In Memoriam',   icon: '🕊️', description: 'Honor the memory of a fallen patriot.' },
  { value: 'in_honor',    label: 'In Honor Of',   icon: '⭐',  description: 'Dedicate this Banner Bump to someone special.' },
  { value: 'from_me',     label: 'From Me',       icon: '🙋',  description: 'Your name will appear on the letter.' },
  { value: 'anonymous',   label: 'Anonymous',     icon: '🤫',  description: 'Your identity stays completely private.' },
];

const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DC', label: 'D.C.' },
  { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' }, { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' }, { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' }, { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' }, { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' }, { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #DDDDDD',
  borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.95rem',
  color: '#2D2D2D', background: '#FFFFFF', boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: 'auto' as React.CSSProperties['appearance'],
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem',
  textTransform: 'uppercase', letterSpacing: '1px', color: '#888888', marginBottom: 6,
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px',
  textTransform: 'uppercase', color: '#C5A028', marginBottom: 16,
};

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 8, padding: 28, marginBottom: 20, border: '1px solid #EEEEEE',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function NavButtons({
  onBack, onNext, nextLabel = 'Continue →', nextDisabled = false, loading = false, showBack = true,
}: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string;
  nextDisabled?: boolean; loading?: boolean; showBack?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
      {showBack && onBack && (
        <button onClick={onBack} style={{ padding: '12px 24px', background: 'none', border: '1.5px solid #DDDDDD', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#666666', cursor: 'pointer' }}>
          ← Back
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled || loading}
          style={{ flex: 1, padding: '14px 24px', background: nextDisabled || loading ? '#AAAAAA' : '#B22234', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1rem', cursor: nextDisabled || loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
        >
          {loading ? 'Please wait…' : nextLabel}
        </button>
      )}
    </div>
  );
}

function ToggleCard({
  label, description, checked, onChange, disabled, disabledReason,
}: {
  label: string; description: string; checked: boolean;
  onChange: (v: boolean) => void; disabled?: boolean; disabledReason?: string;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: '100%', textAlign: 'left', padding: '14px 18px',
        border: checked && !disabled ? '2px solid #1B2A4A' : '2px solid #EEEEEE',
        borderRadius: 6, background: checked && !disabled ? '#F0F3F8' : '#FAFAFA',
        cursor: disabled ? 'default' : 'pointer', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', gap: 16,
        opacity: disabled ? 0.5 : 1,
      }}
      disabled={disabled}
    >
      <div>
        <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', fontSize: '0.92rem', marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: disabled ? '#AAAAAA' : '#666666' }}>
          {disabled && disabledReason ? disabledReason : description}
        </div>
      </div>
      <div style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
        background: checked && !disabled ? '#1B2A4A' : '#DDDDDD',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: checked && !disabled ? 22 : 2,
          width: 20, height: 20, borderRadius: '50%', background: '#FFFFFF',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BannerBumpClient({
  userEmail, userFirstName, userLastName, neighbor, letterTemplates, flagProducts, gcProducts, letterPrice, activeBlitzes, patriotsClubBalance,
}: BannerBumpClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripeRef = useRef<{
    stripe: { confirmPayment: (opts: unknown) => Promise<{ error?: { message: string } }> };
    elements: unknown;
  } | null>(null);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState('');
  const [orderError, setOrderError] = useState('');

  // Step 1: Your Info
  const [inFirstName, setInFirstName] = useState(neighbor?.firstName || userFirstName || '');
  const [inLastName, setInLastName]   = useState(neighbor?.lastName  || userLastName  || '');
  const [inEmail, setInEmail]         = useState(userEmail || '');

  // Step 2: Recipient
  const [recipientFirstName, setRecipientFirstName] = useState('');
  const [recipientLastName,  setRecipientLastName]  = useState('');
  const [recipientAddress1,  setRecipientAddress1]  = useState('');
  const [recipientAddress2,  setRecipientAddress2]  = useState('');
  const [recipientCity,      setRecipientCity]      = useState('');
  const [recipientState,     setRecipientState]     = useState('');
  const [recipientZipcode,   setRecipientZipcode]   = useState('');
  const [recipientLat,       setRecipientLat]       = useState(0);
  const [recipientLng,       setRecipientLng]       = useState(0);

  // Step 3: Recognition / Attribution
  const [attribution,     setAttribution]     = useState<'from_me' | 'in_honor' | 'in_memoriam' | 'anonymous'>('in_memoriam');
  const [attributionName, setAttributionName] = useState('');
  const [attributionText, setAttributionText] = useState('');

  // Step 4: Banner Option + Flag + GC product
  const [bannerOption,    setBannerOption]    = useState(searchParams.get('option') ?? '');
  const [selectedFlagId,  setSelectedFlagId]  = useState('');
  const [gcProductId,     setGcProductId]     = useState('');
  const [gcAmount,        setGcAmount]        = useState(0);

  // Step 5: Sharing Preferences
  const [shareName,    setShareName]    = useState(true);
  const [sharePhone,   setSharePhone]   = useState(false);
  const [shareEmail,   setShareEmail]   = useState(false);
  const [shareAddress, setShareAddress] = useState(false);

  // Step 6: Letter + P.S.
  const [selectedTemplateId,  setSelectedTemplateId]  = useState('');
  const [personalNote,        setPersonalNote]        = useState('');
  const [isPublicNoteIn,      setIsPublicNoteIn]      = useState(false);

  // Blitz association
  const [selectedBlitzId,       setSelectedBlitzId]       = useState('');
  const [selectedBlitzBrigadeId, setSelectedBlitzBrigadeId] = useState('');

  // Step 7: GC + Payment
  const [gcInput,      setGcInput]      = useState('');
  const [appliedGCs,   setAppliedGCs]   = useState<AppliedGC[]>([]);
  const [gcTotal,      setGcTotal]      = useState(0);
  const [gcLoading,    setGcLoading]    = useState(false);
  const [gcError,      setGcError]      = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [stripeReady,  setStripeReady]  = useState(false);
  const [placing,      setPlacing]      = useState(false);

  // Patriot's Club
  const [usePatriotsClub, setUsePatriotsClub] = useState(false);

  // ── Computed ────────────────────────────────────────────────────────────────
  const includesFlag = bannerOption === '121120002';
  const includesGC   = bannerOption === '121120001';
  const selectedFlag = flagProducts.find((p) => p.productid === selectedFlagId);
  const flagPrice    = selectedFlag?.price ?? 0;
  const subtotal     = letterPrice + (includesFlag ? flagPrice : 0) + (includesGC ? gcAmount : 0);
  const cheapestFlag = flagProducts.length > 0 ? Math.min(...flagProducts.map(p => p.price)) : 0;
  const cheapestGC   = gcProducts.length > 0   ? Math.min(...gcProducts.map(p => p.price))   : 0;
  const shipping     = includesFlag ? 5.0 : 0;
  const amountDue = (usePatriotsClub && patriotsClubBalance > 0) ? 0 : Math.max(0, subtotal + shipping - gcTotal);

  const hasPhone   = Boolean(neighbor?.phone);
  const hasAddress = Boolean(neighbor?.address1);
  const isAnon     = attribution === 'anonymous';

  const selectedTemplate = letterTemplates.find((t) => t.id === selectedTemplateId);
  const bannerOptionLabel = BANNER_OPTIONS.find((o) => o.value === bannerOption)?.label ?? '';

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  // Auto-enable Patriot's Club on mount if they have balance — only once, respects user changes after
  const patriotsClubInitialized = useRef(false);
  useEffect(() => {
    if (!patriotsClubInitialized.current && patriotsClubBalance > 0) {
      setUsePatriotsClub(true);
      patriotsClubInitialized.current = true;
    }
  }, [patriotsClubBalance]);

  // Force Letter + Flag option and specific flag when using Patriot's Club
  useEffect(() => {
    if (usePatriotsClub && patriotsClubBalance > 0) {
      setBannerOption('121120002');
      setSelectedFlagId('4a439c41-ce62-f111-a826-00224805c083');
    }
  }, [usePatriotsClub, patriotsClubBalance]);

  // When attribution flips to anonymous, clear sharing
  useEffect(() => {
    if (isAnon) {
      setShareName(false); setSharePhone(false);
      setShareEmail(false); setShareAddress(false);
    } else {
      setShareName(true);
    }
  }, [isAnon]);

  // Fetch Stripe PI when reaching step 7 with amountDue > 0
  useEffect(() => {
    if (step !== 7 || amountDue === 0 || clientSecret) return;
    const piBody = {
      amount: Math.round(amountDue * 100),
      currency: 'usd',
      customerEmail: inEmail || '',
      shipAddress1: recipientAddress1 || '',
      shipCity: recipientCity || '',
      shipState: recipientState || '',
      shipZip: recipientZipcode || '',
      description: 'Banner Bump Order',
    };
    fetch('/api/flows/stripe-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(piBody),
    })
      .then((r) => r.json())
      .then((data) => {
        const secret = data.clientSecret as string;
        if (!secret) { setOrderError('Unable to load payment form. Please try again.'); return; }
        setClientSecret(secret);
      })
      .catch((err) => { console.error('[BannerBump] Stripe PI fetch error:', err); setOrderError('Unable to load payment form. Please try again.'); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, amountDue]);

  // ── Validation ───────────────────────────────────────────────────────────────
  function validateStep(): boolean {
    setStepError('');
    if (step === 1) {
      if (!inFirstName.trim() || !inEmail.trim()) { setStepError('Your name and email are required.'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inEmail)) { setStepError('Please enter a valid email address.'); return false; }
      const selectedBlitz = activeBlitzes.find(b => b.blitzId === selectedBlitzId);
      const needsBrigadeSelection = selectedBlitz && selectedBlitz.brigades.length > 1;
      if (selectedBlitzId && needsBrigadeSelection && !selectedBlitzBrigadeId) {
        setStepError('Please select which Brigade you are representing.');
        return false;
      }
    }
    if (step === 2) {
      if (!recipientAddress1.trim() || !recipientCity.trim() || !recipientState || !recipientZipcode.trim()) {
        setStepError('Complete recipient address is required.'); return false;
      }
    }
    if (step === 3) {
      if ((attribution === 'in_honor' || attribution === 'in_memoriam') && !attributionName.trim()) {
        setStepError('Please enter the name you are honoring.'); return false;
      }
    }
    if (step === 4) {
      if (!bannerOption) { setStepError('Please select a banner option.'); return false; }
      if (includesFlag && !selectedFlagId) { setStepError('Please select a flag product.'); return false; }
      if (includesGC && !gcProductId) { setStepError('Please select a gift certificate amount.'); return false; }
    }
    if (step === 6) {
      if (!selectedTemplateId) { setStepError('Please select a letter template.'); return false; }
    }
    if (step === 7) {
      if (!termsAccepted) { setStepError('Please accept the terms to continue.'); return false; }
    }
    return true;
  }

  function handleNext() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.style.fontSize = '';
    if (validateStep()) { setStepError(''); setStep((s) => s + 1); }
  }
  function handleBack() { setStepError(''); setOrderError(''); setStep((s) => s - 1); }

  // ── GC handlers ─────────────────────────────────────────────────────────────
  async function applyGC() {
    const code = gcInput.trim().toUpperCase();
    if (!code) return;
    if (appliedGCs.find((g) => g.code === code)) { setGcError('This gift certificate has already been applied.'); return; }
    if (gcTotal >= subtotal + shipping) { setGcError('Your order is already fully covered.'); return; }
    setGcLoading(true); setGcError('');
    try {
      const res  = await fetch('/api/flows/validate-gc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gcCode: code, orderId: '' }) });
      const data = await res.json();
      if (data.valid) {
        const amountNeeded   = subtotal + shipping - gcTotal;
        const amountApplied  = Math.min(data.gcAmount, amountNeeded);
        const gc: AppliedGC  = { code, amount: amountApplied, orderItemId: data.orderItemId, remainingBalance: data.gcAmount - amountApplied };
        setAppliedGCs((prev) => [...prev, gc]);
        setGcTotal((prev) => prev + amountApplied);
        setGcInput('');
      } else { setGcError(data.reason || 'Invalid gift certificate code.'); }
    } catch { setGcError('Unable to validate gift certificate. Please try again.'); }
    finally { setGcLoading(false); }
  }

  function removeGC(code: string) {
    const gc = appliedGCs.find((g) => g.code === code);
    if (!gc) return;
    setAppliedGCs((prev) => prev.filter((g) => g.code !== code));
    setGcTotal((prev) => prev - gc.amount);
  }

  // ── Submission ───────────────────────────────────────────────────────────────
  async function submitBannerBump() {
    if (!validateStep()) return;
    if (amountDue > 0 && !stripeRef.current) { setOrderError('Payment form not ready. Please wait.'); return; }
    setPlacing(true); setOrderError('');

    let orderData: { orderId?: string; qrToken?: string; bannerId?: string } = {};
    try {
      const res = await fetch('/api/flows/create-banner-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerOption: parseInt(bannerOption),
          attributionType: attribution === 'from_me' ? 121120000 : attribution === 'in_memoriam' ? 121120001 : attribution === 'in_honor' ? 121120002 : 121120003,
          attributionName: attributionName,
          attributionText: attributionText,
          inNeighborId: neighbor?.neighborId || '',
          rnFirstName: recipientFirstName,
          rnLastName: recipientLastName,
          shipAddress1: recipientAddress1,
          shipAddress2: recipientAddress2,
          shipCity: recipientCity,
          shipState: recipientState,
          shipZip: recipientZipcode,
          letterTemplateId: selectedTemplateId,
          customNote: !isAnon ? personalNote : '',
          isPublicNoteIn: !isAnon ? isPublicNoteIn : false,
          shareName,
          sharePhone,
          shareEmail,
          shareAddress,
          gcAmount: gcAmount || 0,
          selectedProductSku: selectedFlag?.productnumber ?? '',
          stripeClientSecret: clientSecret || '',
          subtotal,
          shippingAmount: shipping,
          grandTotal: amountDue,
          gcTotal,
          appliedGCs,
          recipientLat,
          recipientLng,
          blitzId: selectedBlitzId,
          brigadeId: selectedBlitzBrigadeId,
          usePatriotsClub: usePatriotsClub && patriotsClubBalance > 0,
        }),
      });
      orderData = await res.json();
    } catch (err) {
      console.error('[BannerBump] create-banner-order error:', err);
      setOrderError('Order creation failed: ' + String(err));
      setPlacing(false);
      return; // Stop here — don't proceed to Stripe
    }

    const bannerOrder = {
      inFirstName, inEmail,
      recipientData: { firstName: recipientFirstName, lastName: recipientLastName, address1: recipientAddress1, address2: recipientAddress2, city: recipientCity, state: recipientState, zipcode: recipientZipcode },
      bannerOptionName: bannerOptionLabel,
      letterTemplateName: selectedTemplate?.name ?? '',
      subtotal, total: amountDue,
      qrToken: orderData.qrToken ?? '',
      orderId: orderData.orderId ?? '',
      blitzId: selectedBlitzId,
      brigadeId: selectedBlitzBrigadeId,
    };

    try {
      sessionStorage.setItem('bb_banner_order', JSON.stringify(bannerOrder));
      if (orderData.bannerId) sessionStorage.setItem('bb_bannerId', orderData.bannerId);
    } catch {}

    if (amountDue === 0) { router.push('/banner-bump-confirmation?redirect_status=succeeded'); return; }

    // Update Payment Intent metadata with orderId
    if (orderData.orderId && clientSecret) {
      const piId = clientSecret.split('_secret_')[0];
      await fetch('/api/stripe/update-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: piId,
          orderId: orderData.orderId,
        }),
      }).catch(err => console.error('PI metadata update failed:', err));
    }

    const { stripe, elements } = stripeRef.current!;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/banner-bump-confirmation`,
        payment_method_data: { billing_details: { name: `${inFirstName} ${inLastName}`, email: inEmail } },
      },
    });
    if (error) { setOrderError(error.message ?? 'Payment failed. Please try again.'); setPlacing(false); }
  }

  if (!mounted) return null;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
    <div style={{ background: '#FAF7F2', minHeight: '80vh', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700, color: '#1B2A4A', margin: '0 0 6px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Banner Bump a Patriot
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://bannerbeautystorage.blob.core.windows.net/images/banner-bump.png" alt="" style={{ height: '1.2em', width: 'auto', display: 'inline', verticalAlign: 'middle' }} />
          </span>
        </h1>
        <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#888888', margin: '0 0 24px' }}>
          Step {step} of {TOTAL_STEPS} — {STEP_NAMES[step - 1]}
        </p>

        {/* Progress bar */}
        <div style={{ height: 4, background: '#EEEEEE', borderRadius: 2, marginBottom: 32 }}>
          <div style={{ height: '100%', background: '#B22234', borderRadius: 2, width: `${(step / TOTAL_STEPS) * 100}%`, transition: 'width 0.3s ease' }} />
        </div>

        {/* ── Step 1: You ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>★ Your Information</div>
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#555555', lineHeight: 1.6, marginBottom: 20 }}>
              Confirm your name and email. We&apos;ll send you an email confirmation of your banner bump.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>First Name *</label>
                <input style={{ ...inputStyle, fontSize: '16px' }} value={inFirstName} onChange={(e) => setInFirstName(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input style={{ ...inputStyle, fontSize: '16px' }} value={inLastName} onChange={(e) => setInLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input style={{ ...inputStyle, fontSize: '16px' }} type="email" value={inEmail} onChange={(e) => setInEmail(e.target.value)} />
            </div>
            {activeBlitzes.length > 0 && (() => {
              const selectedBlitz = activeBlitzes.find(b => b.blitzId === selectedBlitzId);
              const needsBrigadeSelection = selectedBlitz && selectedBlitz.brigades.length > 1;
              return (
                <div style={{ marginTop: 20 }}>
                  <label style={labelStyle}>Are you Banner Bumping as part of a group activity? (optional)</label>
                  <select
                    value={selectedBlitzId}
                    onChange={e => {
                      const blitzId = e.target.value;
                      setSelectedBlitzId(blitzId);
                      const blitz = activeBlitzes.find(b => b.blitzId === blitzId);
                      if (blitz?.brigades.length === 1) {
                        setSelectedBlitzBrigadeId(blitz.brigades[0].brigadeId);
                      } else {
                        setSelectedBlitzBrigadeId('');
                      }
                    }}
                    style={{ ...inputStyle, fontSize: '16px', marginTop: 6 }}
                  >
                    <option value="">No — this is a personal Banner Bump</option>
                    {activeBlitzes.map(blitz => (
                      <option key={blitz.blitzId} value={blitz.blitzId}>
                        {blitz.blitzName}{blitz.brigades.length === 1 ? ` — ${blitz.brigades[0].brigadeName}` : ' — Multiple Brigades'}
                      </option>
                    ))}
                  </select>
                  {needsBrigadeSelection && (
                    <div style={{ marginTop: 12 }}>
                      <label style={labelStyle}>Which Brigade are you representing? *</label>
                      <select
                        value={selectedBlitzBrigadeId}
                        onChange={e => setSelectedBlitzBrigadeId(e.target.value)}
                        style={{ ...inputStyle, fontSize: '16px', marginTop: 6 }}
                      >
                        <option value="">Select a Brigade...</option>
                        {selectedBlitz.brigades.map(b => (
                          <option key={b.brigadeId} value={b.brigadeId}>{b.brigadeName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {selectedBlitzId && (
                    <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#1B7A3E', marginTop: 6 }}>
                      ⚡ This bump will count toward {selectedBlitz?.blitzName}!
                    </p>
                  )}
                </div>
              );
            })()}
            {patriotsClubBalance > 0 && (
              <div style={{ marginTop: 20, padding: '14px 18px', background: '#FFFBEE', border: '1.5px solid #C5A028', borderRadius: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={usePatriotsClub}
                    onChange={(e) => setUsePatriotsClub(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#C5A028', flexShrink: 0 }}
                  />
                  <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#555555', lineHeight: 1.5 }}>
                    <span style={{ color: '#C5A028', fontWeight: 700 }}>★ Use a Patriot&apos;s Club Bump</span>
                    {' '}— use 1 of your {patriotsClubBalance} remaining bump{patriotsClubBalance !== 1 ? 's' : ''} (Letter + Flag, no charge)
                  </span>
                </label>
              </div>
            )}
            {stepError && <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', marginTop: 12 }}>{stepError}</p>}
            <NavButtons showBack={false} onNext={handleNext} nextLabel="Next: Recipient Info →" />
          </div>
        )}

        {/* ── Step 2: Recipient ────────────────────────────────────────────── */}
        {step === 2 && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>★ Your Patriotic Neighbor</div>
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#555555', lineHeight: 1.6, marginBottom: 20 }}>
              Don&apos;t worry if you don&apos;t know your neighbor&apos;s name — their address is all we need.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input style={{ ...inputStyle, fontSize: '16px' }} value={recipientFirstName} onChange={(e) => setRecipientFirstName(e.target.value)} placeholder="Jane" />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input style={{ ...inputStyle, fontSize: '16px' }} value={recipientLastName} onChange={(e) => setRecipientLastName(e.target.value)} placeholder="Smith" />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Address Line 1 *</label>
              <AddressAutocomplete
                placeholder="Start typing the address..."
                defaultValue={recipientAddress1}
                onAddressSelect={(addr) => {
                  setRecipientAddress1(addr.address1);
                  setRecipientCity(addr.city);
                  setRecipientState(addr.state);
                  setRecipientZipcode(addr.zipcode);
                  setRecipientLat(addr.lat);
                  setRecipientLng(addr.lng);
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Address Line 2</label>
              <input style={{ ...inputStyle, fontSize: '16px' }} value={recipientAddress2} onChange={(e) => setRecipientAddress2(e.target.value)} placeholder="Apt, Suite (optional)" />
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={labelStyle}>City *</label>
                <input style={{ ...inputStyle, fontSize: '16px' }} value={recipientCity} onChange={(e) => setRecipientCity(e.target.value)} />
              </div>
              <div style={{ width: 80 }}>
                <label style={labelStyle}>State *</label>
                <select
                  style={{ ...selectStyle, fontSize: '16px' }}
                  value={recipientState}
                  onChange={(e) => setRecipientState(e.target.value)}
                >
                  <option value="">—</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>{s.value}</option>
                  ))}
                </select>
              </div>
              <div style={{ width: 85 }}>
                <label style={labelStyle}>ZIP *</label>
                <input style={{ ...inputStyle, fontSize: '16px' }} value={recipientZipcode} maxLength={10} placeholder="93446" onChange={(e) => setRecipientZipcode(e.target.value)} />
              </div>
            </div>
            {stepError && <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', marginTop: 12 }}>{stepError}</p>}
            <NavButtons onBack={handleBack} onNext={handleNext} nextLabel="Next: Recognition →" />
          </div>
        )}

        {/* ── Step 3: Recognition / Attribution ───────────────────────────── */}
        {step === 3 && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>★ Recognition &amp; Dedication</div>
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#555555', lineHeight: 1.6, marginBottom: 20 }}>
              How would you like this Banner Bump to be attributed?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {ATTRIBUTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setAttribution(type.value as typeof attribution)}
                  style={{
                    textAlign: 'left', padding: '14px 16px',
                    border: attribution === type.value ? '2px solid #B22234' : '2px solid #EEEEEE',
                    borderRadius: 6, background: attribution === type.value ? '#FFF5F5' : '#FFFFFF',
                    cursor: 'pointer', transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{type.icon}</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', fontSize: '0.9rem', marginBottom: 4 }}>{type.label}</div>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#666666', lineHeight: 1.4 }}>{type.description}</div>
                </button>
              ))}
            </div>

            {(attribution === 'in_honor' || attribution === 'in_memoriam') && (
              <div style={{ borderTop: '1px solid #EEEEEE', paddingTop: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>
                    {attribution === 'in_honor' ? 'Honoring *' : 'In Memory Of *'}
                  </label>
                  <input
                    style={{ ...inputStyle, fontSize: '16px' }}
                    value={attributionName}
                    onChange={(e) => setAttributionName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label style={labelStyle}>About Them (optional)</label>
                  <textarea
                    style={{ ...inputStyle, fontSize: '16px', height: 100, resize: 'vertical' }}
                    value={attributionText}
                    onChange={(e) => setAttributionText(e.target.value)}
                    placeholder="Staff Sergeant Robert E. Hayes served with the 101st Airborne Division..."
                    maxLength={2000}
                  />
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: attributionText.length > 1800 ? '#B22234' : '#AAAAAA', textAlign: 'right', marginTop: 4 }}>
                    {2000 - attributionText.length} characters remaining
                  </div>
                </div>
              </div>
            )}

            {isAnon && (
              <div style={{ background: '#F9F9F9', border: '1px solid #EEEEEE', borderRadius: 6, padding: '12px 16px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#666666', lineHeight: 1.5 }}>
                🤫 Your name and contact information will not appear on the letter or be shared with the recipient.
              </div>
            )}

            {stepError && <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', marginTop: 12 }}>{stepError}</p>}
            <NavButtons onBack={handleBack} onNext={handleNext} nextLabel="Next: Banner Option →" />
          </div>
        )}

        {/* ── Step 4: Banner Option + Flag ─────────────────────────────────── */}
        {step === 4 && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>★ Choose a Banner Option</div>
            {usePatriotsClub && patriotsClubBalance > 0 && (
              <div style={{ background: '#FFFBEE', border: '1.5px solid #C5A028', borderRadius: 6, padding: '12px 16px', marginBottom: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#7A6010', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700 }}>★ Patriot&apos;s Club Bump active</span> — Banner option is locked to <strong>Letter + Flag</strong>. No payment required.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {BANNER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  disabled={usePatriotsClub && patriotsClubBalance > 0}
                  onClick={() => { setBannerOption(opt.value); setSelectedFlagId(''); setGcProductId(''); setGcAmount(0); }}
                  style={{
                    textAlign: 'left', padding: '16px 20px',
                    border: bannerOption === opt.value ? '2px solid #B22234' : '2px solid #EEEEEE',
                    borderRadius: 6, background: bannerOption === opt.value ? '#FFF5F5' : '#FFFFFF',
                    cursor: usePatriotsClub && patriotsClubBalance > 0 ? 'not-allowed' : 'pointer',
                    opacity: usePatriotsClub && patriotsClubBalance > 0 ? 0.6 : 1,
                    transition: 'border-color 0.15s',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', marginBottom: 4 }}>
                      {opt.value === '121120002'
                        ? <>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="https://bannerbeautystorage.blob.core.windows.net/images/banner-bump.png" alt="" style={{ height: '1.2em', width: 'auto', verticalAlign: 'middle' }} /> {opt.label}</>
                        : <>{opt.icon} {opt.label}</>}
                    </div>
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#666666' }}>{opt.description}</div>
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#B22234', fontSize: '0.95rem', flexShrink: 0, marginLeft: 16 }}>
                    {opt.value === '121120000' && `$${letterPrice.toFixed(2)}`}
                    {opt.value === '121120001' && `from $${(letterPrice + cheapestGC).toFixed(2)}`}
                    {opt.value === '121120002' && (selectedFlag ? `$${(letterPrice + flagPrice).toFixed(2)}` : `from $${(letterPrice + cheapestFlag).toFixed(2)}`)}
                  </div>
                </button>
              ))}
            </div>

            {/* Flag selector — only for Letter + Flag */}
            {includesFlag && (
              <div style={{ borderTop: '1px solid #EEEEEE', paddingTop: 20 }}>
                <div style={sectionTitleStyle}>Select Flag</div>
                {usePatriotsClub && patriotsClubBalance > 0 ? (
                  <div style={{ marginTop: 16, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B2A4A', background: 'rgba(197,160,40,0.08)', border: '1px solid #C5A028', borderRadius: 6, padding: '12px 16px' }}>
                    ★ Flag included: <strong>3&apos; x 5&apos; U.S. Flag, Nylon</strong> — included with your Patriot&apos;s Club membership.
                  </div>
                ) : flagProducts.length === 0 ? (
                  <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#888888' }}>No flag products are currently available.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {flagProducts.map((flag) => (
                      <button
                        key={flag.productid}
                        onClick={() => setSelectedFlagId(flag.productid)}
                        style={{
                          textAlign: 'left', padding: '14px 18px',
                          border: selectedFlagId === flag.productid ? '2px solid #1B2A4A' : '2px solid #EEEEEE',
                          borderRadius: 6, background: selectedFlagId === flag.productid ? '#F0F3F8' : '#FAFAFA',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', fontSize: '0.92rem' }}>{flag.name}</div>
                          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#AAAAAA' }}>SKU: {flag.productnumber}</div>
                        </div>
                        <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#B22234', flexShrink: 0, marginLeft: 16 }}>${flag.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* GC selector — only for Letter + Gift Certificate */}
            {includesGC && (
              <div style={{ borderTop: '1px solid #EEEEEE', paddingTop: 20 }}>
                <div style={sectionTitleStyle}>Select Gift Certificate Amount</div>
                {gcProducts.length === 0 ? (
                  <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#888888' }}>No gift certificates are currently available.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {gcProducts.map((gc) => (
                      <button
                        key={gc.productid}
                        onClick={() => { setGcProductId(gc.productid); setGcAmount(gc.price); }}
                        style={{
                          textAlign: 'left', padding: '14px 18px',
                          border: gcProductId === gc.productid ? '2px solid #1B2A4A' : '2px solid #EEEEEE',
                          borderRadius: 6, background: gcProductId === gc.productid ? '#F0F3F8' : '#FAFAFA',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', fontSize: '0.92rem' }}>{gc.name}</div>
                          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#AAAAAA' }}>SKU: {gc.productnumber}</div>
                        </div>
                        <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#B22234', flexShrink: 0, marginLeft: 16 }}>${gc.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {stepError && <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', marginTop: 12 }}>{stepError}</p>}
            <NavButtons onBack={handleBack} onNext={handleNext} nextLabel="Next: Sharing →" />
          </div>
        )}

        {/* ── Step 5: Sharing Preferences ──────────────────────────────────── */}
        {step === 5 && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>★ Sharing Preferences</div>
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#555555', lineHeight: 1.6, marginBottom: 20 }}>
              Choose what information to share with your neighbor on the letter and possibly on the public Banner Beauty website.
              {isAnon && <strong style={{ color: '#B22234' }}> Anonymous attribution disables all sharing.</strong>}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ToggleCard
                label="Share My Name"
                description={`Your name (${inFirstName} ${inLastName}) will appear on the letter.`}
                checked={shareName}
                onChange={setShareName}
                disabled={isAnon}
                disabledReason="Not available for anonymous attribution."
              />
              <ToggleCard
                label="Share My Phone"
                description={hasPhone ? `Your phone number will appear on the letter.` : ''}
                checked={sharePhone}
                onChange={setSharePhone}
                disabled={isAnon || !hasPhone}
                disabledReason={!hasPhone ? 'No phone number on your profile.' : 'Not available for anonymous attribution.'}
              />
              <ToggleCard
                label="Share My Email"
                description="Your email address will appear on the letter."
                checked={shareEmail}
                onChange={setShareEmail}
                disabled={isAnon || !userEmail}
                disabledReason={!userEmail ? 'No email on your profile.' : 'Not available for anonymous attribution.'}
              />
              <ToggleCard
                label="Share My Address"
                description={hasAddress ? 'Your mailing address will appear on the letter.' : ''}
                checked={shareAddress}
                onChange={setShareAddress}
                disabled={isAnon || !hasAddress}
                disabledReason={!hasAddress ? 'No address on your profile.' : 'Not available for anonymous attribution.'}
              />
            </div>

            <NavButtons onBack={handleBack} onNext={handleNext} nextLabel="Next: Letter →" />
          </div>
        )}

        {/* ── Step 6: Letter + P.S. ────────────────────────────────────────── */}
        {step === 6 && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>★ Choose a Letter Template</div>

            {letterTemplates.length === 0 ? (
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#888888' }}>No letter templates are currently available. Please contact us.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {letterTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    style={{
                      border: selectedTemplateId === tmpl.id ? '2px solid #B22234' : '2px solid #EEEEEE',
                      borderRadius: 6, background: selectedTemplateId === tmpl.id ? '#FFF5F5' : '#FFFFFF', overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      style={{ width: '100%', textAlign: 'left', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}
                    >
                      <div>
                        <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', marginBottom: 4 }}>{tmpl.name}</div>
                        {tmpl.previewText && (
                          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#666666', lineHeight: 1.5 }}>
                            &ldquo;{tmpl.previewText}&rdquo;
                          </div>
                        )}
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid', borderColor: selectedTemplateId === tmpl.id ? '#B22234' : '#DDDDDD', background: selectedTemplateId === tmpl.id ? '#B22234' : 'transparent', flexShrink: 0, marginTop: 2 }} />
                    </button>

                    {tmpl.bodyHtml && selectedTemplateId === tmpl.id && (
                      <div
                        dangerouslySetInnerHTML={{ __html: tmpl.bodyHtml }}
                        style={{ padding: '12px 20px 20px', fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#444444', lineHeight: 1.7, borderTop: '1px solid #EEEEEE' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Personal P.S. note — hidden for anonymous */}
            {!isAnon && (
              <div style={{ borderTop: '1px solid #EEEEEE', paddingTop: 20 }}>
                <label style={labelStyle}>Add a Personal Note (optional)</label>
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', margin: '0 0 10px', lineHeight: 1.5 }}>
                  Your note will appear as a P.S. at the end of the letter.
                </p>
                <textarea
                  style={{ ...inputStyle, height: 96, resize: 'vertical' }}
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="P.S. — I noticed your flag and wanted you to know your service to this neighborhood doesn't go unseen…"
                />
                {personalNote.trim() && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <input
                      type="checkbox"
                      id="isPublicNoteIn"
                      checked={isPublicNoteIn}
                      onChange={(e) => setIsPublicNoteIn(e.target.checked)}
                      style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#1B2A4A' }}
                    />
                    <label htmlFor="isPublicNoteIn" style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#555555', cursor: 'pointer' }}>
                      Share this personal note on the Banner Beauty website.
                    </label>
                  </div>
                )}
              </div>
            )}

            {stepError && <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', marginTop: 12 }}>{stepError}</p>}
            <NavButtons onBack={handleBack} onNext={handleNext} nextLabel="Next: Review & Pay →" />
          </div>
        )}

        {/* ── Step 7: Review & Pay ─────────────────────────────────────────── */}
        {step === 7 && (
          <>
            {/* Review summary */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>★ Review Your Banner Bump</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem' }}>

                <div style={{ padding: '10px 14px', background: '#F9F9F9', borderRadius: 4 }}>
                  <div style={{ fontSize: '0.72rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Recipient</div>
                  <div style={{ fontWeight: 700, color: '#1B2A4A' }}>{recipientFirstName} {recipientLastName}</div>
                  <div style={{ color: '#555555' }}>{recipientAddress1}{recipientAddress2 ? `, ${recipientAddress2}` : ''}</div>
                  <div style={{ color: '#555555' }}>{recipientCity}, {recipientState} {recipientZipcode}</div>
                </div>

                <div style={{ padding: '10px 14px', background: '#F9F9F9', borderRadius: 4 }}>
                  <div style={{ fontSize: '0.72rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Attribution</div>
                  <div style={{ fontWeight: 700, color: '#1B2A4A' }}>
                    {ATTRIBUTION_TYPES.find((a) => a.value === attribution)?.label}
                    {attributionName && ` — ${attributionName}`}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: '#F9F9F9', borderRadius: 4 }}>
                  <div style={{ fontSize: '0.72rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Banner Option</div>
                  <div style={{ fontWeight: 700, color: '#1B2A4A' }}>{bannerOptionLabel}</div>
                  {selectedFlag && <div style={{ color: '#555555' }}>{selectedFlag.name}</div>}
                  {selectedTemplate && <div style={{ color: '#555555' }}>Letter: {selectedTemplate.name}</div>}
                  {personalNote && <div style={{ color: '#555555', fontStyle: 'italic', marginTop: 4 }}>P.S. added</div>}
                </div>

                {/* Pricing */}
                <div style={{ padding: '10px 14px', background: '#F9F9F9', borderRadius: 4 }}>
                  <div style={{ fontSize: '0.72rem', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Pricing</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#555555' }}>Letter</span>
                    <span style={{ color: '#1B2A4A', fontWeight: 700 }}>${letterPrice.toFixed(2)}</span>
                  </div>
                  {includesFlag && selectedFlag && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#555555' }}>Flag</span>
                      <span style={{ color: '#1B2A4A', fontWeight: 700 }}>${flagPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {shipping > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#555555' }}>Shipping</span>
                      <span style={{ color: '#1B2A4A', fontWeight: 700 }}>${shipping.toFixed(2)}</span>
                    </div>
                  )}
                  {gcTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#1B7A3E' }}>
                      <span>Gift Certificate</span>
                      <span style={{ fontWeight: 700 }}>−${gcTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #EEEEEE', paddingTop: 8, marginTop: 4 }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A' }}>Total Due</span>
                    <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#B22234', fontSize: '1.05rem' }}>${amountDue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gift Certificate */}
            <div style={cardStyle}>
              <div style={sectionTitleStyle}>★ Gift Certificate</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1, textTransform: 'uppercase', letterSpacing: '1px' }}
                  value={gcInput} placeholder="GC-XXXXXXXX"
                  onChange={(e) => setGcInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && applyGC()}
                />
                <button onClick={applyGC} disabled={gcLoading} style={{ padding: '10px 18px', background: '#1B2A4A', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '0.88rem', cursor: gcLoading ? 'not-allowed' : 'pointer', opacity: gcLoading ? 0.6 : 1, flexShrink: 0 }}>
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

            {/* Payment element */}
            {amountDue > 0 && (
              <div style={cardStyle}>
                <div style={sectionTitleStyle}>★ Payment</div>
                {!stripeReady && <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#888888' }}>Loading payment form…</p>}
                {clientSecret && (
                  <StripePaymentElement
                    clientSecret={clientSecret}
                    onReady={() => setStripeReady(true)}
                    onInit={(stripe, elements) => { stripeRef.current = { stripe, elements }; }}
                  />
                )}
              </div>
            )}

            {amountDue === 0 && gcTotal > 0 && !usePatriotsClub && (
              <div style={{ background: '#E8F5E9', border: '1px solid #1B7A3E', borderRadius: 8, padding: 20, marginBottom: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#1B7A3E', fontWeight: 700 }}>
                ✓ Your Banner Bump is fully covered by gift certificate(s) — no payment needed!
              </div>
            )}

            {usePatriotsClub && patriotsClubBalance > 0 && (
              <div style={{ background: '#FFFBEE', border: '1.5px solid #C5A028', borderRadius: 8, padding: 20, marginBottom: 20, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#7A6010' }}>
                <span style={{ fontWeight: 700 }}>★ Patriot&apos;s Club Bump</span> — 1 bump credit will be used from your balance of {patriotsClubBalance}. No payment required.
              </div>
            )}

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#666666', lineHeight: 1.5 }}>
                I agree to the <a href="/terms-of-service" style={{ color: '#1B2A4A' }}>Terms of Service</a> and <a href="/privacy-policy" style={{ color: '#1B2A4A' }}>Privacy Policy</a>.
              </span>
            </label>

            {(stepError || orderError) && (
              <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', marginBottom: 12 }}>{stepError || orderError}</p>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleBack} style={{ padding: '12px 24px', background: 'none', border: '1.5px solid #DDDDDD', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#666666', cursor: 'pointer' }}>
                ← Back
              </button>
              <button
                onClick={submitBannerBump}
                disabled={placing}
                style={{ flex: 1, padding: '18px', background: placing ? '#AAAAAA' : '#B22234', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 700, cursor: placing ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
              >
                {placing ? 'Submitting…' : amountDue === 0 ? '★ Submit Banner Bump' : `★ Submit & Pay $${amountDue.toFixed(2)}`}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 520px) {
          input, select, textarea { font-size: 16px !important; }
        }
        @media (max-width: 480px) {
          .bb-recipient-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
    </APIProvider>
  );
}
