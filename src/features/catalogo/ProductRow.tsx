import { Link } from 'react-router';
import { formatCentavos } from '../../shared/format/money';
import type { ProductDto } from './catalogo.api';
import { precoMinimo, temDisponibilidade } from './catalogo.rules';
import styles from './ProductRow.module.css';

interface ProductRowProps {
  product: ProductDto;
}

// Cada café é uma linha do índice: origem em destaque, notas e preço alinhados.
export function ProductRow({ product }: ProductRowProps) {
  const preco = precoMinimo(product);
  const disponivel = temDisponibilidade(product);

  return (
    <li className={styles.row}>
      <Link to={`/produtos/${product.id}`} className={styles.link}>
        <span className={styles.origin}>{product.origem || 'Acessório'}</span>
        <span className={styles.name}>{product.nome}</span>
        {product.notasSensoriais.length > 0 && (
          <span className={styles.notes}>{product.notasSensoriais.join(', ')}</span>
        )}
      </Link>
      <span className={styles.side}>
        {preco !== null && (
          <span className={styles.price}>
            <span className={styles.from}>a partir de</span> {formatCentavos(preco)}
          </span>
        )}
        <span className={disponivel ? styles.stock : styles.outOfStock}>
          {disponivel ? 'Disponível' : 'Esgotado no momento'}
        </span>
      </span>
    </li>
  );
}
