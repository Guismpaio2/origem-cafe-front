import { useParams } from 'react-router';
import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { fetchProduct } from './catalogo.api';
import { ProductDetail } from './ProductDetail';
import styles from './ProdutoPage.module.css';

export function ProdutoPage() {
  const { id = '' } = useParams();
  const product = useAsyncData(`produto:${id}`, () => fetchProduct(id), 'Não foi possível carregar este produto.');

  return (
    <section className={styles.page}>
      {product.status === 'loading' && <p className={styles.status}>Carregando o produto…</p>}

      {product.status === 'error' && (
        <p role="alert" className={styles.error}>
          {product.message}
        </p>
      )}

      {product.status === 'ready' && <ProductDetail key={product.data.id} product={product.data} />}
    </section>
  );
}
