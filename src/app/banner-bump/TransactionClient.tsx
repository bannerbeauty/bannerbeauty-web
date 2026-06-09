'use client';

import { useState, useRef } from 'react';

interface TransactionClientProps {
  bannerId: string;
  bannerNumber: string;
  totalCount: number;
  bannerOption: number;  // 121120000=Letter Only, 121120001=Letter+GC, 121120002=Letter+Flag
  attributionType: string;  // 'from_me' | 'in_honor' | 'in_memoriam' | 'anonymous'
  attributionName: string;
  attributionText: string;
  noteIn: string;    // initiating neighbor's P.S.
  noteRn: string;    // recipient's note back
  shareName: boolean;
  sharePhone: boolean;
  shareEmail: boolean;
  shareAddress: boolean;
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
  letterPdfUrl: string | null;
  templateName: string;
  templateBodyHtml: string;
  initiatingFirstName: string;
  initiatingLastName: string;
  initiatingPhone: string;
  initiatingEmail: string;
  initiatingAddress: string;
  initiatingCity: string;
  initiatingState: string;
  recipientFirstName: string;
  recipientLastName: string;
  gcCode: string | null;
  gcAmount: number | null;
  userEmail: string | null;
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #DDDDDD',
  borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '0.95rem',
  color: '#2D2D2D', background: '#FFFFFF', boxSizing: 'border-box',
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
  background: '#FFFFFF', borderRadius: 8, padding: 28,
  marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
};

const btnPrimaryStyle: React.CSSProperties = {
  display: 'inline-block', padding: '13px 28px',
  background: '#C5A028', color: '#FFFFFF', border: 'none', borderRadius: 4,
  fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem',
  letterSpacing: '1.5px', textTransform: 'uppercase',
  cursor: 'pointer', textDecoration: 'none', textAlign: 'center',
};

