'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminAnnouncement } from './page';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AnnouncementsClient({ announcements }: { announcements: AdminAnnouncement[] }) {
  const [localAnnouncements, setLocalAnnouncements] = useState(announcements);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newMessage.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/announcement/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, message: newMessage, imageUrl: newImageUrl }),
      });
      const data = await res.json();
      if (data.announcementId) {
        setLocalAnnouncements(prev => [{
          announcementId: data.announcementId,
          title: newTitle,
          message: newMessage,
          imageUrl: newImageUrl,
          isActive: true,
          createdOn: new Date().toISOString(),
        }, ...prev]);
        setNewTitle('');
        setNewMessage('');
        setNewImageUrl('');
        setCreating(false);
      }
    } catch { console.error('Create announcement failed'); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (announcementId: string, current: boolean) => {
    try {
      await fetch('/api/admin/announcement/toggle-active', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId, isActive: !current }),
      });
      setLocalAnnouncements(prev => prev.map(a => a.announcementId === announcementId ? { ...a, isActive: !current } : a));
    } catch { console.error('Toggle active failed'); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '0.88rem',
    fontFamily: 'Trebuchet MS, sans-serif',
    border: '1.5px solid #DDDDDD',
    borderRadius: 6,
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: 10,
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      <div style={{ background: '#1B2A4A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028' }}>
            Banner Beauty Admin
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Announcements
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

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px 80px' }}>

        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            style={{ marginBottom: 20, padding: '10px 20px', background: '#1B7A3E', color: '#FFFFFF', border: 'none', borderRadius: 6, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
          >
            + New Announcement
          </button>
        ) : (
          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 20, marginBottom: 20 }}>
            <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Title</label>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} style={inputStyle} placeholder="Banner Beauty Turns 1!" />
            <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Message</label>
            <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={4} style={inputStyle} placeholder="Thank you to every patriot..." />
            <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Image URL (optional)</label>
            <input type="text" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} style={inputStyle} placeholder="https://..." />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreate} disabled={saving} style={{ padding: '8px 20px', background: '#1B7A3E', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Posting...' : 'Post Announcement'}
              </button>
              <button onClick={() => { setCreating(false); setNewTitle(''); setNewMessage(''); setNewImageUrl(''); }} style={{ padding: '8px 20px', background: '#FFFFFF', color: '#888888', border: '1px solid #DDDDDD', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {localAnnouncements.map(a => (
          <div key={a.announcementId} style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 20, marginBottom: 12, opacity: a.isActive ? 1 : 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', fontSize: '1rem' }}>
                {a.title}
              </div>
              <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: a.isActive ? '#1B7A3E' : '#B22234' }}>
                {a.isActive ? 'Live' : 'Inactive'}
              </span>
            </div>
            <p style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#555555', lineHeight: 1.6, marginBottom: 8 }}>
              {a.message}
            </p>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA', marginBottom: 12 }}>
              Posted {formatDate(a.createdOn)}
            </div>
            <button
              onClick={() => handleToggleActive(a.announcementId, a.isActive)}
              style={{
                padding: '6px 14px',
                background: a.isActive ? '#FFFFFF' : '#1B7A3E',
                color: a.isActive ? '#B22234' : '#FFFFFF',
                border: a.isActive ? '1.5px solid #B22234' : 'none',
                borderRadius: 4,
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {a.isActive ? 'Take Down' : 'Re-activate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
