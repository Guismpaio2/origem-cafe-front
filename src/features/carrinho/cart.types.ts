// Um item do carrinho é uma variante concreta: produto + moagem + peso (RN002).
export interface CartItem {
  productId: string;
  nome: string;
  sku: string;
  moagem: string | null;
  pesoGramas: number | null;
  precoCentavos: number;
  quantidade: number;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'add'; item: CartItem }
  | { type: 'setQuantity'; sku: string; quantidade: number }
  | { type: 'remove'; sku: string }
  | { type: 'clear' }
  | { type: 'hydrate'; items: CartItem[] };
