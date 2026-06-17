'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const key = `${action.payload.menuItemId}-${action.payload.size}`;
      const existing = state.items.find(item => item.key === key);
      
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.key === key
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, key, quantity: 1 }],
      };
    }
    
    case 'REMOVE_ITEM': {
      const key = action.payload;
      const existing = state.items.find(item => item.key === key);
      
      if (existing && existing.quantity > 1) {
        return {
          ...state,
          items: state.items.map(item =>
            item.key === key
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        };
      }
      
      return {
        ...state,
        items: state.items.filter(item => item.key !== key),
      };
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = useCallback((menuItemId, name, price, size) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { menuItemId, name, price, size },
    });
  }, []);

  const removeItem = useCallback((key) => {
    dispatch({ type: 'REMOVE_ITEM', payload: key });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
