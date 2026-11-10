import { Link } from 'react-router';
import { useAuth } from '../../app/providers/auth-context';
import { useCart } from '../../app/providers/cart-context';
import { formatCentavos } from '../../shared/format/money';
import { MAX_QUANTIDADE } from './cart.reducer';
import styles from './CarrinhoPage.module.css';

export function CarrinhoPage() {
  const cart = useCart();
  const auth = useAuth();

  if (cart.items.length === 0) {
    return (
      <section className={styles.page}>
        <h1 className={styles.title}>Seu carrinho está vazio</h1>
        <p className={styles.intro}>Escolha um café pela origem e volte aqui para revisar o pedido.</p>
        <Link to="/" className={styles.primaryLink}>
          Ver os cafés
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-labelledby="carrinho-titulo">
      <h1 id="carrinho-titulo" className={styles.title}>
        Carrinho
      </h1>
      <p className={styles.intro}>
        O carrinho não reserva estoque. A disponibilidade é conferida quando o pagamento for aprovado.
      </p>

      <ul className={styles.list}>
        {cart.items.map((item) => (
          <li key={item.sku} className={styles.row}>
            <div className={styles.details}>
              <p className={styles.name}>{item.nome}</p>
              <p className={styles.meta}>
                {[item.moagem, item.pesoGramas ? `${item.pesoGramas} g` : null].filter(Boolean).join(' · ') ||
                  'Sem variação'}
              </p>
            </div>

            <div className={styles.quantity}>
              <button
                type="button"
                className={styles.stepper}
                aria-label={`Diminuir a quantidade de ${item.nome}`}
                onClick={() => cart.setQuantity(item.sku, item.quantidade - 1)}
                disabled={item.quantidade <= 1}
              >
                −
              </button>
              <span aria-live="polite" className={styles.count}>
                {item.quantidade}
              </span>
              <button
                type="button"
                className={styles.stepper}
                aria-label={`Aumentar a quantidade de ${item.nome}`}
                onClick={() => cart.setQuantity(item.sku, item.quantidade + 1)}
                disabled={item.quantidade >= MAX_QUANTIDADE}
              >
                +
              </button>
            </div>

            <p className={styles.subtotal}>{formatCentavos(item.precoCentavos * item.quantidade)}</p>

            <button type="button" className={styles.remove} onClick={() => cart.removeItem(item.sku)}>
              Remover <span className={styles.visuallyHidden}>{item.nome}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.summary}>
        <p className={styles.total}>
          <span>Subtotal</span>
          <strong>{formatCentavos(cart.subtotalCentavos)}</strong>
        </p>
        <p className={styles.note}>O frete é calculado no checkout, pelo CEP de entrega.</p>

        <Link to={auth.status === 'authenticated' ? '/checkout' : '/entrar?next=/checkout'} className={styles.primaryLink}>
          {auth.status === 'authenticated' ? 'Finalizar compra' : 'Entrar para finalizar'}
        </Link>
      </div>
    </section>
  );
}
