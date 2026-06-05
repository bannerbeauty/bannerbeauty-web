'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

interface Props {
  locations: { lat: number; lng: number }[];
}

type UsTopology = Topology<{
  states: GeometryCollection;
  nation: GeometryCollection;
}>;

export default function BannerBumpMap({ locations }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [topoData, setTopoData] = useState<UsTopology | null>(null);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json')
      .then(r => r.json())
      .then((data: UsTopology) => {
        setTopoData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!topoData || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 900;
    const height = Math.round(width * 0.625); // 16:10 ratio matches AlbersUSA

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

    const scale = width / 960;
    const projection = d3.geoAlbersUsa().fitSize([width, height], { type: 'Sphere' });
    const pathGenerator = d3.geoPath().projection(projection);

    const states = topojson.feature(topoData, topoData.objects.states) as GeoJSON.FeatureCollection;
    const nation = topojson.mesh(topoData, topoData.objects.nation);
    const stateBorders = topojson.mesh(topoData, topoData.objects.states, (a, b) => a !== b);

    // State fills
    svg.append('g')
      .selectAll('path')
      .data(states.features)
      .join('path')
      .attr('fill', '#1B2A4A')
      .attr('d', pathGenerator);

    // Nation outline
    svg.append('path')
      .datum(nation)
      .attr('fill', 'none')
      .attr('stroke', '#C5A028')
      .attr('stroke-width', 1 * scale)
      .attr('d', pathGenerator);

    // State borders
    svg.append('path')
      .datum(stateBorders)
      .attr('fill', 'none')
      .attr('stroke', '#C5A028')
      .attr('stroke-width', 0.5 * scale)
      .attr('d', pathGenerator);

    // Dots
    const dotGroup = svg.append('g');
    for (const loc of locations) {
      const coords = projection([loc.lng, loc.lat]);
      if (!coords) continue;
      const [x, y] = coords;

      // Pulse ring
      dotGroup.append('circle')
        .attr('cx', x).attr('cy', y)
        .attr('r', 3 * scale)
        .attr('fill', 'none')
        .attr('stroke', '#B22234')
        .attr('stroke-width', 1 * scale)
        .attr('opacity', 0.4)
        .attr('class', 'bb-pulse');

      // Main dot
      dotGroup.append('circle')
        .attr('cx', x).attr('cy', y)
        .attr('r', 3 * scale)
        .attr('fill', '#B22234')
        .attr('opacity', 0.8)
        .style('filter', 'drop-shadow(0 0 2px rgba(178,34,52,0.6))');
    }
  }, [topoData, locations]);

  // Redraw on resize
  useEffect(() => {
    if (!topoData) return;
    const observer = new ResizeObserver(() => {
      if (!svgRef.current || !containerRef.current || !topoData) return;
      // Trigger re-render by dispatching a synthetic state change
      setTopoData(prev => prev ? { ...prev } : prev);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [topoData]);

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

        <div ref={containerRef} style={{ width: '100%', lineHeight: 0 }}>
          {loading ? (
            <p style={{
              fontFamily: 'Trebuchet MS, sans-serif',
              fontSize: '0.88rem',
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
              padding: '60px 0',
              margin: 0,
              lineHeight: 1,
            }}>
              Loading map...
            </p>
          ) : (
            <svg
              ref={svgRef}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          )}
        </div>

        {!loading && (
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
        )}
      </div>

      <style>{`
        @keyframes bb-pulse {
          0%, 100% { r: 3; opacity: 0.4; }
          50% { r: 6; opacity: 0; }
        }
        .bb-pulse {
          animation: bb-pulse 2.5s ease-out infinite;
        }
      `}</style>
    </section>
  );
}
