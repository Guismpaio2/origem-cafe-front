// Um item do carrinho é uma variante concreta: produto + moagem + peso (RN002).
// O preço e a disponibilidade vêm sempre da API.
export interface CartItem {
  productId: string;
  nome: string;
  sku: string;
  moagem: string | null;
  pesoGramas: number | null;
  precoCentavos: number;
  quantidade: number;
  disponivel: boolean;
}
