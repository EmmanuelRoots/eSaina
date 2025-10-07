// components/AutoCompleteGeneric.tsx
import React, { useState, useEffect, useCallback } from 'react';
import UseDebounce from '../../hooks/debounce';

export interface AutoCompleteGenericProps<T> {
  fetchSuggestions: (page:number,limit:number,query: string) => Promise<T[]>;
  getSuggestionKey: (item: T) => React.Key;
  getSuggestionLabel: (item: T) => string;
  renderSuggestion?: (item: T) => React.ReactNode;
  placeholder?: string;
  onSelect: (item: T) => void;
  debounceDelay?: number;
}

function AutoCompleteGeneric<T>({
  fetchSuggestions,
  getSuggestionKey,
  getSuggestionLabel,
  renderSuggestion,
  placeholder = 'Rechercher...',
  onSelect,
  debounceDelay = 300,
}: AutoCompleteGenericProps<T>) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedInput = UseDebounce(input, debounceDelay);

  const executeSearch = ()=> {
    fetchSuggestions(1,10,debouncedInput)
      .then(setSuggestions)
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }

  useEffect(()=>{
    executeSearch()
  },[])
  

  useEffect(() => {
    setLoading(true);
    executeSearch()
  }, [debouncedInput]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (item: T) => {
      setInput(getSuggestionLabel(item));
      setShowSuggestions(false);
      onSelect(item);
    },
    [getSuggestionLabel, onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    },
    [showSuggestions, suggestions, highlightedIndex, handleSelect]
  );

  return (
    <div className="autocomplete-container">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setShowSuggestions(true)
          console.log('onFocus');
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder={placeholder}
        className="autocomplete-input"
        autoComplete="off"
      />
      {showSuggestions && (
        <ul className="autocomplete-list">
          {loading && <li className="autocomplete-item">Chargement...</li>}
          {!loading &&
            suggestions.map((item, index) => (
              <li
                key={getSuggestionKey(item)}
                className={`autocomplete-item ${
                  index === highlightedIndex ? 'highlighted' : ''
                }`}
                onMouseDown={() => handleSelect(item)}
              >
                {renderSuggestion ? renderSuggestion(item) : getSuggestionLabel(item)}
              </li>
            ))}
          {!loading && suggestions.length === 0 && input.trim() && (
            <li className="autocomplete-item">Aucun résultat</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default React.memo(AutoCompleteGeneric) as typeof AutoCompleteGeneric;