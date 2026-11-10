import { createContext, useContext } from 'react';
import type { CartItem } from '../../features/carrinho/cart.types';

export interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalCentavos: number;
  addItem: (item: Omit<CartItem, 'quantidade'>) => void;
  setQuantity: (sku: string, quantidade: number) => void;
  removeItem: (sku: string) => void;
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
