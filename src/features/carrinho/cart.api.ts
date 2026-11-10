import { apiRequest } from '../../shared/api/http';
import type { CartItem } from './cart.types';

export interface CartView {
  items: CartItem[];
  count: number;
  subtotalCentavos: number;
}

const GUEST_KEY = 'origem-cafe.guest-id';
const GUEST_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

// Identificador anônimo do visitante. Sem ele, o carrinho de quem não entrou se perderia.
export function getGuestId(): string {
  try {
    const saved = window.localStorage.getItem(GUEST_KEY);
    if (saved && GUEST_PATTERN.test(saved)) return saved;
    const created = crypto.randomUUID();
    window.localStorage.setItem(GUEST_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

function headersFor(guestId: string) {
  return { 'x-cart-id': guestId };
}

export async function fetchCart(token: string | null, guestId: string): Promise<CartView> {
  const response = await apiRequest<{ data: CartView }>('/cart', { token, headers: headersFor(guestId) });
  return response.data;
}

export async function addCartItem(token: string | null, guestId: string, productId: string, sku: string): Promise<CartView> {
  const response = await apiRequest<{ data: CartView }>('/cart/items', {
    method: 'POST',
    body: { productId, sku, quantidade: 1 },
    token,
    headers: headersFor(guestId),
  });
  return response.data;
}

export async function updateCartItem(token: string | null, guestId: string, sku: string, quantidade: number): Promise<CartView> {
  const response = await apiRequest<{ data: CartView }>(`/cart/items/${encodeURIComponent(sku)}`, {
    method: 'PATCH',
    body: { quantidade },
    token,
    headers: headersFor(guestId),
  });
  return response.data;
}

export async function removeCartItem(token: string | null, guestId: string, sku: string): Promise<CartView> {
  const response = await apiRequest<{ data: CartView }>(`/cart/items/${encodeURIComponent(sku)}`, {
    method: 'DELETE',
    token,
    headers: headersFor(guestId),
  });
  return response.data;
}

export async function mergeCart(token: string, guestId: string): Promise<CartView> {
  const response = await apiRequest<{ data: CartView }>('/cart/merge', {
    method: 'POST',
    token,
    headers: headersFor(guestId),
  });
  return response.data;
}
