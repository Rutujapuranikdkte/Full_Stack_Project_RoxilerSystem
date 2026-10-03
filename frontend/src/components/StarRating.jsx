import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ 
  value = 0, 
  readOnly = true, 
  onChange, 
  size = 20, 
  showNumber = false,
  totalRatings = null
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const displayRating = hoverValue || value || 0;

  return (
    <div className="stars-wrapper" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              className="star-btn"
              onClick={() => !readOnly && onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onMouseLeave={() => !readOnly && setHoverValue(0)}
              style={{
                cursor: readOnly ? 'default' : 'pointer',
                background: 'transparent',
                border: 'none',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title={readOnly ? `${value} stars` : `Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={size}
                className={isFilled ? 'star-filled' : 'star-empty'}
                style={{
                  fill: isFilled ? '#f59e0b' : 'transparent',
                  color: isFilled ? '#f59e0b' : '#4b5563',
                  transition: 'transform 0.15s ease, fill 0.15s ease'
                }}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fbbf24', marginLeft: '4px' }}>
          {value ? Number(value).toFixed(1) : 'No Ratings'}
        </span>
      )}

      {totalRatings !== null && (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '2px' }}>
          ({totalRatings})
        </span>
      )}
    </div>
  );
};
