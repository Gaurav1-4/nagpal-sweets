'use client';

import { memo } from 'react';

function MenuCard({ item, onAdd, onRemove, quantity, selectedSize, onSizeChange }) {
  const price = selectedSize === 'half' && item.has_half_option
    ? item.half_price
    : item.price;

  const isMrp = item.is_mrp;

  return (
    <div className="menu-card">
      <div className="card-info">
        <div className="veg-badge">
          <div className="veg-badge-inner" />
        </div>
        
        <h3 className="card-name">{item.name}</h3>
        
        {isMrp ? (
          <span className="mrp-badge">MRP</span>
        ) : (
          <div className="card-price">
            ₹{price}
          </div>
        )}
        
        {/* Placeholder description to make it look like Zomato/Swiggy */}
        <p className="card-desc">
          {item.description || "A delicious traditional recipe prepared with premium ingredients and authentic spices."}
        </p>

        {item.has_half_option && !isMrp && (
          <div className="size-toggle">
            <button
              className={`size-option ${selectedSize === 'full' ? 'active' : ''}`}
              onClick={() => onSizeChange(item.id, 'full')}
              aria-label="Full size"
            >
              Full
            </button>
            <button
              className={`size-option ${selectedSize === 'half' ? 'active' : ''}`}
              onClick={() => onSizeChange(item.id, 'half')}
              aria-label="Half size"
            >
              Half
            </button>
          </div>
        )}
      </div>

      {!isMrp && (
        <div className="card-actions">
          <div className="item-image-placeholder"></div>
          {quantity === 0 ? (
            <button
              className="add-btn"
              onClick={() => onAdd(item.id, item.name, price, selectedSize)}
              aria-label={`Add ${item.name} to cart`}
            >
              ADD
            </button>
          ) : (
            <div className="qty-controls">
              <button
                className="qty-btn"
                onClick={() => onRemove(`${item.id}-${selectedSize}`)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => onAdd(item.id, item.name, price, selectedSize)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(MenuCard);
