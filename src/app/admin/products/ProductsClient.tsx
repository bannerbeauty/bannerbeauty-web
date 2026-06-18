'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AdminProduct } from './page';

export default function ProductsClient({ products }: { products: AdminProduct[] }) {
  const [localProducts, setLocalProducts] = useState(products);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = (p: AdminProduct) => {
    setEditingId(p.productId);
    setEditName(p.name);
    setEditPrice(p.price.toString());
  };

  const handleSave = async (productId: string) => {
    setSaving(true);
    try {
      await fetch('/api/admin/product/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, name: editName, price: parseFloat(editPrice) }),
      });
      setLocalProducts(prev => prev.map(p => p.productId === productId ? { ...p, name: editName, price: parseFloat(editPrice) } : p));
      setEditingId(null);
    } catch { console.error('Save product failed'); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (productId: string, currentValue: boolean) => {
    try {
      await fetch('/api/admin/product/toggle-active', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isActive: !currentValue }),
      });
      setLocalProducts(prev => prev.map(p => p.productId === productId ? { ...p, isActive: !currentValue } : p));
    } catch { console.error('Toggle active failed'); }
  };

  // Group by type
  const grouped = localProducts.reduce((acc, p) => {
    const key = p.productTypeLabel || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, AdminProduct[]>);

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    fontSize: '0.85rem',
    fontFamily: 'Trebuchet MS, sans-serif',
    border: '1.5px solid #DDDDDD',
    borderRadius: 4,
    outline: 'none',
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
            Products
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px' }}>

        {Object.entries(grouped).map(([type, items]) => (
          <div key={type} style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888888', marginBottom: 10 }}>
              {type}
            </div>
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', overflow: 'hidden' }}>
              {items.map((p, i) => (
                <div key={p.productId} style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 100px 80px 100px',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  borderBottom: i < items.length - 1 ? '1px solid #F5F5F5' : 'none',
                  opacity: p.isActive ? 1 : 0.5,
                }}>
                  <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888' }}>
                    {p.productNumber}
                  </div>

                  {editingId === p.productId ? (
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                  ) : (
                    <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', color: '#1B2A4A', fontWeight: 600 }}>
                      {p.name}
                    </div>
                  )}

                  {editingId === p.productId ? (
                    <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ ...inputStyle, width: 80 }} />
                  ) : (
                    <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#1B2A4A' }}>
                      ${p.price.toFixed(2)}
                    </div>
                  )}

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: p.isActive ? '#1B7A3E' : '#B22234' }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    {editingId === p.productId ? (
                      <>
                        <button onClick={() => handleSave(p.productId)} disabled={saving}
                          style={{ padding: '4px 10px', background: '#1B7A3E', color: '#FFFFFF', border: 'none', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)}
                          style={{ padding: '4px 10px', background: '#FFFFFF', color: '#888888', border: '1px solid #DDDDDD', borderRadius: 4, fontSize: '0.7rem', cursor: 'pointer' }}>
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(p)}
                          style={{ padding: '4px 10px', background: '#FFFFFF', color: '#1B2A4A', border: '1px solid #1B2A4A', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                          Edit
                        </button>
                        <button onClick={() => handleToggleActive(p.productId, p.isActive)}
                          style={{ padding: '4px 10px', background: '#FFFFFF', color: p.isActive ? '#B22234' : '#1B7A3E', border: `1px solid ${p.isActive ? '#B22234' : '#1B7A3E'}`, borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                          {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
