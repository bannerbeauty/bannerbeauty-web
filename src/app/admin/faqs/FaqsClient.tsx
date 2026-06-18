'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminFaq } from './page';

export default function FaqsClient({ faqs }: { faqs: AdminFaq[] }) {
  const [localFaqs, setLocalFaqs] = useState(faqs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const startEdit = (faq: AdminFaq) => {
    setEditingId(faq.faqId);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  const handleSave = async (faqId: string) => {
    setSaving(true);
    try {
      await fetch('/api/admin/faq/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqId, question: editQuestion, answer: editAnswer }),
      });
      setLocalFaqs(prev => prev.map(f => f.faqId === faqId ? { ...f, question: editQuestion, answer: editAnswer } : f));
      cancelEdit();
    } catch { console.error('Save FAQ failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (faqId: string) => {
    if (!confirm('Delete this FAQ entry?')) return;
    try {
      await fetch('/api/admin/faq/delete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqId }),
      });
      setLocalFaqs(prev => prev.filter(f => f.faqId !== faqId));
    } catch { console.error('Delete FAQ failed'); }
  };

  const handleCreate = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/faq/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
      });
      const data = await res.json();
      if (data.faqId) {
        setLocalFaqs(prev => [...prev, { faqId: data.faqId, question: newQuestion, answer: newAnswer }]);
        setNewQuestion('');
        setNewAnswer('');
        setCreating(false);
      }
    } catch { console.error('Create FAQ failed'); }
    finally { setSaving(false); }
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

      {/* Header */}
      <div style={{ background: '#1B2A4A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028' }}>
            Banner Beauty Admin
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            FAQs
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

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Add new FAQ button/form */}
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            style={{ marginBottom: 20, padding: '10px 20px', background: '#1B7A3E', color: '#FFFFFF', border: 'none', borderRadius: 6, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
          >
            + Add New FAQ
          </button>
        ) : (
          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 20, marginBottom: 20 }}>
            <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Question</label>
            <input type="text" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} style={inputStyle} placeholder="What is a Banner Bump?" />
            <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Answer (HTML)</label>
            <textarea value={newAnswer} onChange={e => setNewAnswer(e.target.value)} rows={6} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.82rem' }} placeholder="<p>Your answer here...</p>" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreate} disabled={saving} style={{ padding: '8px 20px', background: '#1B7A3E', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Create'}
              </button>
              <button onClick={() => { setCreating(false); setNewQuestion(''); setNewAnswer(''); }} style={{ padding: '8px 20px', background: '#FFFFFF', color: '#888888', border: '1px solid #DDDDDD', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* FAQ list */}
        {localFaqs.map(faq => (
          <div key={faq.faqId} style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 20, marginBottom: 12 }}>
            {editingId === faq.faqId ? (
              <>
                <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Question</label>
                <input type="text" value={editQuestion} onChange={e => setEditQuestion(e.target.value)} style={inputStyle} />
                <label style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 6 }}>Answer (HTML)</label>
                <textarea value={editAnswer} onChange={e => setEditAnswer(e.target.value)} rows={6} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.82rem' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleSave(faq.faqId)} disabled={saving} style={{ padding: '8px 20px', background: '#1B7A3E', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={cancelEdit} style={{ padding: '8px 20px', background: '#FFFFFF', color: '#888888', border: '1px solid #DDDDDD', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A', fontSize: '1rem', marginBottom: 8 }}>
                  {faq.question}
                </div>
                <div
                  style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#555555', lineHeight: 1.6, marginBottom: 12 }}
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(faq)} style={{ padding: '6px 14px', background: '#FFFFFF', color: '#1B2A4A', border: '1.5px solid #1B2A4A', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(faq.faqId)} style={{ padding: '6px 14px', background: '#FFFFFF', color: '#B22234', border: '1.5px solid #B22234', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