const btnSecondaryStyle: React.CSSProperties = {
  ...btnPrimaryStyle,
  background: 'transparent', color: '#1A1A2E',
  border: '1.5px solid #1A1A2E',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function replaceTokens(html: string, firstName: string, lastName: string): string {
  return html
    .replace(/\{\{RecipientFirstName\}\}/gi, firstName)
    .replace(/\{\{RecipientLastName\}\}/gi, lastName)
    .replace(/\{\{RecipientFullName\}\}/gi, `${firstName} ${lastName}`.trim())
    .replace(/\{\{FirstName\}\}/gi, firstName)
    .replace(/\{\{LastName\}\}/gi, lastName);
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TransactionClient({
  bannerId,
  bannerNumber,
  totalCount,
  bannerOption,
  attributionType,
  attributionName,
  attributionText,
  noteIn,
  noteRn,
  shareName,
  sharePhone,
  shareEmail,
  shareAddress,
  beforePhotoUrl,
  afterPhotoUrl,
  letterPdfUrl,
  templateBodyHtml,
  initiatingFirstName,
  initiatingLastName,
  initiatingPhone,
  initiatingEmail,
  initiatingAddress,
  initiatingCity,
  initiatingState,
  recipientFirstName,
  recipientLastName,
  gcCode,
  gcAmount,
  userEmail,
}: TransactionClientProps) {
  const [noteText, setNoteText] = useState(noteRn);
  const [savedNote, setSavedNote] = useState(noteRn);
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [noteError, setNoteError] = useState('');

  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [isPublicPhoto, setIsPublicPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(afterPhotoUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAnonymous = attributionType === 'anonymous';
  const includesGC = bannerOption === 121120001;
  const includesFlag = bannerOption === 121120002;

  // Build rendered letter HTML
  const bodyHtml = replaceTokens(templateBodyHtml, recipientFirstName, recipientLastName);

  // Attribution paragraph
  let attributionParagraph = '';
  if (attributionType === 'in_honor' && attributionName) {
    attributionParagraph = `In Honor of ${attributionName}${attributionText ? ` — ${attributionText}` : ''}.`;
  } else if (attributionType === 'in_memoriam' && attributionName) {
    attributionParagraph = `In Memoriam of ${attributionName}${attributionText ? ` — ${attributionText}` : ''}.`;
  }

  // Sign-off contact info
  const senderLines: string[] = [];
  if (!isAnonymous) {
    if (shareName && (initiatingFirstName || initiatingLastName)) {
      senderLines.push(`${initiatingFirstName} ${initiatingLastName}`.trim());
    }
    if (sharePhone && initiatingPhone) senderLines.push(initiatingPhone);
    if (shareEmail && initiatingEmail) senderLines.push(initiatingEmail);
    if (shareAddress && initiatingAddress) {
      const addr = [initiatingAddress, initiatingCity, initiatingState].filter(Boolean).join(', ');
      if (addr) senderLines.push(addr);
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSaveNote() {
    setNoteSaving(true);
    setNoteError('');
    try {
      const res = await fetch('/api/banner/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId, note: noteText, isPublicNote, isPublicPhoto }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSavedNote(noteText);
      setNoteSaved(true);
    } catch {
      setNoteError('Could not save your note. Please try again.');
    } finally {
      setNoteSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoUploading(true);
    setPhotoError('');

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/flows/upload-before-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerId,
          photoBase64: base64,
          mimeType: file.type,
          isAfterPhoto: true,
        }),
      });
      if (!res.ok) throw new Error('Upload failed');
      setPhotoUploaded(true);
    } catch {
      setPhotoError('Photo upload failed. Please try again.');
      setPreviewUrl(afterPhotoUrl);
    } finally {
      setPhotoUploading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#F9F6F0', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        background: '#1A1A2E', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 'bold',
            color: '#C5A028', letterSpacing: '2px',
          }}>
            BANNER BEAUTY
          </span>
        </a>
        <a href="/store" style={{
          fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.8rem',
          letterSpacing: '1px', textTransform: 'uppercase', color: '#C5A028', textDecoration: 'none',
        }}>
          Store
        </a>
      </header>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #2E2E4A 100%)',
        padding: '48px 24px', textAlign: 'center', color: '#FFFFFF',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div style={{ marginBottom: 12 }}><img src="https://bannerbeautystorage.blob.core.windows.net/images/banner-bump.png" alt="Banner Bump" style={{ height: '3em', width: 'auto', display: 'block', margin: '0 auto' }} /></div>
        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: '2.2rem', color: '#C5A028',
          margin: '0 0 12px', letterSpacing: '1px',
        }}>
          You&apos;ve Been Banner Bumped!
        </h1>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif', fontSize: '1rem',
          color: '#CCCCCC', margin: '0 0 8px',
        }}>
          Someone in your community is celebrating your service.
        </p>
        {bannerNumber && (
          <p style={{
            fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.8rem',
            color: '#888888', margin: 0, letterSpacing: '1px',
          }}>
            Bump #{bannerNumber}
            {totalCount > 1 && ` · ${totalCount} bumps in this chain`}
          </p>
        )}
      </div>

      {/* Body */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '36px 16px 60px' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>

          {/* Letter */}
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>Your Letter</div>

            {/* Greeting */}
            <p style={{
              fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#2D2D2D',
              marginBottom: 16, lineHeight: 1.7,
            }}>
              Dear {recipientFirstName || 'Patriot'},
            </p>

            {/* Body HTML */}
            {bodyHtml ? (
              <div
                style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem', color: '#2D2D2D', lineHeight: 1.75, marginBottom: 16 }}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.97rem', color: '#2D2D2D', lineHeight: 1.75, marginBottom: 16 }}>
                Thank you for your service and sacrifice. This Banner Bump is a small token of gratitude from your community.
              </p>
            )}

            {/* Attribution paragraph */}
            {attributionParagraph && (
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#666',
                fontStyle: 'italic', marginBottom: 16, lineHeight: 1.7,
              }}>
                {attributionParagraph}
              </p>
            )}

            {/* Sign-off */}
            <p style={{
              fontFamily: 'Georgia, serif', fontSize: '0.97rem', color: '#2D2D2D',
              marginBottom: 8, lineHeight: 1.7,
            }}>
              With patriotic pride,
            </p>
            {senderLines.length > 0 ? (
              <div style={{ marginBottom: noteIn ? 20 : 0 }}>
                {senderLines.map((line, i) => (
                  <p key={i} style={{
                    fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#2D2D2D',
                    margin: '2px 0', lineHeight: 1.6,
                  }}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#666',
                fontStyle: 'italic', marginBottom: noteIn ? 20 : 0,
              }}>
                {isAnonymous ? 'A grateful neighbor' : 'Your neighbor'}
              </p>
            )}

            {/* P.S. from initiating neighbor */}
            {noteIn && (
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#2D2D2D',
                lineHeight: 1.7, marginTop: 16, paddingTop: 16,
                borderTop: '1px solid #EEEEEE',
              }}>
                <em>P.S. {noteIn}</em>
              </p>
            )}

            {/* PDF link */}
            {letterPdfUrl && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #EEEEEE' }}>
                <a
                  href={letterPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...btnSecondaryStyle, fontSize: '0.8rem' }}
                >
                  Download Letter PDF
                </a>
              </div>
            )}
          </section>

          {/* Before Photo */}
          {beforePhotoUrl && (
            <section style={cardStyle}>
              <div style={sectionTitleStyle}>Before Photo</div>
              <img
                src={beforePhotoUrl}
                alt="Before"
                style={{ width: '100%', borderRadius: 6, display: 'block' }}
              />
            </section>
          )}

          {/* Gift Certificate */}
          {includesGC && (
            <section style={{
              ...cardStyle,
              border: '2px solid #C5A028',
              background: 'linear-gradient(135deg, #FFFDF4, #FFF8E1)',
            }}>
              <div style={sectionTitleStyle}>🎁 Your Gift Certificate</div>
              {gcCode ? (
                <>
                  <p style={{
                    fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem',
                    color: '#555', marginBottom: 16, lineHeight: 1.6,
                  }}>
                    You&apos;ve received a gift certificate
                    {gcAmount ? ` worth ${formatCurrency(gcAmount)}` : ''} to use in the Banner Beauty store.
                  </p>
                  <div style={{
                    background: '#FFFFFF', border: '1.5px solid #C5A028', borderRadius: 6,
                    padding: '16px 20px', textAlign: 'center', marginBottom: 20,
                  }}>
                    <div style={{
                      fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem',
                      letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: 8,
                    }}>
                      Your Code
                    </div>
                    <div style={{
                      fontFamily: 'Georgia, serif', fontSize: '1.8rem',
                      fontWeight: 'bold', color: '#1A1A2E', letterSpacing: '4px',
                    }}>
                      {gcCode}
                    </div>
                  </div>
                  <a href="/store" style={btnPrimaryStyle}>
                    Redeem in Store
                  </a>
                </>
              ) : (
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#555' }}>
                  Your gift certificate is being processed and will appear here shortly.
                </p>
              )}
            </section>
          )}

          {/* Flag on its way */}
          {includesFlag && (
            <section style={{
              ...cardStyle,
              border: '2px solid #1A1A2E',
              background: 'linear-gradient(135deg, #F0F4FF, #E8EDF8)',
            }}>
              <div style={sectionTitleStyle}>🇺🇸 Your Flag Is on Its Way</div>
              <p style={{
                fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem',
                color: '#333', lineHeight: 1.7, marginBottom: 0,
              }}>
                A brand-new American flag has been ordered and will be shipped to your address.
                Keep an eye on your mailbox — it&apos;s a gift from a grateful neighbor.
              </p>
            </section>
          )}

          {/* After Photo Upload — auth-gated */}
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>📸 After Photo</div>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="After"
                style={{ width: '100%', borderRadius: 6, display: 'block', marginBottom: 16 }}
              />
            )}
            {userEmail ? (
              <>
                <p style={{
                  fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem',
                  color: '#666', lineHeight: 1.6, marginBottom: 16,
                }}>
                  {previewUrl
                    ? 'Replace your after photo by uploading a new one.'
                    : 'Show your community how your banner looks! Upload a photo after installation.'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  style={{
                    ...btnSecondaryStyle,
                    opacity: photoUploading ? 0.6 : 1,
                    cursor: photoUploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {photoUploading ? 'Uploading…' : previewUrl ? 'Replace Photo' : 'Upload After Photo'}
                </button>
                {photoUploaded && (
                  <p style={{
                    fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem',
                    color: '#2E7D32', marginTop: 12,
                  }}>
                    ✓ Photo uploaded successfully!
                  </p>
                )}
                {photoError && (
                  <p style={{
                    fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem',
                    color: '#C62828', marginTop: 12,
                  }}>
                    {photoError}
                  </p>
                )}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  marginTop: 16, cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={isPublicPhoto}
                    onChange={async (e) => {
                      setIsPublicPhoto(e.target.checked);
                      try {
                        await fetch('/api/banner/note', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            bannerId,
                            note: savedNote || '',
                            isPublicNote,
                            isPublicPhoto: e.target.checked,
                          }),
                        });
                      } catch (err) {
                        console.error('Failed to save photo preference:', err);
                      }
                    }}
                    style={{ marginTop: 2, accentColor: '#C5A028', flexShrink: 0 }}
                  />
                  <span style={{
                    fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem',
                    color: '#555', lineHeight: 1.5,
                  }}>
                    ✓ Make my photos public — let BannerBeauty use my photos to inspire others 🇺🇸
                  </span>
                </label>
              </>
            ) : (
              <div style={{
                background: '#F5F5F5', borderRadius: 6, padding: '16px 20px',
                fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#666',
              }}>
                <a href="/api/auth/signin?callbackUrl=/banner-bump" style={{ color: '#C5A028' }}>Sign in</a>
                {' '}to upload an after photo and let your community see the result.
              </div>
            )}
          </section>

          {/* Leave a Note — auth-gated */}
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>💬 Leave a Note</div>
            {userEmail ? (
              <>
                <p style={{
                  fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem',
                  color: '#666', lineHeight: 1.6, marginBottom: 16,
                }}>
                  Send a message of gratitude back to your neighbor.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Your Note</label>
                  <textarea
                    value={noteText}
                    onChange={e => { setNoteText(e.target.value); setNoteSaved(false); }}
                    rows={4}
                    placeholder="Thank you so much for the kind gesture…"
                    style={{
                      ...inputStyle,
                      resize: 'vertical', lineHeight: 1.6,
                    }}
                  />
                </div>
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  marginBottom: 16, cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={isPublicNote}
                    onChange={async (e) => {
                      setIsPublicNote(e.target.checked);
                      try {
                        await fetch('/api/banner/note', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            bannerId,
                            note: savedNote || '',
                            isPublicNote: e.target.checked,
                            isPublicPhoto,
                          }),
                        });
                      } catch (err) {
                        console.error('Failed to save note preference:', err);
                      }
                    }}
                    style={{ marginTop: 2, accentColor: '#C5A028', flexShrink: 0 }}
                  />
                  <span style={{
                    fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem',
                    color: '#555', lineHeight: 1.5,
                  }}>
                    ✓ Make my note public — let BannerBeauty share my response to inspire others 🇺🇸
                  </span>
                </label>
                {noteSaved && (
                  <p style={{
                    fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem',
                    color: '#2E7D32', marginBottom: 12,
                  }}>
                    ✓ Your note has been saved.
                  </p>
                )}
                {noteError && (
                  <p style={{
                    fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem',
                    color: '#C62828', marginBottom: 12,
                  }}>
                    {noteError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={noteSaving || !noteText.trim()}
                  style={{
                    ...btnPrimaryStyle,
                    opacity: noteSaving || !noteText.trim() ? 0.6 : 1,
                    cursor: noteSaving || !noteText.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {noteSaving ? 'Saving…' : 'Save Note'}
                </button>
              </>
            ) : (
              <div style={{
                background: '#F5F5F5', borderRadius: 6, padding: '16px 20px',
                fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#666',
              }}>
                <a href="/api/auth/signin?callbackUrl=/banner-bump" style={{ color: '#C5A028' }}>Sign in</a>
                {' '}to send a thank-you note back to your neighbor.
              </div>
            )}
          </section>

          {/* Bump It Forward */}
          <section style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #1A1A2E, #2E2E4A)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🇺🇸</div>
            <h2 style={{
              fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#C5A028',
              marginBottom: 12,
            }}>
              Bump It Forward
            </h2>
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem',
              color: '#CCCCCC', lineHeight: 1.7, marginBottom: 24,
            }}>
              Pay it forward — send a Banner Bump to another patriot in your community
              and keep the chain of gratitude going.
            </p>
            <a href="/submit-banner" style={btnPrimaryStyle}>
              Banner Bump a Patriot
            </a>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#1A1A2E', padding: '16px 24px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem',
          color: '#888888', margin: 0, letterSpacing: '0.5px',
        }}>
          © {new Date().getFullYear()} Banner Beauty · All rights reserved
        </p>
      </footer>

    </div>
  );
}
