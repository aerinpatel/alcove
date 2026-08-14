"use client";

import React from "react";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (lat: number | null, lng: number | null, address: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  onKeyDown,
  placeholder = "Where do you want to study?",
  className = "",
}: LocationAutocompleteProps) {
  // Google Maps autocomplete has been disabled due to billing restrictions.
  // We now return a standard text input that triggers search on Enter.
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        // Pass null coords so the backend falls back to standard text query search
        onPlaceSelect(null, null, e.target.value);
      }}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
    />
  );
}
