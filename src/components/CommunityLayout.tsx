'use client';

import { useState, useEffect, useRef } from 'react';
import CommunitySidebar from '@/components/CommunitySidebar';
import type { SidebarData } from '@/lib/community-sidebar';

const HEADER_H = 64;
const TAB_BAR_H = 52;
const PANEL_TOP = HEADER_H + TAB_BAR_H;

interface Props {
  sidebarData: SidebarData;
  children: React.ReactNode;
  // Optional tab bar for pages that need it (community feed)
  tabBar?: React.ReactNode;
  // Suppress the avatar panel-toggle bar on mobile (e.g. brigade detail has its own back nav)
  hideAvatarBar?: boolean;
  // Enable three-column desktop layout with an optional right panel
  threeColumn?: boolean;
  rightPanel?: React.ReactNode;
}

export default function CommunityLayout({ sidebarData, children, tabBar, hideAvatarBar, threeColumn, rightPanel }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const captureDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.add('hide-footer');
    return () => document.body.classList.remove('hide-footer');
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (panelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [panelOpen]);

  // Touch capture overlay handlers
  const handleCaptureTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleCaptureTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (deltaY > 30) return;
    if (deltaX < -50) setPanelOpen(false);
  };

  useEffect(() => {
    if (!panelOpen) return;
    const el = captureDivRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => e.preventDefault();
    el.addEventListener('touchmove', handler, { passive: false });
    return () => el.removeEventListener('touchmove', handler);
  }, [panelOpen]);

  // Feed touch handlers
  const handleFeedTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleFeedTouchEnd = (e: React.TouchEvent) => {
    if (panelOpen) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (deltaY > 30) return;
    if (deltaX > 50) setPanelOpen(true);
  };

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (isMobile) {
    const effectivePanelTop = hideAvatarBar ? HEADER_H : PANEL_TOP;

    return (
      <div style={{ background: '#FAF7F2', minHeight: '100vh', position: 'relative' }}>

        {/* Fixed left panel */}
        <div style={{
          position: 'fixed',
          top: effectivePanelTop,
          left: 0,
          bottom: 0,
          width: '85%',
          background: '#FFFFFF',
          borderRight: '1px solid #EEEEEE',
          overflowY: 'auto',
          zIndex: 50,
        }}>
          <CommunitySidebar data={sidebarData} onNavigate={() => setPanelOpen(false)} />
        </div>

        {/* Fixed tab bar */}
        {tabBar ? (
          <div style={{
            position: 'fixed',
            top: HEADER_H,
            left: 0,
            right: 0,
            height: TAB_BAR_H,
            zIndex: 90,
          }}>
            {tabBar}
          </div>
        ) : !hideAvatarBar && (
          /* Simple avatar bar for non-feed pages */
          <div style={{
            position: 'fixed',
            top: HEADER_H,
            left: 0,
            right: 0,
            height: TAB_BAR_H,
            background: '#1B2A4A',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}>
            <button
              onClick={() => setPanelOpen(v => !v)}
              style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sidebarData.neighbor.profileImageUrl || ''}
                alt="Menu"
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${panelOpen ? '#C5A028' : 'rgba(197,160,40,0.5)'}`, display: 'block' }}
              />
            </button>
          </div>
        )}

        {/* Touch capture overlay */}
        {panelOpen && (
          <div
            ref={captureDivRef}
            onTouchStart={handleCaptureTouchStart}
            onTouchEnd={handleCaptureTouchEnd}
            style={{
              position: 'fixed',
              top: effectivePanelTop,
              left: '85%',
              right: 0,
              bottom: 0,
              zIndex: 65,
              background: 'transparent',
            }}
          />
        )}

        {/* Feed */}
        <div
          onTouchStart={handleFeedTouchStart}
          onTouchEnd={handleFeedTouchEnd}
          style={{
            position: 'fixed',
            top: effectivePanelTop,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            transform: panelOpen ? 'translateX(85%)' : 'translateX(0)',
            transition: 'transform 0.3s ease',
            background: '#FAF7F2',
            overflowY: panelOpen ? 'hidden' : 'auto',
            boxShadow: '-8px 0 16px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ pointerEvents: panelOpen ? 'none' : 'auto' }}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  const stickyTop = tabBar ? HEADER_H + TAB_BAR_H : HEADER_H;
  const stickyTopOffset = stickyTop + 12;

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      {tabBar && (
        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#1B2A4A' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            {tabBar}
          </div>
        </div>
      )}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: threeColumn ? '260px 1fr 280px' : '260px 1fr', gap: 24 }}>
        {/* Left sidebar */}
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #EEEEEE', marginTop: 24, position: 'sticky', top: stickyTopOffset, alignSelf: 'start', maxHeight: `calc(100vh - ${stickyTopOffset}px)`, overflowY: 'auto' }}>
          <CommunitySidebar data={sidebarData} />
        </div>
        {/* Main content */}
        <div style={{ paddingTop: 24, paddingBottom: 80 }}>
          {children}
        </div>
        {/* Right panel (three-column layout) */}
        {threeColumn && rightPanel && (
          <div style={{ marginTop: 24, position: 'sticky', top: stickyTopOffset, alignSelf: 'start', maxHeight: `calc(100vh - ${stickyTopOffset}px)`, overflowY: 'auto' }}>
            {rightPanel}
          </div>
        )}
      </div>
    </div>
  );
}
