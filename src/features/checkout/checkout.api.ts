import { apiRequest } from '../../shared/api/http';
import type { TipoEntrega } from '../pedidos/pedidos.api';

export interface ShippingQuote {
  subtotalCentavos: number;
  freteCentavos: number;
  totalCentavos: number;
}

export interface CheckoutLine {
  productId: string;
  sku: string;
  quantidade: number;
}

export async function quoteShipping(items: CheckoutLine[], tipoEntrega: TipoEntrega): Promise<ShippingQuote> {
  const response = await apiRequest<{ data: ShippingQuote }>('/shipping/quote', {
    method: 'POST',
    body: { items, tipoEntrega },
  });
  return response.data;
}

export async function fetchPickupSlots(date: string): Promise<string[]> {
  const response = await apiRequest<{ data: { date: string; slots: string[] } }>(
    `/pickup/availability?date=${encodeURIComponent(date)}`,
  );
  return response.data.slots;
}

export interface CepLookup {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

// RF009: a API consulta o ViaCEP; o navegador só recebe o endereço pronto.
export async function lookupCep(cep: string): Promise<CepLookup> {
  const response = await apiRequest<{ data: CepLookup }>(`/shipping/cep/${encodeURIComponent(cep)}`);
  return response.data;
}
