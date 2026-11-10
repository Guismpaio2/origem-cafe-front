import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  addCartItem,
  fetchCart,
  getGuestId,
  mergeCart,
  removeCartItem,
  updateCartItem,
  type CartView,
} from '../../features/carrinho/cart.api';
import type { CartItem } from '../../features/carrinho/cart.types';
import { CartContext, type CartContextValue } from './cart-context';
import { useAuth } from './auth-context';

// O carrinho vive na API. Visitante e cliente usam o mesmo contrato; no login, o carrinho anônimo é unido ao da conta.
export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const guestId = getGuestId();

  useEffect(() => {
    let ignore = false;

    async function sync() {
      try {
        const cart: CartView = token
          ? await mergeCart(token, guestId).then(() => fetchCart(token, guestId))
          : await fetchCart(null, guestId);
        if (!ignore) setItems(cart.items);
      } catch {
        // Sem API no momento, o carrinho mostra o que já tinha em memória.
      }
    }

    void sync();
    return () => {
      ignore = true;
    };
  }, [token, guestId]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((total, item) => total + item.quantidade, 0);
    const subtotalCentavos = items.reduce((total, item) => total + item.precoCentavos * item.quantidade, 0);

    return {
      items,
      count,
      subtotalCentavos,
      addItem: async (productId, sku) => {
        const cart = await addCartItem(token, guestId, productId, sku);
        setItems(cart.items);
      },
      setQuantity: async (sku, quantidade) => {
        const cart = await updateCartItem(token, guestId, sku, quantidade);
        setItems(cart.items);
      },
      removeItem: async (sku) => {
        const cart = await removeCartItem(token, guestId, sku);
        setItems(cart.items);
      },
      clear: () => setItems([]),
    };
  }, [items, token, guestId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
