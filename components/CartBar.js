'use client';

import { memo } from 'react';
import Link from 'next/link';

function CartBar({ totalItems, totalAmount, token }) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="cart-bar">
      <Link href={`/t/${token}/cart`} className="cart-bar-inner">
        <div className="cart-info">
          <span className="cart-items-count">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
          <span className="cart-amount">₹{totalAmount}</span>
        </div>
        <div className="cart-view-btn">
          View Cart
          <span className="cart-view-btn-arrow">→</span>
        </div>
      </Link>
    </div>
  );
}

export default memo(CartBar);
