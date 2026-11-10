import { apiRequest } from '../../shared/api/http';

export type TipoProduto = 'cafe' | 'acessorio';

export interface VariantDto {
  sku: string;
  moagem: string | null;
  pesoGramas: number | null;
  precoCentavos: number;
  disponivel: boolean;
}

export interface ProductDto {
  id: string;
  nome: string;
  tipo: TipoProduto;
  descricao: string;
  origem: string;
  notasSensoriais: string[];
  imagens: string[];
  variants: VariantDto[];
  ratingMedia: number;
  ratingTotal: number;
}

interface PaginatedProducts {
  data: ProductDto[];
  meta: { page: number; limit: number; total: number };
}

export async function fetchProducts(tipo?: TipoProduto): Promise<ProductDto[]> {
  const query = new URLSearchParams({ limit: '50' });
  if (tipo) query.set('tipo', tipo);
  const response = await apiRequest<PaginatedProducts>(`/products?${query.toString()}`);
  return response.data;
}

export async function fetchProduct(id: string): Promise<ProductDto> {
  const response = await apiRequest<{ data: ProductDto }>(`/products/${encodeURIComponent(id)}`);
  return response.data;
}
