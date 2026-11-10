import type { CartItem } from './cart.types';

// RNF003: carrinho guardado por 24 h, mesmo depois de fechar a aba.
const STORAGE_KEY = 'origem-cafe.carrinho';
const TTL_MS = 24 * 60 * 60 * 1000;

interface StoredCart {
  items: CartItem[];
  expiresAt: number;
}

// localStorage pode falhar (aba privada, dados bloqueados): nesses casos o carrinho
// funciona só na memória da sessão, sem quebrar a tela.
export function loadCart(now = Date.now()): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as StoredCart;
    if (typeof stored.expiresAt !== 'number' || stored.expiresAt < now) {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return Array.isArray(stored.items) ? stored.items : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[], now = Date.now()): void {
  try {
    const stored: StoredCart = { items, expiresAt: now + TTL_MS };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Sem armazenamento disponível: o carrinho continua funcionando na sessão.
  }
}
