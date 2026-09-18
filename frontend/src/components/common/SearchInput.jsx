import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="search-input-wrapper">
      <FiSearch className="search-input-icon" />
      <input
        type="text"
        className="search-input"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
      />
      {localValue && (
        <button className="search-input-clear" onClick={handleClear} type="button">
          <FiX />
        </button>
      )}
    </div>
  );
};
