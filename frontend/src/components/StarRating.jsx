import React, { useState } from 'react';

// Renders 5 clickable stars. `value` is the current selection (0 if none),
// `onSelect` fires with the chosen 1-5 rating. Set `readOnly` to just
// display a value (e.g. an average) without interaction.
export default function StarRating({ value = 0, onSelect, readOnly = false, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={`star-rating star-rating-${size}`} role={readOnly ? undefined : 'radiogroup'}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={`star ${n <= display ? 'star-filled' : ''}`}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onSelect && onSelect(n)}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}
