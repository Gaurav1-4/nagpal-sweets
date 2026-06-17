'use client';

import { memo } from 'react';

function getImageUrl(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('dosa') || lowerName.includes('uthapam') || lowerName.includes('idli') || lowerName.includes('vada')) {
    return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('chowmein')) {
    return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('chhole') || lowerName.includes('chawal')) {
    return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('samosa') || lowerName.includes('tikki')) {
    return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('rasgulla') || lowerName.includes('jamun') || lowerName.includes('malai') || lowerName.includes('rabri') || lowerName.includes('kulfi')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('shake') || lowerName.includes('coffee') || lowerName.includes('lassi')) {
    return 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop';
  }
  if (lowerName.includes('drink') || lowerName.includes('water')) {
    return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop';
  }
  
  // Default fallback (Paneer/Curry style)
  return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?q=80&w=300&auto=format&fit=crop';
}

function MenuCard({ item, onAdd, onRemove, quantity, selectedSize, onSizeChange }) {
  const price = selectedSize === 'half' && item.has_half_option
    ? item.half_price
    : item.price;

  const isMrp = item.is_mrp;
  const imageUrl = getImageUrl(item.name);

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
          <div 
            className="item-image-placeholder" 
            style={{ backgroundImage: `url('${imageUrl}')` }}
          ></div>
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
