'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQClient({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Hero */}
      <section style={{ background: '#1B2A4A', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#C5A028',
          margin: '0 0 16px',
        }}>
          ★ Got Questions? ★
        </p>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 16px',
        }}>
          Frequently Asked Questions
        </h1>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
        }}>
          Everything you need to know about Banner Beauty and Banner Bumps.
        </p>
      </section>

      {/* FAQ Content */}
      <section style={{ background: '#FAF7F2', padding: '72px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 48 }}>
            <input
              type="search"
              placeholder="Search frequently asked questions..."
              value={search}
              onChange={e => { setSearch(e.target.value); setOpenIndex(null); }}
              style={{
                width: '100%',
                padding: '14px 48px 14px 20px',
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '1rem',
                border: '2px solid #DDDDDD',
                borderRadius: 4,
                outline: 'none',
                boxSizing: 'border-box',
                color: '#333333',
                background: '#FFFFFF',
              }}
            />
            <span style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#AAAAAA',
              fontSize: '1.1rem',
              pointerEvents: 'none',
            }}>
              🔍
            </span>
          </div>

          {/* Results count */}
          {search && (
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.85rem',
              color: '#888888',
              marginBottom: 24,
              marginTop: -32,
            }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
            </p>
          )}

          {/* FAQ Accordion */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #EEEEEE',
            }}>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1rem', color: '#888888', margin: '0 0 16px' }}>
                No results found for &ldquo;{search}&rdquo;
              </p>
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#AAAAAA', margin: 0 }}>
                Try different keywords or{' '}
                <a href="mailto:support@bannerbeauty.com" style={{ color: '#B22234' }}>contact us directly</a>.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map((faq, i) => {
                const isOpen = openIndex === i;
                return (
                  <div
                    key={i}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 6,
                      border: `1px solid ${isOpen ? '#C5A028' : '#EEEEEE'}`,
                      overflow: 'hidden',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '18px 20px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <span style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1B2A4A',
                        lineHeight: 1.4,
                      }}>
                        {faq.question}
                      </span>
                      <span style={{
                        color: '#C5A028',
                        fontSize: '1.2rem',
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        fontWeight: 300,
                      }}>
                        ✛
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '0 20px 20px',
                        fontFamily: 'Trebuchet MS, sans-serif',
                        fontSize: '0.95rem',
                        color: '#555555',
                        lineHeight: 1.8,
                        borderTop: '1px solid #EEEEEE',
                        paddingTop: 16,
                      }}>
                        <div
                          className="rich-text-content"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                          style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#555555', lineHeight: 1.8 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Contact CTA */}
          <div style={{
            marginTop: 48,
            padding: '32px',
            background: '#1B2A4A',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 8px',
            }}>
              Still have questions?
            </p>
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.88rem',
              color: 'rgba(255,255,255,0.6)',
              margin: '0 0 20px',
            }}>
              Our team is happy to help.
            </p>
            <Link
              href="/support"
              style={{
                display: 'inline-block',
                background: '#B22234',
                color: '#FFFFFF',
                fontFamily: 'Georgia, serif',
                fontSize: '0.95rem',
                fontWeight: 700,
                padding: '12px 32px',
                borderRadius: 4,
                textDecoration: 'none',
              }}
            >
              Contact Support →
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}
