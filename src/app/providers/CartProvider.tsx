import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { cartReducer } from '../../features/carrinho/cart.reducer';
import { loadCart, saveCart } from '../../features/carrinho/cart.storage';
import { CartContext, type CartContextValue } from './cart-context';

export function CartProvider({ children }: { children: ReactNode }) {
  // O estado inicial vem do localStorage (com validade de 24 h, RNF003).
  const [state, dispatch] = useReducer(cartReducer, undefined, () => ({ items: loadCart() }));

  // Sincroniza com o localStorage sempre que os itens mudam. Isso é um efeito colateral
  // legítimo: o React não sabe o que é o armazenamento do navegador.
  useEffect(() => {
    saveCart(state.items);
  }, [state.items]);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((total, item) => total + item.quantidade, 0);
    const subtotalCentavos = state.items.reduce(
      (total, item) => total + item.precoCentavos * item.quantidade,
      0,
    );

    return {
      items: state.items,
      count,
      subtotalCentavos,
      addItem: (item) => dispatch({ type: 'add', item: { ...item, quantidade: 1 } }),
      setQuantity: (sku, quantidade) => dispatch({ type: 'setQuantity', sku, quantidade }),
      removeItem: (sku) => dispatch({ type: 'remove', sku }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
