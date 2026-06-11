'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface SelectedCity {
  city: string;
  state: string;
  county: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (data: SelectedCity) => void;
  placeholder?: string;
}

export default function CityAutocomplete({ value, onChange, onSelect, placeholder = 'Start typing a city...' }: Props) {
  const placesLib = useMapsLibrary('places');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const attributionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!placesLib) return;
    autocompleteService.current = new placesLib.AutocompleteService();
    if (attributionRef.current) {
      placesService.current = new placesLib.PlacesService(attributionRef.current);
    }
  }, [placesLib]);

  useEffect(() => {
    if (!autocompleteService.current || value.length < 2) {
      setSuggestions([]);
      return;
    }
    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'us' },
        types: ['(cities)'],
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setSuggestions(results);
        } else {
          setSuggestions([]);
        }
        setActiveIndex(-1);
      }
    );
  }, [value]);

  function handleSelect(prediction: google.maps.places.AutocompletePrediction) {
    if (!placesService.current) return;
    setSuggestions([]);

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['address_components'],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return;

        const components = place.address_components ?? [];
        const get = (type: string, short = false) => {
          const c = components.find(c => c.types.includes(type));
          return c ? (short ? c.short_name : c.long_name) : '';
        };

        const city = get('locality') || get('sublocality_level_1') || get('postal_town');
        const state = get('administrative_area_level_1', true);
        const county = get('administrative_area_level_2').replace(' County', '').replace(' Parish', '').replace(' Borough', '');

        onChange(city);
        onSelect({ city, state, county });
      }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  }

  const showDropdown = focused && suggestions.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{
          width: '100%',
          padding: '12px 14px',
          border: `1.5px solid ${focused ? '#1B2A4A' : '#DDDDDD'}`,
          borderRadius: 4,
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '16px',
          color: '#333333',
          background: '#FFFFFF',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
      />

      {showDropdown && (
        <ul style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#1B2A4A',
          borderRadius: 4,
          boxShadow: '0 6px 24px rgba(27,42,74,0.22)',
          listStyle: 'none',
          margin: 0,
          padding: '4px 0',
          zIndex: 9999,
          maxHeight: 260,
          overflowY: 'auto',
        }}>
          {suggestions.map((s, i) => (
            <li
              key={s.place_id}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setActiveIndex(i)}
              onTouchStart={(e) => e.preventDefault()}
              onTouchEnd={() => handleSelect(s)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontFamily: 'Trebuchet MS, sans-serif',
                fontSize: '0.88rem',
                lineHeight: 1.4,
                color: i === activeIndex ? '#C5A028' : 'rgba(255,255,255,0.85)',
                background: i === activeIndex ? 'rgba(197,160,40,0.12)' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <span style={{ fontWeight: 600 }}>{s.structured_formatting.main_text}</span>
              <span style={{ marginLeft: 6, fontSize: '0.8rem', opacity: 0.6 }}>{s.structured_formatting.secondary_text}</span>
            </li>
          ))}
        </ul>
      )}
      <div ref={attributionRef} style={{ display: 'none' }} />
    </div>
  );
}
