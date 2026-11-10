import type { ProductDto, VariantDto } from './catalogo.api';

// Menor preço entre as variantes: é o "a partir de" da listagem.
export function precoMinimo(product: ProductDto): number | null {
  if (product.variants.length === 0) return null;
  return Math.min(...product.variants.map((variant) => variant.precoCentavos));
}

export function temDisponibilidade(product: ProductDto): boolean {
  return product.variants.some((variant) => variant.disponivel);
}

// RN002: café só entra no carrinho com moagem E peso escolhidos.
export function variantePorEscolha(
  product: ProductDto,
  moagem: string | null,
  pesoGramas: number | null,
): VariantDto | null {
  return (
    product.variants.find(
      (variant) => variant.moagem === moagem && variant.pesoGramas === pesoGramas,
    ) ?? null
  );
}

export function moagensDoProduto(product: ProductDto): string[] {
  const moagens = product.variants.map((variant) => variant.moagem).filter((m): m is string => m !== null);
  return [...new Set(moagens)];
}

export function pesosDoProduto(product: ProductDto): number[] {
  const pesos = product.variants.map((variant) => variant.pesoGramas).filter((p): p is number => p !== null);
  return [...new Set(pesos)].sort((a, b) => a - b);
}
