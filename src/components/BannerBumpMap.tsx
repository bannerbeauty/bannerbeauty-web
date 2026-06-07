'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface Props {
  locations: { lat: number; lng: number }[];
  stateTotals: Record<string, number>;
  totalCount: number;
}

export default function BannerBumpMap({ locations, stateTotals, totalCount }: Props) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const activeState = selectedState || hoveredState;
  const activeCount = activeState ? (stateTotals[activeState] ?? 0) : null;

  return (
    <section style={{ background: '#1B2A4A', padding: '72px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1.08rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#C5A028',
          textAlign: 'center',
          margin: '0 0 32px',
        }}>
          ★ Spreading Patriotism Across America ★
        </p>

        <ComposableMap
          projection="geoAlbersUsa"
          style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map(geo => {
                const name = geo.properties.name;
                const isSelected = selectedState === name;
                const isHovered = hoveredState === name;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHoveredState(name)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => setSelectedState(isSelected ? null : name)}
                    fill={isSelected ? '#B22234' : isHovered ? '#243558' : '#FAF7F2'}
                    stroke="#C5A028"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {locations.map((loc, i) => (
            <Marker key={i} coordinates={[loc.lng, loc.lat]}>
              <circle r={4} fill="#C5A028" opacity={0.9} />
            </Marker>
          ))}
        </ComposableMap>

        {/* Stats display */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          gap: 0,
          marginTop: 32,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid rgba(197,160,40,0.3)',
        }}>
          {/* Nationwide */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            padding: '24px 32px',
            textAlign: 'center',
            borderRight: '1px solid rgba(197,160,40,0.3)',
          }}>
            <div style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.75rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#C5A028',
              marginBottom: 8,
            }}>
              🇺🇸 Nationwide
            </div>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1,
            }}>
              {totalCount.toLocaleString()}
            </div>
            <div style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.5)',
              marginTop: 6,
            }}>
              Banner Bump{totalCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* State */}
          <div style={{
            flex: 1,
            background: activeState ? 'rgba(178,34,52,0.15)' : 'rgba(255,255,255,0.02)',
            padding: '24px 32px',
            textAlign: 'center',
            transition: 'background 0.2s',
          }}>
            <div style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.75rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#C5A028',
              marginBottom: 8,
            }}>
              📍 {activeState ?? 'Select a State'}
            </div>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: activeState ? '#FFFFFF' : 'rgba(255,255,255,0.2)',
              lineHeight: 1,
              transition: 'color 0.2s',
            }}>
              {activeCount !== null ? activeCount.toLocaleString() : '—'}
            </div>
            <div style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.5)',
              marginTop: 6,
            }}>
              {activeCount !== null ? `Banner Bump${activeCount !== 1 ? 's' : ''}` : 'Hover or tap a state'}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
