import { apiRequest } from '../../shared/api/http';

export type TipoEntrega = 'entrega' | 'retirada';

export interface AddressInput {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface CreateOrderInput {
  items: { productId: string; sku: string; quantidade: number }[];
  tipoEntrega: TipoEntrega;
  endereco?: AddressInput;
  agendamento?: { data: string; horario: string };
  pagamento: { metodo: 'pix' | 'cartao'; simularRecusa: boolean };
}

export interface OrderDto {
  id: string;
  status: string;
  tipoEntrega: TipoEntrega;
  items: {
    productId: string;
    nome: string;
    sku: string;
    moagem: string | null;
    pesoGramas: number | null;
    precoCentavos: number;
    quantidade: number;
  }[];
  subtotalCentavos: number;
  freteCentavos: number;
  totalCentavos: number;
  endereco: (AddressInput & { cep: string }) | null;
  agendamento: { data: string | null; horario: string | null } | null;
  pagamento: { metodo: string; status: string | null };
  statusHistory: { status: string; em: string; motivo: string | null }[];
  criadoEm: string | null;
}

export async function createOrder(token: string, input: CreateOrderInput): Promise<OrderDto> {
  const response = await apiRequest<{ data: OrderDto }>('/orders', { method: 'POST', body: input, token });
  return response.data;
}

export async function fetchOrders(token: string): Promise<OrderDto[]> {
  const response = await apiRequest<{ data: OrderDto[] }>('/orders', { token });
  return response.data;
}

export async function fetchOrder(token: string, id: string): Promise<OrderDto> {
  const response = await apiRequest<{ data: OrderDto }>(`/orders/${encodeURIComponent(id)}`, { token });
  return response.data;
}
