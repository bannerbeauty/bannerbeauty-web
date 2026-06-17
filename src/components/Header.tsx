'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS_LOGGED_OUT = [
  { label: 'Home', href: '/' },
  { label: 'Banner Bump', href: '/submit-banner' },
  { label: 'Store', href: '/store' },
];

const NAV_LINKS_LOGGED_IN = [
  { label: 'Community', href: '/community' },
  { label: 'Banner Bump', href: '/submit-banner' },
  { label: 'Store', href: '/store' },
];

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => setIsLoggedIn(data.isLoggedIn ?? false))
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    setIsLoggedIn(false);
    setDropdownOpen(false);
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleSignIn = () => {
    router.push('/signin');
    setMenuOpen(false);
  };

  const NAV_LINKS = isLoggedIn ? NAV_LINKS_LOGGED_IN : NAV_LINKS_LOGGED_OUT;

  return (
    <>
      <header style={{ background: '#1B2A4A', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Image
              src="https://bannerbeautystorage.blob.core.windows.net/logos/bannerbeauty-wordmark-logo-horizontal-white-banner.png"
              alt="BannerBeauty"
              width={200}
              height={46}
              style={{ height: 46, width: 'auto', objectFit: 'contain' }}
              className="bb-logo-desktop"
              priority
              unoptimized
            />
            <Image
              src="https://bannerbeautystorage.blob.core.windows.net/logos/bannerbeauty-wordmark-logo-horizontal-white-banner.png"
              alt="BannerBeauty"
              width={125}
              height={39}
              style={{ height: 39, width: 'auto', objectFit: 'contain' }}
              className="bb-logo-mobile"
              priority
              unoptimized
            />
          </Link>

          {/* Desktop nav */}
          <nav className="bb-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  fontSize: '0.88rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  opacity: 0.85,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth */}
            {isLoggedIn ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    fontFamily: 'Georgia, serif',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  My Account
                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    background: '#FFFFFF',
                    borderRadius: 6,
                    boxShadow: '0 4px 20px rgba(27,42,74,0.18)',
                    minWidth: 160,
                    overflow: 'hidden',
                  }}>
                    <Link href="/profile" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#1B2A4A', textDecoration: 'none', borderBottom: '1px solid #EEEEEE' }}>
                      My Profile
                    </Link>
                    <Link href="/my-activity" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#1B2A4A', textDecoration: 'none', borderBottom: '1px solid #EEEEEE' }}>
                      My Activity
                    </Link>
                    <button onClick={handleSignOut}
                      style={{ display: 'block', width: '100%', padding: '12px 16px', fontFamily: 'Georgia, serif', fontSize: '0.88rem', color: '#B22234', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                style={{
                  background: '#B22234',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 4,
                  padding: '10px 20px',
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#8B1A27')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#B22234')}
              >
                Sign In
              </button>
            )}
          </nav>

          {/* Hamburger */}
          <button
            className="bb-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: 'block',
                width: 24,
                height: 2,
                background: '#FFFFFF',
                borderRadius: 2,
                transition: 'transform 0.2s, opacity 0.2s',
                transformOrigin: 'center',
                transform: menuOpen
                  ? i === 0 ? 'translateY(7px) rotate(45deg)'
                  : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                  : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: '#152338', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px 24px' }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', color: '#FFFFFF', textDecoration: 'none', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.95rem', letterSpacing: '1px', textTransform: 'uppercase', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {link.label}
              </Link>
            ))}
            <div style={{ marginTop: 16 }}>
              {isLoggedIn ? (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)}
                    style={{ display: 'block', color: '#C5A028', textDecoration: 'none', fontFamily: 'Georgia, serif', fontSize: '0.95rem', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    My Profile
                  </Link>
                  <Link href="/my-activity" onClick={() => setMenuOpen(false)}
                    style={{ display: 'block', color: '#C5A028', textDecoration: 'none', fontFamily: 'Georgia, serif', fontSize: '0.95rem', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    My Activity
                  </Link>
                  <button onClick={handleSignOut}
                    style={{ marginTop: 12, background: 'none', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, color: '#FFFFFF', padding: '10px 20px', fontFamily: 'Georgia, serif', fontSize: '0.88rem', cursor: 'pointer', width: '100%' }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <button onClick={handleSignIn}
                  style={{ marginTop: 4, background: '#B22234', color: '#FFFFFF', border: 'none', borderRadius: 4, padding: '12px 24px', fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <style>{`
        .bb-logo-mobile { display: none !important; }
        .bb-hamburger { display: none !important; }
        @media (max-width: 768px) {
          .bb-nav-desktop { display: none !important; }
          .bb-logo-desktop { display: none !important; }
          .bb-logo-mobile { display: block !important; }
          .bb-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
