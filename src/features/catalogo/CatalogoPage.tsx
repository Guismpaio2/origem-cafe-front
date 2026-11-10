import { NavLink, useSearchParams } from 'react-router';
import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { fetchProducts, type TipoProduto } from './catalogo.api';
import { ProductRow } from './ProductRow';
import styles from './CatalogoPage.module.css';

const FILTROS: { value: TipoProduto | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Tudo' },
  { value: 'cafe', label: 'Cafés' },
  { value: 'acessorio', label: 'Acessórios' },
];

function filtroDaUrl(valor: string | null): TipoProduto | undefined {
  return valor === 'cafe' || valor === 'acessorio' ? valor : undefined;
}

export function CatalogoPage() {
  // O filtro fica na URL (?tipo=cafe): dá para voltar, recarregar e compartilhar o link.
  const [searchParams] = useSearchParams();
  const tipo = filtroDaUrl(searchParams.get('tipo'));
  const filtroAtual = tipo ?? 'todos';

  const products = useAsyncData(`catalogo:${tipo ?? 'todos'}`, () => fetchProducts(tipo), 'Não foi possível carregar o catálogo.');

  return (
    <section className={styles.page} aria-labelledby="catalogo-titulo">
      <header className={styles.header}>
        <h1 id="catalogo-titulo" className={styles.title}>
          Cafés pelo lugar onde nascem
        </h1>
        <p className={styles.intro}>
          Escolha pela origem e pelas notas de xícara. Moagem e peso você define antes de colocar no carrinho.
        </p>
      </header>

      <nav className={styles.filters} aria-label="Filtrar produtos">
        {FILTROS.map((filtro) => (
          <NavLink
            key={filtro.value}
            to={filtro.value === 'todos' ? '/' : `/?tipo=${filtro.value}`}
            className={filtro.value === filtroAtual ? styles.filterActive : styles.filter}
            aria-current={filtro.value === filtroAtual ? 'page' : undefined}
            end
          >
            {filtro.label}
          </NavLink>
        ))}
      </nav>

      {products.status === 'loading' && <p className={styles.status}>Carregando os cafés…</p>}

      {products.status === 'error' && (
        <p role="alert" className={styles.error}>
          {products.message} Verifique se a API está rodando e recarregue a página.
        </p>
      )}

      {products.status === 'ready' && products.data.length === 0 && (
        <p className={styles.status}>Nenhum produto neste filtro por enquanto.</p>
      )}

      {products.status === 'ready' && products.data.length > 0 && (
        <ul className={styles.list} aria-label="Produtos">
          {products.data.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </ul>
      )}
    </section>
  );
}
