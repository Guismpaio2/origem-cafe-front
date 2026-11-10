import { useState } from 'react';
import { Link } from 'react-router';
import { useCart } from '../../app/providers/cart-context';
import { formatCentavos } from '../../shared/format/money';
import type { ProductDto } from './catalogo.api';
import {
  moagensDoProduto,
  pesosDoProduto,
  precoMinimo,
  variantePorEscolha,
} from './catalogo.rules';
import { VariantPicker } from '../../shared/components/VariantPicker';
import styles from './ProdutoPage.module.css';

interface ProductDetailProps {
  product: ProductDto;
}

// Este componente é recriado para cada produto (key no pai), então a escolha começa limpa.
export function ProductDetail({ product }: ProductDetailProps) {
  const cart = useCart();
  const isCafe = product.tipo === 'cafe';

  const [moagem, setMoagem] = useState<string | null>(null);
  const [peso, setPeso] = useState<number | null>(null);
  const [added, setAdded] = useState(false);

  const moagens = moagensDoProduto(product);
  const pesos = pesosDoProduto(product);

  // Acessório não tem moagem nem peso: a única variante já é a escolha.
  const selected = isCafe
    ? variantePorEscolha(product, moagem, peso)
    : (product.variants[0] ?? null);

  const selectionMissing = isCafe && (moagem === null || peso === null);
  const outOfStock = selected !== null && !selected.disponivel;
  const canAdd = selected !== null && selected.disponivel;

  // RN002: o botão só libera com moagem E peso escolhidos e variante disponível.
  let hint = '';
  if (selectionMissing) hint = 'Escolha a moagem e o peso para adicionar ao carrinho.';
  else if (outOfStock) hint = 'Esta combinação está sem estoque. Escolha outro peso ou moagem.';

  const handleAdd = () => {
    if (!selected) return;
    cart.addItem({
      productId: product.id,
      nome: product.nome,
      sku: selected.sku,
      moagem: selected.moagem,
      pesoGramas: selected.pesoGramas,
      precoCentavos: selected.precoCentavos,
    });
    setAdded(true);
  };

  const preco = selected ? formatCentavos(selected.precoCentavos) : formatCentavos(precoMinimo(product) ?? 0);

  return (
    <article className={styles.layout}>
      <div className={styles.story}>
        <p className={styles.origin}>{product.origem || 'Acessório para o preparo'}</p>
        <h1 className={styles.name}>{product.nome}</h1>
        <p className={styles.description}>{product.descricao}</p>

        {product.notasSensoriais.length > 0 && (
          <dl className={styles.notes}>
            <dt>Notas de xícara</dt>
            <dd>{product.notasSensoriais.join(', ')}</dd>
          </dl>
        )}

        {product.ratingTotal > 0 && (
          <p className={styles.rating}>
            {product.ratingMedia.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} de 5 · {product.ratingTotal}{' '}
            avaliações
          </p>
        )}
      </div>

      <aside className={styles.buy} aria-label="Escolher e comprar">
        {isCafe && (
          <>
            <VariantPicker
              name="moagem"
              legend="Moagem"
              options={moagens.map((value) => ({ value, label: value }))}
              selected={moagem}
              onSelect={setMoagem}
            />
            <VariantPicker
              name="peso"
              legend="Peso"
              options={pesos.map((value) => ({ value, label: `${value} g` }))}
              selected={peso}
              onSelect={setPeso}
            />
          </>
        )}

        <p className={styles.price} aria-live="polite">
          {preco}
        </p>

        {hint && <p className={styles.hint}>{hint}</p>}

        <button type="button" className={styles.addButton} disabled={!canAdd} onClick={handleAdd}>
          Adicionar ao carrinho
        </button>

        {added && (
          <p className={styles.confirm} role="status">
            Adicionado ao carrinho.{' '}
            <Link to="/carrinho" className={styles.cartLink}>
              Ver carrinho ({cart.count})
            </Link>
          </p>
        )}
      </aside>
    </article>
  );
}
