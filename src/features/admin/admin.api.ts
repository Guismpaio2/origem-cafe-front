import { apiRequest } from '../../shared/api/http';

export const ORDER_STATUSES = [
  'Criado',
  'Pago',
  'Em Preparação',
  'Pronto p/ retirada',
  'Em Entrega',
  'Retirado',
  'Entregue',
  'Cancelado',
] as const;

export interface DashboardData {
  pedidos: number;
  pedidosPorStatus: Record<string, number>;
  faturamentoCentavos: number;
  clientes: number;
  produtosAtivos: number;
}

export interface AdminVariant {
  sku: string;
  moagem?: string;
  pesoGramas?: number;
  precoCentavos: number;
  estoque: number;
}

export interface AdminProduct {
  id: string;
  nome: string;
  tipo: 'cafe' | 'acessorio';
  origem: string;
  ativo: boolean;
  variants: { sku: string; moagem: string | null; pesoGramas: number | null; precoCentavos: number; disponivel: boolean }[];
}

export interface ProductInput {
  nome: string;
  tipo: 'cafe' | 'acessorio';
  origem: string;
  descricao: string;
  notasSensoriais: string[];
  variants: AdminVariant[];
}

export interface AdminOrder {
  id: string;
  status: string;
  totalCentavos: number;
  items: { nome: string; sku: string; quantidade: number }[];
  cliente: { nome: string; email: string | null };
  statusHistory: { status: string; em: string; motivo: string | null }[];
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  return (await apiRequest<{ data: DashboardData }>('/admin/dashboard', { token })).data;
}

export async function fetchAdminProducts(token: string): Promise<AdminProduct[]> {
  return (await apiRequest<{ data: AdminProduct[] }>('/admin/products', { token })).data;
}

export async function createAdminProduct(token: string, input: ProductInput): Promise<AdminProduct> {
  return (await apiRequest<{ data: AdminProduct }>('/admin/products', { method: 'POST', body: input, token })).data;
}

export async function deactivateAdminProduct(token: string, id: string): Promise<void> {
  await apiRequest<unknown>(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE', token });
}

export async function fetchAdminOrders(token: string, status: string): Promise<AdminOrder[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return (await apiRequest<{ data: AdminOrder[] }>(`/admin/orders${query}`, { token })).data;
}

export async function changeOrderStatus(token: string, id: string, status: string, motivo?: string): Promise<AdminOrder> {
  return (
    await apiRequest<{ data: AdminOrder }>(`/admin/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status, motivo: motivo || undefined },
      token,
    })
  ).data;
}
