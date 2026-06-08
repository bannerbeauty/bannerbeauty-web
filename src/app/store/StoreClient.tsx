'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface Product {
  bb_productid: string;
  bb_productname: string;
  bb_productnumber: string;
  bb_price: number;
  bb_producttype: number;
  imageUrl?: string;
  imageAlt?: string;
  materialLabel?: string | null;
  sizeLabel?: string | null;
}

interface CartItem {
  productid: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  producttype: number;
  imageUrl?: string;
}

const SIZE_ALL = 'All';
const MATERIAL_ALL = 'All';

const CATEGORIES = [
  { label: 'All', value: null },
  { label: 'Flags', value: 121120000 },
  { label: 'Poles', value: 121120001 },
  { label: 'Kits', value: 121120002 },
  { label: 'Accessories', value: 121120003 },
  { label: 'Gift Certificates', value: 121120004 },
];

function formatPrice(price: number) {
  return '$' + price.toFixed(2);
}

function getCart(): CartItem[] {
  try {
    const raw = sessionStorage.getItem('bb_cart');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(cart: CartItem[]) {
  sessionStorage.setItem('bb_cart', JSON.stringify(cart));
}

export default function StoreClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [activeSize, setActiveSize] = useState<string>(SIZE_ALL);
  const [activeMaterial, setActiveMaterial] = useState<string>(MATERIAL_ALL);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    setCart(getCart());
  }, []);

  // Close cart on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setCartOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock body scroll when cart is open
  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function addToCart(product: Product) {
    const updated = getCart();
    const existing = updated.find((i) => i.productid === product.bb_productid);
    if (existing) {
      existing.qty += 1;
    } else {
      updated.push({
        productid: product.bb_productid,
        name: product.bb_productname,
        sku: product.bb_productnumber,
        price: product.bb_price,
        qty: 1,
        producttype: product.bb_producttype,
        imageUrl: product.imageUrl,
      });
    }
    saveCart(updated);
    setCart(updated);
    setAddedId(product.bb_productid);
    setTimeout(() => setAddedId(null), 1800);
    setCartOpen(true);
  }

  function removeFromCart(productid: string) {
    const updated = cart.filter((i) => i.productid !== productid);
    saveCart(updated);
    setCart(updated);
  }

  function updateQty(productid: string, delta: number) {
    const updated = cart.map((i) =>
      i.productid === productid ? { ...i, qty: i.qty + delta } : i
    ).filter((i) => i.qty > 0);
    saveCart(updated);
    setCart(updated);
  }

  function proceedToCheckout() {
    if (cart.length === 0) return;
    setCartOpen(false);
    router.push('/checkout');
  }

  const availableCategories = [
    { label: 'All', value: null },
    ...CATEGORIES.slice(1).filter(cat => products.some(p => p.bb_producttype === cat.value)),
  ];

  const categoryFiltered = activeCategory === null
    ? products
    : products.filter(p => p.bb_producttype === activeCategory);

  const uniqueSizes = [SIZE_ALL, ...Array.from(new Set(categoryFiltered.filter(p => p.sizeLabel).map(p => p.sizeLabel as string))).sort()];
  const uniqueMaterials = [MATERIAL_ALL, ...Array.from(new Set(categoryFiltered.filter(p => p.materialLabel).map(p => p.materialLabel as string))).sort()];

  const filtered = categoryFiltered
    .filter(p => activeSize === SIZE_ALL || p.sizeLabel === activeSize)
    .filter(p => activeMaterial === MATERIAL_ALL || p.materialLabel === activeMaterial);

  return (
    <>
      <div style={{ background: '#FAF7F2', minHeight: '60vh' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 64px' }}>

          {/* Category filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '28px 0 32px' }}>
            {availableCategories.map((cat) => {
              const active = activeCategory === cat.value;
              return (
                <button
                  key={cat.label}
                  onClick={() => { setActiveCategory(cat.value); setActiveSize(SIZE_ALL); setActiveMaterial(MATERIAL_ALL); }}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 4,
                    border: active ? 'none' : '1.5px solid #CCCCCC',
                    background: active ? '#1B2A4A' : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#444444',
                    fontFamily: 'Trebuchet MS, sans-serif',
                    fontSize: '0.82rem',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Size filters */}
          {uniqueSizes.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {uniqueSizes.map((size) => {
                const active = activeSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setActiveSize(size)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 4,
                      border: active ? 'none' : '1.5px solid #CCCCCC',
                      background: active ? '#B22234' : '#FFFFFF',
                      color: active ? '#FFFFFF' : '#444444',
                      fontFamily: 'Trebuchet MS, sans-serif',
                      fontSize: '0.78rem',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      fontWeight: active ? 700 : 400,
                      transition: 'all 0.15s',
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}

          {/* Material filters */}
          {uniqueMaterials.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {uniqueMaterials.map((material) => {
                const active = activeMaterial === material;
                return (
                  <button
                    key={material}
                    onClick={() => setActiveMaterial(material)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 4,
                      border: active ? 'none' : '1.5px solid #CCCCCC',
                      background: active ? '#C5A028' : '#FFFFFF',
                      color: active ? '#FFFFFF' : '#444444',
                      fontFamily: 'Trebuchet MS, sans-serif',
                      fontSize: '0.78rem',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      fontWeight: active ? 700 : 400,
                      transition: 'all 0.15s',
                    }}
                  >
                    {material}
                  </button>
                );
              })}
            </div>
          )}

          {/* Product count */}
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', color: '#888888', marginBottom: 24 }}>
            Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </div>

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888888', fontFamily: 'Trebuchet MS, sans-serif' }}>
              No products found in this category.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
              {filtered.map((product) => {
                const isAdded = addedId === product.bb_productid;
                return (
                  <div
                    key={product.bb_productid}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #EEEEEE',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      boxShadow: '0 2px 8px rgba(27,42,74,0.06)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 28px rgba(27,42,74,0.14)';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(27,42,74,0.06)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Image */}
                    <div style={{ background: '#F5F5F5', aspectRatio: '4 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.imageAlt || product.bb_productname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '3rem', opacity: 0.3 }}>🇺🇸</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '20px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', color: '#AAAAAA', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>
                        {product.bb_productnumber}
                      </div>
                      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', margin: '0 0 8px 0', lineHeight: 1.3, flex: 1 }}>
                        {product.bb_productname}
                      </h3>
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#B22234', marginBottom: 16 }}>
                        {formatPrice(product.bb_price)}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link
                          href={`/store/product?sku=${product.bb_productnumber}`}
                          style={{ flex: 1, padding: '10px 0', border: '1.5px solid #1B2A4A', borderRadius: 4, color: '#1B2A4A', fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => addToCart(product)}
                          style={{ flex: 1, padding: '10px 0', background: isAdded ? '#1B7A3E' : '#B22234', border: 'none', borderRadius: 4, color: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          {isAdded ? '✓ Added' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart FAB */}
      <button
        onClick={() => setCartOpen(true)}
        aria-label="Open cart"
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          background: '#B22234',
          borderRadius: '50%',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(178,34,52,0.4)',
          zIndex: 999,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <span style={{ fontSize: '1.4rem' }}>🛒</span>
        {cartCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 20,
            height: 20,
            background: '#C5A028',
            borderRadius: '50%',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',justifyContent: 'center',
          }}>
            {cartCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {cartOpen && (
        <div
          onClick={() => setCartOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
          }}
        />
      )}

      {/* Cart sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: cartOpen ? 0 : -420,
        width: 420,
        height: '100vh',
        background: '#FFFFFF',
        zIndex: 1001,
        transition: 'right 0.3s',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1B2A4A' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>
            Your Cart
          </span>
          <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAAAAA', fontFamily: 'Georgia, serif' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🛒</div>
              <div>Your cart is empty</div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productid} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #EEEEEE' }}>
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 60, height: 60, background: '#F0F4FA', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>🇺🇸</div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 4 }}>{item.name}</div>
                  <div style={{ fontSize: '0.88rem', color: '#B22234', fontWeight: 700, marginBottom: 6 }}>{formatPrice(item.price * item.qty)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => updateQty(item.productid, -1)} style={{ width: 24, height: 24, border: '1px solid #DDDDDD', borderRadius: 4, background: '#FFFFFF', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.9rem' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.productid, 1)} style={{ width: 24, height: 24, border: '1px solid #DDDDDD', borderRadius: 4, background: '#FFFFFF', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.productid)} style={{ background: 'none', border: 'none', color: '#AAAAAA', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#B22234'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#AAAAAA'; }}
                >×</button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #EEEEEE' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem', color: '#666666', fontFamily: 'Trebuchet MS, sans-serif' }}>
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem', color: '#666666', fontFamily: 'Trebuchet MS, sans-serif' }}>
              <span>Shipping</span><span>Calculated at checkout</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem', color: '#666666', fontFamily: 'Trebuchet MS, sans-serif' }}>
              <span>Tax</span><span>Calculated at checkout</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #EEEEEE', fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1B2A4A' }}>
              <span>Total</span><span>{formatPrice(subtotal)} + fees</span>
            </div>
          </div>
          <button
            onClick={proceedToCheckout}
            disabled={cart.length === 0}
            style={{ width: '100%', padding: 16, background: cart.length === 0 ? '#CCCCCC' : '#B22234', color: '#FFFFFF', border: 'none', borderRadius: 4, fontFamily: 'Georgia, serif', fontSize: '1.05rem', fontWeight: 700, cursor: cart.length === 0 ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </>
  );
}
