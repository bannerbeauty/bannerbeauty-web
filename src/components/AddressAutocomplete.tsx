'use client';

import { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface SelectedAddress {
  address1: string;
  city: string;
  state: string;
  zipcode: string;
  lat: number;
  lng: number;
}

interface Props {
  onAddressSelect: (address: SelectedAddress) => void;
  placeholder?: string;
  defaultValue?: string;
}

export default function AddressAutocomplete({ onAddressSelect, placeholder = 'Start typing an address...', defaultValue = '' }: Props) {
  const placesLib = useMapsLibrary('places');
  const [inputValue, setInputValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const attributionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!placesLib) return;
    autocompleteService.current = new placesLib.AutocompleteService();
    if (attributionRef.current) {
      placesService.current = new placesLib.PlacesService(attributionRef.current);
    }
  }, [placesLib]);

  useEffect(() => {
    if (!autocompleteService.current || inputValue.length < 3) {
      setSuggestions([]);
      return;
    }
    autocompleteService.current.getPlacePredictions(
      {
        input: inputValue,
        componentRestrictions: { country: 'us' },
        types: ['address'],
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
  }, [inputValue]);

  function selectSuggestion(prediction: google.maps.places.AutocompletePrediction) {
    if (!placesService.current) return;
    setInputValue(prediction.description);
    setSuggestions([]);

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['address_components', 'geometry'],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return;

        const components = place.address_components ?? [];
        const get = (type: string, short = false) => {
          const c = components.find(c => c.types.includes(type));
          return c ? (short ? c.short_name : c.long_name) : '';
        };

        const streetNumber = get('street_number');
        const route = get('route');
        const address1 = [streetNumber, route].filter(Boolean).join(' ');
        const city = get('locality') || get('sublocality_level_1');
        const state = get('administrative_area_level_1', true);
        const zipcode = get('postal_code');
        const lat = place.geometry?.location?.lat() ?? 0;
        const lng = place.geometry?.location?.lng() ?? 0;

        onAddressSelect({ address1, city, state, zipcode, lat, lng });
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
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
    }
  }

  const showDropdown = focused && suggestions.length > 0;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: `1.5px solid ${focused ? '#1B2A4A' : '#DDDDDD'}`,
          borderRadius: 4,
          fontFamily: 'Georgia, serif',
          fontSize: '0.95rem',
          color: '#1B2A4A',
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
          zIndex: 1000,
          maxHeight: 260,
          overflowY: 'auto',
        }}>
          {suggestions.map((s, i) => (
            <li
              key={s.place_id}
              onMouseDown={() => selectSuggestion(s)}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                fontSize: '0.88rem',
                lineHeight: 1.4,
                color: i === activeIndex ? '#C5A028' : 'rgba(255,255,255,0.85)',
                background: i === activeIndex ? 'rgba(197,160,40,0.12)' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                transition: 'background 0.1s, color 0.1s',
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {s.structured_formatting.main_text}
              </span>
              <span style={{ marginLeft: 6, fontSize: '0.8rem', opacity: 0.6 }}>
                {s.structured_formatting.secondary_text}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Hidden div required by PlacesService for attribution */}
      <div ref={attributionRef} style={{ display: 'none' }} />
    </div>
  );
}
