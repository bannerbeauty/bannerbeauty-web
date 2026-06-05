'use client';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface Props {
  locations: { lat: number; lng: number }[];
}

export default function BannerBumpMap({ locations }: Props) {
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
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1B2A4A"
                  stroke="#C5A028"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#243558' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {locations.map((loc, i) => (
            <Marker key={i} coordinates={[loc.lng, loc.lat]}>
              <circle r={4} fill="#B22234" opacity={0.8} />
            </Marker>
          ))}
        </ComposableMap>

        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '0.88rem',
          letterSpacing: '1px',
          color: '#C5A028',
          textAlign: 'center',
          margin: '20px 0 0',
        }}>
          {locations.length.toLocaleString()} location{locations.length !== 1 ? 's' : ''} across America
        </p>
      </div>
    </section>
  );
}
