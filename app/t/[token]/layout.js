import { CartProvider } from '@/components/CartContext';

export default function TokenLayout({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
