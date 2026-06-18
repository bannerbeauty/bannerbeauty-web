'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ProductDetail, ProductImage } from './page';

const PRODUCT_TYPES = [
  { value: 121120000, label: 'Flag' },
  { value: 121120001, label: 'Pole' },
  { value: 121120002, label: 'Kit' },
  { value: 121120003, label: 'Accessory' },
  { value: 121120004, label: 'Gift Certificate' },
  { value: 121120005, label: 'Letter' },
  { value: 121120006, label: 'Fee' },
];

const PRODUCT_MATERIALS = [
  { value: 121120000, label: 'Cloth' },
  { value: 121120001, label: 'Nylon' },
  { value: 121120002, label: 'Aluminum' },
  { value: 121120003, label: 'Steel' },
  { value: 121120004, label: 'Plastic' },
  { value: 121120005, label: 'Paper' },
  { value: 121120006, label: 'Digital' },
  { value: 121120007, label: 'Polyester' },
];

const PRODUCT_SIZES = [
  { value: 121120000, label: "2' x 3'" },
  { value: 121120001, label: "2 1/2' x 4'" },
  { value: 121120002, label: "3' x 5'" },
  { value: 121120003, label: "4' x 6'" },
  { value: 121120004, label: "5' x 8'" },
  { value: 121120005, label: "5' x 9 1/2'" },
  { value: 121120006, label: "6' x 10'" },
  { value: 121120007, label: "8' x 12'" },
  { value: 121120008, label: "10' x 15'" },
  { value: 121120009, label: "10' x 19'" },
  { value: 121130000, label: "15'" },
  { value: 121130001, label: "20'" },
  { value: 121130002, label: "25'" },
  { value: 121140000, label: 'XS' },
  { value: 121140001, label: 'S' },
  { value: 121140002, label: 'M' },
  { value: 121140003, label: 'L' },
  { value: 121140004, label: 'XL' },
  { value: 121140005, label: 'XXL' },
  { value: 121140006, label: 'XXXL' },
];

const STOCK_STATUSES = [
  { value: 121120000, label: 'In Stock' },
  { value: 121120001, label: 'Out of Stock' },
  { value: 121120002, label: 'Discontinued' },
];

interface Props {
  product: ProductDetail | null;
  isNew: boolean;
}

