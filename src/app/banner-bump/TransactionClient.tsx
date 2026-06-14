'use client';

import { useState, useRef } from 'react';

interface TransactionClientProps {
  bannerId: string;
  bannerNumber: string;
  bannerOption: number;
  attributionType: string;
  attributionName: string;
  attributionText: string;
  attributionPhotoUrl: string;
  isPublicAttribution: boolean;
  noteIn: string;
  noteRn: string;
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
  viewerRole: 'in' | 'rn' | 'guest';
}

// ── Constants ───────────────────────────────────────────────────────────────────

const BANNER_OPTION_LABELS: Record<number, string> = {
  121120000: 'Letter Only',
  121120001: 'Letter + Gift Certificate',
  121120002: 'Letter + Flag',
};

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

export default function TransactionClient(props: TransactionClientProps) {
  const {
    bannerId,
    bannerNumber,
    bannerOption,
    attributionType,
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
    viewerRole,
  } = props;

  // Attribution state (editable by IN)
  const [attributionName, setAttributionName] = useState(props.attributionName);
  const [attributionText, setAttributionText] = useState(props.attributionText);
  const [attributionPhotoUrl, setAttributionPhotoUrl] = useState(props.attributionPhotoUrl);
  const [attributionPhotoUploading, setAttributionPhotoUploading] = useState(false);
  const [attributionSaving, setAttributionSaving] = useState(false);
  const [attributionSaved, setAttributionSaved] = useState(false);
  const attributionPhotoRef = useRef<HTMLInputElement>(null);

  // IN note state (editable by IN)
  const [noteIn, setNoteIn] = useState(props.noteIn);
  const [noteInSaving, setNoteInSaving] = useState(false);
  const [noteInSaved, setNoteInSaved] = useState(false);

  // RN note + after photo state (existing)
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

  const bodyHtml = replaceTokens(templateBodyHtml, recipientFirstName, recipientLastName);

  const senderLines: string[] = [];
  if (!isAnonymous) {
    if (shareName && (initiatingFirstName || initiatingLastName)) senderLines.push(`${initiatingFirstName} ${initiatingLastName}`.trim());
    if (sharePhone && initiatingPhone) senderLines.push(initiatingPhone);
    if (shareEmail && initiatingEmail) senderLines.push(initiatingEmail);
    if (shareAddress && initiatingAddress) {
      const addr = [initiatingAddress, initiatingCity, initiatingState].filter(Boolean).join(', ');
      if (addr) senderLines.push(addr);
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAttributionPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttributionPhotoUploading(true);
    try {
      const res = await fetch('/api/attribution/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const data = await res.json();
      if (data.url) {
        setAttributionPhotoUrl(data.url);
        await fetch('/api/banner/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bannerId, attributionPhotoUrl: data.url }),
        });
      }
    } catch { console.error('Attribution photo upload failed'); }
    finally { setAttributionPhotoUploading(false); }
  };

  const handleSaveAttribution = async () => {
    setAttributionSaving(true);
    try {
      await fetch('/api/banner/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId, attributionName, attributionText }),
      });
      setAttributionSaved(true);
    } catch { console.error('Save attribution failed'); }
    finally { setAttributionSaving(false); }
  };

  const handleSaveNoteIn = async () => {
    setNoteInSaving(true);
    try {
      await fetch('/api/banner/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId, noteIn }),
      });
      setNoteInSaved(true);
    } catch { console.error('Save IN note failed'); }
    finally { setNoteInSaving(false); }
  };

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
        reader.onload = () => { resolve((reader.result as string).split(',')[1]); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/flows/upload-before-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId, photoBase64: base64, mimeType: file.type, isAfterPhoto: true }),
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
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1B2A4A', padding: '20px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028', marginBottom: 4 }}>
            Banner Beauty
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px' }}>
            Banner Bump Details
          </h1>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
            {bannerNumber} · {BANNER_OPTION_LABELS[bannerOption] ?? 'Letter'}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* 1. The Letter */}
        <section style={cardStyle}>
          <div style={sectionTitleStyle}>The Letter</div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', color: '#1B2A4A', marginBottom: 16 }}>
            Dear {recipientFirstName || 'Neighbor'},
          </p>
          {bodyHtml && (
            <div
              style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#333', lineHeight: 1.8, marginBottom: 16 }}
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          )}
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#333', lineHeight: 1.8, marginBottom: 8 }}>
            With Patriotic Pride,
          </p>
          {senderLines.length > 0 ? (
            <div style={{ marginBottom: noteIn ? 16 : 0 }}>
              {senderLines.map((line, i) => (
                <p key={i} style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#2D2D2D', margin: '2px 0', lineHeight: 1.6 }}>{line}</p>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', color: '#666', fontStyle: 'italic', marginBottom: noteIn ? 16 : 0 }}>
              {isAnonymous ? 'A grateful neighbor' : 'Your neighbor'}
            </p>
          )}
          {noteIn && (
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.88rem', fontStyle: 'italic', color: '#555', marginTop: 12, paddingTop: 12, borderTop: '1px solid #EEEEEE' }}>
              P.S. {noteIn}
            </p>
          )}
          {letterPdfUrl && (
            <a href={letterPdfUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: 16, padding: '8px 16px', background: '#FAF7F2', border: '1px solid #DDDDDD', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#1B2A4A', textDecoration: 'none' }}>
              📄 Download Letter PDF
            </a>
          )}
        </section>

        {/* 2. Dedication Frame */}
        {attributionName && (
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>Dedication</div>
            <div style={{
              background: '#1B2A4A', borderRadius: 6, padding: '20px 24px',
              borderTop: '3px solid #C5A028', borderBottom: '3px solid #C5A028',
              marginBottom: viewerRole === 'in' ? 20 : 0,
            }}>
              <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.65rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#C5A028', marginBottom: 8 }}>
                {attributionType === '121120001' ? 'In Memory Of' : 'In Honor Of'}
              </div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                {attributionName}
              </div>
              {attributionText && (
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: 0 }}>
                  &ldquo;{attributionText}&rdquo;
                </p>
              )}
            </div>

            {viewerRole === 'in' && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>Honoree Name</label>
                  <input type="text" value={attributionName} onChange={e => { setAttributionName(e.target.value); setAttributionSaved(false); }}
                    style={{ ...inputStyle, fontSize: '16px' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>About Them</label>
                  <textarea value={attributionText} onChange={e => { setAttributionText(e.target.value); setAttributionSaved(false); }}
                    rows={4} style={{ ...inputStyle, fontSize: '16px', resize: 'vertical' }} />
                </div>
                {attributionSaved && <p style={{ color: '#2E7D32', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', marginBottom: 8 }}>✓ Saved.</p>}
                <button onClick={handleSaveAttribution} disabled={attributionSaving}
                  style={{ padding: '8px 20px', background: '#1B2A4A', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  {attributionSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </section>
        )}

        {/* 3. Attribution Photo */}
        {(attributionPhotoUrl || viewerRole === 'in') && attributionName && (
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>Honoree Photo</div>
            {attributionPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={attributionPhotoUrl} alt={attributionName}
                style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8, marginBottom: 12, display: 'block' }} />
            )}
            {viewerRole === 'in' && (
              <>
                <input ref={attributionPhotoRef} type="file" accept="image/*" onChange={handleAttributionPhotoChange} style={{ display: 'none' }} />
                <button onClick={() => attributionPhotoRef.current?.click()} disabled={attributionPhotoUploading}
                  style={{ padding: '8px 16px', background: '#FFFFFF', border: '1.5px solid #1B2A4A', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#1B2A4A', cursor: 'pointer' }}>
                  {attributionPhotoUploading ? 'Uploading...' : attributionPhotoUrl ? '📷 Replace Photo' : '📷 Upload Photo'}
                </button>
                {!attributionPhotoUrl && (
                  <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888', marginTop: 8 }}>
                    Don&apos;t have a photo yet? You can upload one any time from this page.
                  </p>
                )}
              </>
            )}
          </section>
        )}

        {/* 4. Before Photo */}
        {(beforePhotoUrl || viewerRole === 'in') && (
          <section style={cardStyle}>
            <div style={sectionTitleStyle}>Before Photo</div>
            {beforePhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={beforePhotoUrl} alt="Before" style={{ width: '100%', borderRadius: 8, display: 'block' }} />
            ) : (
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>No before photo yet.</p>
            )}
          </section>
        )}

        {/* 5. After Photo */}
        <section style={cardStyle}>
          <div style={sectionTitleStyle}>📸 After Photo</div>
          {viewerRole === 'rn' || viewerRole === 'guest' ? (
            <>
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="After" style={{ width: '100%', borderRadius: 6, display: 'block', marginBottom: 16 }} />
              )}
              {userEmail ? (
                <>
                  <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
                    {previewUrl ? 'Replace your after photo by uploading a new one.' : 'Show your community how your banner looks! Upload a photo after installation.'}
                  </p>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={photoUploading}
                    style={{ ...btnSecondaryStyle, opacity: photoUploading ? 0.6 : 1, cursor: photoUploading ? 'not-allowed' : 'pointer' }}>
                    {photoUploading ? 'Uploading…' : previewUrl ? 'Replace Photo' : 'Upload After Photo'}
                  </button>
                  {photoUploaded && <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#2E7D32', marginTop: 12 }}>✓ Photo uploaded successfully!</p>}
                  {photoError && <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#C62828', marginTop: 12 }}>{photoError}</p>}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16, cursor: 'pointer' }}>
                    <input type="checkbox" checked={isPublicPhoto}
                      onChange={async (e) => {
                        setIsPublicPhoto(e.target.checked);
                        try {
                          await fetch('/api/banner/note', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bannerId, note: savedNote || '', isPublicNote, isPublicPhoto: e.target.checked }) });
                        } catch (err) { console.error('Failed to save photo preference:', err); }
                      }}
                      style={{ marginTop: 2, accentColor: '#C5A028', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>
                      ✓ Make my photos public — let BannerBeauty use my photos to inspire others 🇺🇸
                    </span>
                  </label>
                </>
              ) : (
                <div style={{ background: '#F5F5F5', borderRadius: 6, padding: '16px 20px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#666' }}>
                  <a href="/api/auth/signin?callbackUrl=/banner-bump" style={{ color: '#C5A028' }}>Sign in</a>
                  {' '}to upload an after photo and let your community see the result.
                </div>
              )}
            </>
          ) : (
            previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="After" style={{ width: '100%', borderRadius: 8, display: 'block' }} />
            ) : (
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
                The recipient hasn&apos;t uploaded an after photo yet.
              </p>
            )
          )}
        </section>

        {/* 6. IN Note */}
        <section style={cardStyle}>
          <div style={sectionTitleStyle}>💬 Note from {initiatingFirstName || 'Your Neighbor'}</div>
          {viewerRole === 'in' ? (
            <div>
              <textarea value={noteIn} onChange={e => { setNoteIn(e.target.value); setNoteInSaved(false); }}
                rows={4} placeholder="Add a personal note to your recipient..."
                style={{ ...inputStyle, fontSize: '16px', resize: 'vertical', marginBottom: 12 }} />
              {noteInSaved && <p style={{ color: '#2E7D32', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', marginBottom: 8 }}>✓ Saved.</p>}
              <button onClick={handleSaveNoteIn} disabled={noteInSaving || !noteIn.trim()}
                style={{ padding: '8px 20px', background: '#1B2A4A', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, cursor: noteInSaving ? 'not-allowed' : 'pointer', opacity: noteInSaving ? 0.6 : 1 }}>
                {noteInSaving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          ) : (
            noteIn ? (
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontStyle: 'italic', color: '#444', lineHeight: 1.7 }}>
                &ldquo;{noteIn}&rdquo;
              </p>
            ) : (
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>No note yet.</p>
            )
          )}
        </section>

        {/* 7. RN Note */}
        <section style={cardStyle}>
          <div style={sectionTitleStyle}>💬 Note from {recipientFirstName || 'Recipient'}</div>
          {viewerRole !== 'in' ? (
            userEmail ? (
              <>
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
                  Send a message of gratitude back to your neighbor.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Your Note</label>
                  <textarea value={noteText} onChange={e => { setNoteText(e.target.value); setNoteSaved(false); }}
                    rows={4} placeholder="Thank you so much for the kind gesture…"
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, cursor: 'pointer' }}>
                  <input type="checkbox" checked={isPublicNote}
                    onChange={async (e) => {
                      setIsPublicNote(e.target.checked);
                      try {
                        await fetch('/api/banner/note', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bannerId, note: savedNote || '', isPublicNote: e.target.checked, isPublicPhoto }) });
                      } catch (err) { console.error('Failed to save note preference:', err); }
                    }}
                    style={{ marginTop: 2, accentColor: '#C5A028', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>
                    ✓ Make my note public — let BannerBeauty share my response to inspire others 🇺🇸
                  </span>
                </label>
                {noteSaved && <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#2E7D32', marginBottom: 12 }}>✓ Your note has been saved.</p>}
                {noteError && <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#C62828', marginBottom: 12 }}>{noteError}</p>}
                <button type="button" onClick={handleSaveNote} disabled={noteSaving || !noteText.trim()}
                  style={{ ...btnPrimaryStyle, opacity: noteSaving || !noteText.trim() ? 0.6 : 1, cursor: noteSaving || !noteText.trim() ? 'not-allowed' : 'pointer' }}>
                  {noteSaving ? 'Saving…' : 'Save Note'}
                </button>
              </>
            ) : (
              <div style={{ background: '#F5F5F5', borderRadius: 6, padding: '16px 20px', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#666' }}>
                <a href="/api/auth/signin?callbackUrl=/banner-bump" style={{ color: '#C5A028' }}>Sign in</a>
                {' '}to send a thank-you note back to your neighbor.
              </div>
            )
          ) : (
            noteText ? (
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontStyle: 'italic', color: '#444', lineHeight: 1.7 }}>
                &ldquo;{noteText}&rdquo;
              </p>
            ) : (
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#AAAAAA' }}>
                The recipient hasn&apos;t left a note yet.
              </p>
            )
          )}
        </section>

        {/* 8. Gift Certificate */}
        {includesGC && (
          <section style={{ ...cardStyle, border: '2px solid #C5A028', background: 'linear-gradient(135deg, #FFFDF4, #FFF8E1)' }}>
            <div style={sectionTitleStyle}>🎁 Your Gift Certificate</div>
            {gcCode ? (
              <>
                <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#555', marginBottom: 16, lineHeight: 1.6 }}>
                  You&apos;ve received a gift certificate{gcAmount ? ` worth ${formatCurrency(gcAmount)}` : ''} to use in the Banner Beauty store.
                </p>
                <div style={{ background: '#FFFFFF', border: '1.5px solid #C5A028', borderRadius: 6, padding: '16px 20px', textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Your Code</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 'bold', color: '#1A1A2E', letterSpacing: '4px' }}>{gcCode}</div>
                </div>
                <a href="/store" style={btnPrimaryStyle}>Redeem in Store</a>
              </>
            ) : (
              <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#555' }}>
                Your gift certificate is being processed and will appear here shortly.
              </p>
            )}
          </section>
        )}

        {/* 9. Flag on its way */}
        {includesFlag && (
          <section style={{ ...cardStyle, border: '2px solid #1A1A2E', background: 'linear-gradient(135deg, #F0F4FF, #E8EDF8)' }}>
            <div style={sectionTitleStyle}>🇺🇸 Your Flag Is on Its Way</div>
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', color: '#333', lineHeight: 1.7, marginBottom: 0 }}>
              A brand-new American flag has been ordered and will be shipped to your address.
              Keep an eye on your mailbox — it&apos;s a gift from a grateful neighbor.
            </p>
          </section>
        )}

        {/* 10. Bump it Forward */}
        <section style={{ ...cardStyle, background: 'linear-gradient(135deg, #1A1A2E, #2E2E4A)', textAlign: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div style={{ marginBottom: 12 }}><img src="https://bannerbeautystorage.blob.core.windows.net/images/banner-bump.png" alt="Banner Bump" style={{ height: '1.5em', width: 'auto', display: 'block', margin: '0 auto' }} /></div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#C5A028', marginBottom: 12 }}>
            Bump It Forward
          </h2>
          <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem', color: '#CCCCCC', lineHeight: 1.7, marginBottom: 24 }}>
            Banner Bump another patriot in your community.<br />
            Keep the chain of gratitude going!
          </p>
          <a href="/submit-banner" style={btnPrimaryStyle}>Banner Bump a Patriot</a>
        </section>

      </div>
    </div>
  );
}
