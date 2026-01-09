// components/AutoCompleteGeneric.tsx
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import UseDebounce from '../../hooks/debounce'
import './index.css'
import useAnchoredList from '../../hooks/anchoredList'
import { createPortal } from 'react-dom'
import { useThemeColors } from '../../hooks/theme'

export interface AutoCompleteGenericProps<T> {
  data: T[]
  getSuggestionKey: (item: T) => React.Key
  getSuggestionLabel: (item: T) => string
  filterFunction?: (item: T, query: string) => boolean
  renderSuggestion?: (item: T) => React.ReactNode
  placeholder?: string
  onSelect: (item: T) => void
  onInputChange?: (value: string) => void // 👈 Nouveau callback
  debounceDelay?: number
  maxSuggestions?: number
  loading?: boolean // 👈 État de chargement externe
  emptyMessage?: string
  required?: boolean
}

function AutoCompleteGeneric<T>({
  data,
  getSuggestionKey,
  getSuggestionLabel,
  filterFunction,
  renderSuggestion,
  placeholder = 'Rechercher…',
  onSelect,
  onInputChange,
  debounceDelay = 300,
  maxSuggestions = 10,
  loading = false,
  emptyMessage = 'Aucun résultat',
  required = false,
}: AutoCompleteGenericProps<T>) {
  const colors = useThemeColors()
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedInput = UseDebounce(input, debounceDelay)

  useEffect(
    () => onInputChange?.(debouncedInput),
    [debouncedInput, onInputChange]
  )

  const defaultFilter = useCallback(
    (item: T, q: string) =>
      getSuggestionLabel(item).toLowerCase().includes(q.toLowerCase()),
    [getSuggestionLabel]
  )

  const suggestions = useMemo(() => {
    if (!debouncedInput.trim()) return data.slice(0, maxSuggestions)
    const filter = filterFunction || defaultFilter
    return data.filter(i => filter(i, debouncedInput)).slice(0, maxSuggestions)
  }, [data, debouncedInput, filterFunction, defaultFilter, maxSuggestions])

  useEffect(() => setHighlightedIndex(-1), [suggestions])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    setShowSuggestions(true)
  }

  const handleSelect = (item: T) => {
    setInput(getSuggestionLabel(item))
    setShowSuggestions(false)
    onSelect(item)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || !suggestions.length) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(p => (p < suggestions.length - 1 ? p + 1 : p))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(p => (p > 0 ? p - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) handleSelect(suggestions[highlightedIndex])
        break
      case 'Escape':
        setShowSuggestions(false)
        inputRef.current?.blur()
        break
    }
  }

  /* ----  positionnement de la liste  ---- */
  const listStyle = useAnchoredList(inputRef as React.RefObject<HTMLElement>, [
    input,
    showSuggestions,
  ])

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => {
          handleChange(e)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        placeholder={placeholder}
        className="autocomplete-input"
        required={required}
      />

      {showSuggestions &&
        createPortal(
          <ul
            className="autocomplete-list"
            style={{
              ...listStyle,
              backgroundColor: colors.primaryBackground,
              borderRadius: 8,
            }}
          >
            {loading ? (
              <li className="autocomplete-item">Chargement…</li>
            ) : suggestions.length ? (
              suggestions.map((item, idx) => (
                <li
                  key={getSuggestionKey(item)}
                  className={`autocomplete-item ${idx === highlightedIndex ? 'highlighted' : ''}`}
                  onMouseDown={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  {renderSuggestion
                    ? renderSuggestion(item)
                    : getSuggestionLabel(item)}
                </li>
              ))
            ) : input.trim() ? (
              <li className="autocomplete-item">{emptyMessage}</li>
            ) : null}
          </ul>,
          document.body
        )}
    </div>
  )
}

export default React.memo(AutoCompleteGeneric) as typeof AutoCompleteGeneric
