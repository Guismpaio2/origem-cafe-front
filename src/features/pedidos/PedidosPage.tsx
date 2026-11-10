import { Link, Navigate } from 'react-router';
import { useAuth } from '../../app/providers/auth-context';
import { formatCentavos } from '../../shared/format/money';
import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { fetchOrders } from './pedidos.api';
import styles from './pedidos.module.css';

export function PedidosPage() {
  const auth = useAuth();

  if (auth.status === 'checking') return <p className={styles.muted}>Carregando sua conta…</p>;
  if (auth.status !== 'authenticated' || !auth.token) {
    return <Navigate to="/entrar?next=/pedidos" replace />;
  }

  return <PedidosList token={auth.token} />;
}

function PedidosList({ token }: { token: string }) {
  const orders = useAsyncData('meus-pedidos', () => fetchOrders(token), 'Não foi possível carregar seus pedidos.');

  return (
    <section className={styles.page} aria-labelledby="pedidos-titulo">
      <h1 id="pedidos-titulo" className={styles.title}>
        Meus pedidos
      </h1>

      {orders.status === 'loading' && <p className={styles.muted}>Carregando…</p>}
      {orders.status === 'error' && (
        <p role="alert" className={styles.error}>
          {orders.message}
        </p>
      )}
      {orders.status === 'ready' && orders.data.length === 0 && (
        <p className={styles.muted}>Você ainda não fez nenhum pedido.</p>
      )}
      {orders.status === 'ready' && orders.data.length > 0 && (
        <ul className={styles.rows}>
          {orders.data.map((order) => (
            <li key={order.id}>
              <Link to={`/pedidos/${order.id}`} className={styles.row}>
                <span>
                  {order.items.map((item) => item.nome).join(', ')}
                </span>
                <span className={styles.muted}>{order.status}</span>
                <strong>{formatCentavos(order.totalCentavos)}</strong>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
