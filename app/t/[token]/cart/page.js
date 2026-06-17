'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartProvider } from '@/components/CartContext';
import { RESTAURANT_NAME } from '@/lib/constants';
import Link from 'next/link';
import './cart.css';

function CartContent({ token }) {
  const { items, totalItems, totalAmount, addItem, removeItem, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        setError('Session expired. Please scan the QR code again.');
        setIsSubmitting(false);
        return;
      }

      const orderItems = items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        size: item.size,
        priceAtOrder: item.price,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          customerName: customerName || 'Guest',
          customerPhone,
          items: orderItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setOrderId(data.order.id);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="cart-container">
        <div className="order-success">
          <div className="success-icon">✅</div>
          <h2>Order Placed!</h2>
          <p>Your order has been sent to the kitchen.</p>
          <div className="order-id">
            Order #{orderId?.slice(0, 8).toUpperCase()}
          </div>
          <p className="wait-message">
            Please wait while we prepare your food. You&apos;ll be served at your table.
          </p>
          <Link href={`/t/${token}`} className="order-more-btn">
            Order More Items
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items from our menu!</p>
          <Link href={`/t/${token}`} className="back-to-menu-btn">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <Link href={`/t/${token}`} className="back-link">
          ← Back to Menu
        </Link>
        <h1>Your Order</h1>
        <p className="cart-subtitle">{totalItems} item{totalItems > 1 ? 's' : ''}</p>
      </div>

      <div className="cart-items">
        {items.map((item) => (
          <div key={item.key} className="cart-item">
            <div className="cart-item-info">
              <span className="veg-badge-small"></span>
              <div>
                <h3>{item.name}</h3>
                {item.size === 'half' && (
                  <span className="size-tag">Half</span>
                )}
              </div>
            </div>
            <div className="cart-item-controls">
              <div className="qty-controls">
                <button
                  className="qty-btn"
                  onClick={() => removeItem(item.key)}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => addItem(item.menuItemId, item.name, item.price, item.size)}
                >
                  +
                </button>
              </div>
              <span className="cart-item-price">
                ₹{item.price * item.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{totalAmount}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>₹{totalAmount}</span>
        </div>
      </div>

      <div className="customer-form">
        <h3>Your Details</h3>
        <div className="form-group">
          <label htmlFor="name">Name <span className="optional">(optional)</span></label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number <span className="required">*</span></label>
          <input
            id="phone"
            type="tel"
            placeholder="10-digit mobile number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            maxLength={10}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
      </div>

      <button
        className="place-order-btn"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="spinner"></span>
        ) : (
          `Place Order  •  ₹${totalAmount}`
        )}
      </button>
    </div>
  );
}

export default function CartPage({ params }) {
  const [token, setToken] = useState('');

  useEffect(() => {
    params.then(p => setToken(p.token));
  }, [params]);

  if (!token) return null;

  return (
    <CartProvider>
      <CartContent token={token} />
    </CartProvider>
  );
}