export default function ProductEditClient({ product, isNew }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productNumber, setProductNumber] = useState(product?.productNumber ?? '');
  const [productName, setProductName] = useState(product?.productName ?? '');
  const [productType, setProductType] = useState(product?.productType ?? 121120000);
  const [productMaterial, setProductMaterial] = useState(product?.productMaterial ?? '');
  const [productSize, setProductSize] = useState(product?.productSize ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [displayInStore, setDisplayInStore] = useState(product?.displayInStore ?? true);
  const [stripeTaxCode, setStripeTaxCode] = useState(product?.stripeTaxCode ?? '');
  const [productDescription, setProductDescription] = useState(product?.productDescription ?? '');
  const [sortOrder, setSortOrder] = useState(product?.sortOrder?.toString() ?? '0');
  const [stockStatus, setStockStatus] = useState(product?.stockStatus ?? 121120000);
  const [heightIn, setHeightIn] = useState(product?.heightIn?.toString() ?? '');
  const [lengthIn, setLengthIn] = useState(product?.lengthIn?.toString() ?? '');
  const [widthIn, setWidthIn] = useState(product?.widthIn?.toString() ?? '');
  const [weightOz, setWeightOz] = useState(product?.weightOz?.toString() ?? '');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    setUploading(true);
    try {
      const res = await fetch('/api/admin/product/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': file.type, 'x-filename': file.name },
        body: file,
      });
      const data = await res.json();
      if (data.url) {
        const createRes = await fetch('/api/admin/product/add-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.productId, imageUrl: data.url, sortOrder: images.length }),
        });
        const createData = await createRes.json();
        setImages(prev => [...prev, { imageId: createData.imageId, imageUrl: data.url, altText: '', isPrimary: images.length === 0, sortOrder: images.length }]);
      }
    } catch { setError('Image upload failed.'); }
    finally { setUploading(false); }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await fetch('/api/admin/product/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });
      setImages(prev => prev.filter(img => img.imageId !== imageId));
    } catch { console.error('Delete image failed'); }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        productId: product?.productId,
        productNumber,
        productName,
        productType,
        productMaterial: productMaterial === '' ? null : Number(productMaterial),
        productSize: productSize === '' ? null : Number(productSize),
        price: parseFloat(price) || 0,
        displayInStore,
        stripeTaxCode,
        productDescription,
        sortOrder: parseInt(sortOrder) || 0,
        stockStatus,
        heightIn: heightIn === '' ? null : parseFloat(heightIn),
        lengthIn: lengthIn === '' ? null : parseFloat(lengthIn),
        widthIn: widthIn === '' ? null : parseFloat(widthIn),
        weightOz: weightOz === '' ? null : parseFloat(weightOz),
        isActive,
      };

      const res = await fetch(isNew ? '/api/admin/product/create' : '/api/admin/product/update-full', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Save failed.');
        return;
      }
      router.push('/admin/products');
    } catch {
      setError('Save failed.');
    } finally {
      setSaving(false);
    }
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
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Trebuchet MS, sans-serif',
    fontSize: '0.72rem',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: 6,
  };

  const fieldWrap: React.CSSProperties = { marginBottom: 16 };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      <div style={{ background: '#1B2A4A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028' }}>
            Banner Beauty Admin
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            {isNew ? 'New Product' : 'Edit Product'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/admin/products" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Products
          </Link>
          <Link href="/admin/dashboard" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px 80px' }}>

        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', padding: 24 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Product Number</label>
              <input type="text" value={productNumber} onChange={e => setProductNumber(e.target.value)} style={inputStyle} placeholder="PN-FLAG-3x5-N" />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Price</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Product Name</label>
            <input type="text" value={productName} onChange={e => setProductName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Product Type</label>
              <select value={productType} onChange={e => setProductType(Number(e.target.value))} style={inputStyle}>
                {PRODUCT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Material</label>
              <select value={productMaterial} onChange={e => setProductMaterial(e.target.value)} style={inputStyle}>
                <option value="">—</option>
                {PRODUCT_MATERIALS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Size</label>
              <select value={productSize} onChange={e => setProductSize(e.target.value)} style={inputStyle}>
                <option value="">—</option>
                {PRODUCT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Description</label>
            <textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Stock Status</label>
              <select value={stockStatus} onChange={e => setStockStatus(Number(e.target.value))} style={inputStyle}>
                {STOCK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Sort Order</label>
              <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={inputStyle} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Stripe Tax Code</label>
              <input type="text" value={stripeTaxCode} onChange={e => setStripeTaxCode(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginTop: 8, marginBottom: 12 }}>
            Shipping Dimensions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Height (in)</label>
              <input type="number" step="0.01" value={heightIn} onChange={e => setHeightIn(e.target.value)} style={inputStyle} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Length (in)</label>
              <input type="number" step="0.01" value={lengthIn} onChange={e => setLengthIn(e.target.value)} style={inputStyle} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Width (in)</label>
              <input type="number" step="0.01" value={widthIn} onChange={e => setWidthIn(e.target.value)} style={inputStyle} />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Weight (oz)</label>
              <input type="number" step="0.01" value={weightOz} onChange={e => setWeightOz(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 16, marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B2A4A', cursor: 'pointer' }}>
              <input type="checkbox" checked={displayInStore} onChange={e => setDisplayInStore(e.target.checked)} />
              Display in Store
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', color: '#1B2A4A', cursor: 'pointer' }}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              Active
            </label>
          </div>

          {/* Images section — only for existing products */}
          {!isNew && product && (
            <>
              <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginTop: 24, marginBottom: 12 }}>
                Product Images
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                {images.map(img => (
                  <div key={img.imageId} style={{ position: 'relative', width: 100, height: 100 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl} alt={img.altText} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6, border: img.isPrimary ? '2px solid #C5A028' : '1px solid #EEEEEE' }} />
                    <button
                      onClick={() => handleDeleteImage(img.imageId)}
                      style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#B22234', color: '#FFFFFF', border: 'none', fontSize: '0.7rem', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ padding: '8px 16px', background: '#FFFFFF', border: '1.5px solid #1B2A4A', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#1B2A4A', cursor: 'pointer' }}
              >
                {uploading ? 'Uploading...' : '+ Add Image'}
              </button>
            </>
          )}

          {error && <p style={{ color: '#B22234', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.85rem', marginTop: 16 }}>{error}</p>}

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '12px 28px', background: '#1B7A3E', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
            </button>
            <Link href="/admin/products" style={{ padding: '12px 28px', background: '#FFFFFF', color: '#888888', border: '1px solid #DDDDDD', borderRadius: 4, fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.88rem', textDecoration: 'none' }}>
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
