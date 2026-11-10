import type { CartAction, CartState } from './cart.types';

export const MAX_QUANTIDADE = 20;

// Reducer puro: recebe o estado atual e uma ação, devolve o próximo estado.
// Em Angular, isso seria um service com BehaviorSubject; aqui o estado fica num useReducer.
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((item) => item.sku === action.item.sku);
      if (!existing) {
        return { items: [...state.items, { ...action.item, quantidade: 1 }] };
      }
      return {
        items: state.items.map((item) =>
          item.sku === action.item.sku
            ? { ...item, quantidade: Math.min(item.quantidade + 1, MAX_QUANTIDADE) }
            : item,
        ),
      };
    }
    case 'setQuantity': {
      const quantidade = Math.min(Math.max(action.quantidade, 1), MAX_QUANTIDADE);
      return {
        items: state.items.map((item) => (item.sku === action.sku ? { ...item, quantidade } : item)),
      };
    }
    case 'remove':
      return { items: state.items.filter((item) => item.sku !== action.sku) };
    case 'clear':
      return { items: [] };
    case 'hydrate':
      return { items: action.items };
  }
}
