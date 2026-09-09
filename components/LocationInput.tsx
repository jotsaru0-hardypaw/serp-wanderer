"use client";

import { US_CITIES } from "@/lib/us-cities";

// Type-ahead city input: suggests the preset list as you type (native
// datalist), but accepts any typed value freely — not limited to presets.
// Datalist matching/display varies slightly by browser, but typing a
// prefix like "Los" reliably surfaces "Los Angeles,California,United
// States" as a suggestion in all major browsers.
export default function LocationInput({
  id,
  value,
  onChange,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const listId = `${id}-suggestions`;

  return (
    <>
      <input
        id={id}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Any city, or type to search (e.g. Los Angeles)"
        className={className}
        autoComplete="off"
      />
      <datalist id={listId}>
        {US_CITIES.map((c) => (
          <option key={c.canonicalName} value={c.canonicalName} label={c.label} />
        ))}
      </datalist>
    </>
  );
}
