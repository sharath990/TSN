import { useState, useEffect, useRef, useCallback } from 'react';
import { FiMapPin, FiLoader } from 'react-icons/fi';

const PHOTON_API = 'https://photon.komoot.io/api';

const buildAddress = (props) => {
  const parts = [];
  if (props.housenumber && props.street) {
    parts.push(`${props.housenumber} ${props.street}`);
  } else if (props.street) {
    parts.push(props.street);
  } else if (props.name) {
    parts.push(props.name);
  }
  if (props.city || props.town || props.village) {
    parts.push(props.city || props.town || props.village);
  }
  if (props.state) parts.push(props.state);
  if (props.postcode) parts.push(props.postcode);
  if (props.country) parts.push(props.country);
  return parts.join(', ');
};

export const AddressInput = ({ value, onChange, onCoordinates, placeholder }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetching, setFetching] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onCoordinatesRef = useRef(onCoordinates);

  useEffect(() => {
    onChangeRef.current = onChange;
    onCoordinatesRef.current = onCoordinates;
  }, [onChange, onCoordinates]);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (searchQuery) => {
    const trimmed = (searchQuery || '').trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    setFetching(true);
    try {
      const res = await fetch(
        `${PHOTON_API}?q=${encodeURIComponent(trimmed)}&limit=5&lang=en&countrycode=in`
      );
      const data = await res.json();
      const results = (data.features || []).map((f) => ({
        label: buildAddress(f.properties),
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      }));
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setFetching(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.label);
    setShowDropdown(false);
    setSuggestions([]);
    onChangeRef.current(suggestion.label);
    onCoordinatesRef.current(suggestion.lat, suggestion.lng);
  };

  return (
    <div className="address-input-wrapper" ref={wrapperRef}>
      <div className="address-input-container">
        <FiMapPin className="address-input-icon" />
        <input
          ref={inputRef}
          type="text"
          className="form-input address-input-field"
          value={query}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder || 'Start typing your address...'}
          autoComplete="off"
        />
        {fetching && <FiLoader className="address-input-spinner" />}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="address-suggestions">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="address-suggestion-item"
              onMouseDown={() => handleSelect(s)}
            >
              <FiMapPin className="address-suggestion-icon" />
              <span className="address-suggestion-text">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
