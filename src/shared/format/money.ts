// Preços chegam da API em centavos (inteiro). Formatamos só na apresentação (AGENTS.md, seção 6).
const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatCentavos(centavos: number): string {
  return formatter.format(centavos / 100);
}
