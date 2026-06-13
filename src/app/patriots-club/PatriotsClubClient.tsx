'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommunityLayout from '@/components/CommunityLayout';
import type { SidebarData } from '@/lib/community-sidebar';

const ONE_OFF_PRICE_ID = process.env.NEXT_PUBLIC_PATRIOTS_CLUB_ONETIME_PRICE_ID ?? 'price_1ThuIEJhCCth9fOiTFubdMjA';
const RECURRING_PRICE_ID = process.env.NEXT_PUBLIC_PATRIOTS_CLUB_RECURRING_PRICE_ID ?? 'price_1ThuH8JhCCth9fOiDstak8So';

interface Props {
  isLoggedIn: boolean;
  neighborId: string | null;
  isPatriotsClub: boolean;
  bumpBalance: number;
  expiryDate: string;
  sidebarData: SidebarData | null;
  annualPrice: number;
}

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PatriotsClubClient({
  isLoggedIn,
  neighborId,
  isPatriotsClub,
  bumpBalance,
  expiryDate,
  sidebarData,
  annualPrice,
}: Props) {
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'onetime' | 'recurring'>('recurring');

  const handleJoin = async () => {
    if (!isLoggedIn) {
      window.location.href = '/api/auth/signin?callbackUrl=/patriots-club';
      return;
    }
    setPurchasing(true);
    try {
      const res = await fetch('/api/patriotsclub/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborId,
          priceId: selectedPlan === 'recurring' ? RECURRING_PRICE_ID : ONE_OFF_PRICE_ID,
          isRecurring: selectedPlan === 'recurring',
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      console.error('Checkout failed');
      setPurchasing(false);
    }
  };

  const pageContent = (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: '#1B2A4A', padding: '72px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: '#C5A028',
            color: '#1B2A4A',
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            padding: '6px 16px',
            borderRadius: 20,
            marginBottom: 24,
          }}>
            ★ Patriot&apos;s Club
          </div>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: '0 0 16px',
            lineHeight: 1.2,
          }}>
            Make Patriotism a Habit
          </h1>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7,
            margin: '0 0 32px',
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Join the Patriot&apos;s Club and get 12 pre-loaded Banner Bumps for the year.
            No checkout friction — just spot a tattered flag and bump. 🇺🇸
          </p>

          {/* Member status */}
          {isPatriotsClub ? (
            <div style={{
              background: 'rgba(197,160,40,0.15)',
              border: '1px solid #C5A028',
              borderRadius: 8,
              padding: '20px 32px',
              display: 'inline-block',
            }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#C5A028', marginBottom: 4 }}>
                ★ You&apos;re a Patriot&apos;s Club Member!
              </div>
              <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                {bumpBalance} Banner Bump{bumpBalance !== 1 ? 's' : ''} remaining
                {expiryDate && ` · Member through ${formatDate(expiryDate)}`}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', fontWeight: 700, color: '#C5A028' }}>
              ${annualPrice.toFixed(2)}<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif' }}>/year</span>
              <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                Just ${(annualPrice / 12).toFixed(2)} per Banner Bump · Buy 12, Save 12%
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Perks */}
      <section style={{ padding: '64px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '0.75rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#C5A028',
            margin: '0 0 8px',
            textAlign: 'center',
          }}>
            ★ What You Get
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            textAlign: 'center',
            margin: '0 0 48px',
          }}>
            Everything a Patriot Needs
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '⚡', title: '12 Pre-Loaded Banner Bumps', desc: 'Ready to use anytime. No checkout required — just bump and go.' },
              { icon: '★', title: "Patriot's Club Badge", desc: 'Gold badge on your profile, feed posts, and leaderboards. Wear it with pride.' },
              { icon: '📈', title: '1.5x Points Multiplier', desc: 'Earn points faster on every Banner Bump. Rise to the top of the leaderboard.' },
              { icon: '🇺🇸', title: 'Priority Recognition', desc: 'Stand out in the community feed and Brigade member lists.' },
              { icon: '📧', title: 'Renewal Reminders', desc: "We'll remind you 30 days before expiry so you never lose unused bumps." },
              { icon: '🔄', title: 'Bump Rollover', desc: 'Renew before expiry and your remaining bumps carry forward.' },
            ].map((perk, i) => (
              <div key={i} style={{
                background: '#FAF7F2',
                borderRadius: 8,
                padding: '24px',
                border: '1px solid #EEEEEE',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{perk.icon}</div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 8 }}>
                  {perk.title}
                </div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#666666', lineHeight: 1.6 }}>
                  {perk.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      {!isPatriotsClub && (
        <section style={{ padding: '64px 24px', background: '#FAF7F2' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              color: '#1B2A4A',
              margin: '0 0 32px',
            }}>
              Choose Your Plan
            </h2>

            <div style={{ display: 'flex', gap: 16, marginBottom: 32, justifyContent: 'center' }}>
              {/* Recurring */}
              <div
                onClick={() => setSelectedPlan('recurring')}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: `2px solid ${selectedPlan === 'recurring' ? '#C5A028' : '#EEEEEE'}`,
                  borderRadius: 8,
                  padding: '20px 16px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {selectedPlan === 'recurring' && (
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#C5A028',
                    color: '#1B2A4A',
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: 10,
                    whiteSpace: 'nowrap',
                  }}>
                    RECOMMENDED
                  </div>
                )}
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 4 }}>
                  Annual Subscription
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: 700, color: '#C5A028' }}>${annualPrice.toFixed(2)}</div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginTop: 4 }}>
                  per year · auto-renews · cancel anytime
                </div>
              </div>

              {/* One-time */}
              <div
                onClick={() => setSelectedPlan('onetime')}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: `2px solid ${selectedPlan === 'onetime' ? '#C5A028' : '#EEEEEE'}`,
                  borderRadius: 8,
                  padding: '20px 16px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 4 }}>
                  One-Time Purchase
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: 700, color: '#1B2A4A' }}>${annualPrice.toFixed(2)}</div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginTop: 4 }}>
                  one year · no auto-renewal
                </div>
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={purchasing}
              style={{
                width: '100%',
                padding: '18px',
                background: purchasing ? '#AAAAAA' : '#B22234',
                color: '#FFFFFF',
                fontFamily: 'Georgia, serif',
                fontSize: '1.1rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: 4,
                cursor: purchasing ? 'not-allowed' : 'pointer',
                marginBottom: 16,
              }}
            >
              {purchasing ? 'Redirecting to Checkout...' : isLoggedIn ? "★ Join the Patriot's Club" : '★ Sign In to Join'}
            </button>

            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#AAAAAA', margin: 0 }}>
              Secure checkout powered by Stripe. Unused bumps expire at end of membership term.
            </p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section style={{ padding: '64px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 700,
            color: '#1B2A4A',
            textAlign: 'center',
            margin: '0 0 40px',
          }}>
            Frequently Asked Questions
          </h2>
          {[
            { q: 'What happens to unused bumps?', a: 'Unused bumps expire at the end of your membership term. If you renew before expiry, remaining bumps carry forward.' },
            { q: 'Can I cancel my subscription?', a: 'Yes — cancel anytime from your profile page. You keep your remaining bumps until the end of the current term.' },
            { q: 'How do I use my pre-loaded bumps?', a: "Just go to Banner Bump as usual. If you have a bump balance, it's automatically used instead of going through Stripe checkout." },
            { q: 'What is the 1.5x points multiplier?', a: "Patriot's Club members earn 1.5x points on every Banner Bump instead of the standard 1.25x. Points power the leaderboard." },
            { q: 'Can I buy additional bumps mid-year?', a: "Not currently. We're working on add-on bump packs for future release." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid #EEEEEE', padding: '20px 0' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 8 }}>
                {faq.q}
              </div>
              <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#555555', lineHeight: 1.7 }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );

  if (sidebarData) {
    return (
      <CommunityLayout sidebarData={sidebarData} hideAvatarBar={true}>
        {pageContent}
      </CommunityLayout>
    );
  }
  return pageContent;
}
