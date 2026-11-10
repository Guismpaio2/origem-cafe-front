import { apiRequest, ApiError } from '../../shared/api/http';

export interface ReviewDto {
  id: string;
  nota: number;
  comentario: string;
  autor: string;
  criadoEm: string | null;
}

export async function fetchReviews(productId: string): Promise<ReviewDto[]> {
  return (await apiRequest<{ data: ReviewDto[] }>(`/products/${encodeURIComponent(productId)}/reviews`)).data;
}

export async function sendReview(token: string, productId: string, nota: number, comentario: string): Promise<ReviewDto> {
  return (
    await apiRequest<{ data: ReviewDto }>(`/products/${encodeURIComponent(productId)}/reviews`, {
      method: 'POST',
      body: { nota, comentario },
      token,
    })
  ).data;
}

// RNF010: avaliação que falha por rede fica guardada no navegador e é reenviada ao reconectar.
const PENDING_KEY = 'origem-cafe.avaliacoes-pendentes';

export interface PendingReview {
  productId: string;
  nota: number;
  comentario: string;
}

export function readPending(): PendingReview[] {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingReview[]) : [];
  } catch {
    return [];
  }
}

function writePending(items: PendingReview[]): void {
  try {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(items));
  } catch {
    // Sem armazenamento: a avaliação só existe na tela até o envio.
  }
}

export function savePending(item: PendingReview): void {
  writePending([...readPending(), item]);
}

// Tenta enviar tudo o que ficou guardado. Quem já foi enviado (409) sai da fila sem duplicar.
export async function flushPending(token: string): Promise<number> {
  const queue = readPending();
  const stillPending: PendingReview[] = [];
  for (const item of queue) {
    try {
      await sendReview(token, item.productId, item.nota, item.comentario);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) continue;
      if (error instanceof ApiError && error.status === 0) {
        stillPending.push(item);
        continue;
      }
      // Erro de regra (ex.: não é mais compra): descarta para não ficar em loop.
    }
  }
  writePending(stillPending);
  return queue.length - stillPending.length;
}
