import { createContext, useContext } from 'react';
import type { CartItem } from '../../features/carrinho/cart.types';

export interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalCentavos: number;
  addItem: (productId: string, sku: string) => Promise<void>;
  setQuantity: (sku: string, quantidade: number) => Promise<void>;
  removeItem: (sku: string) => Promise<void>;
  clear: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart precisa estar dentro de <CartProvider>.');
  }
  return context;
}
