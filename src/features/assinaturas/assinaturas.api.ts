import { apiRequest } from '../../shared/api/http';

export interface SubscriptionDto {
  id: string;
  productId: string;
  sku: string;
  moagem: string | null;
  pesoGramas: number | null;
  status: 'ativa' | 'pausada' | 'cancelada';
  cancelamentoSolicitado: boolean;
  proximaCobranca: string;
}

export async function createSubscription(token: string, productId: string, sku: string): Promise<SubscriptionDto> {
  return (await apiRequest<{ data: SubscriptionDto }>('/subscriptions', { method: 'POST', body: { productId, sku }, token })).data;
}

export async function fetchMySubscriptions(token: string): Promise<SubscriptionDto[]> {
  return (await apiRequest<{ data: SubscriptionDto[] }>('/subscriptions/me', { token })).data;
}

export async function subscriptionAction(token: string, id: string, acao: 'pausar' | 'retomar' | 'cancelar'): Promise<SubscriptionDto> {
  return (await apiRequest<{ data: SubscriptionDto }>(`/subscriptions/${encodeURIComponent(id)}`, { method: 'PATCH', body: { acao }, token })).data;
}
