import { useAuth } from '../../app/providers/auth-context';
import { formatCentavos } from '../../shared/format/money';
import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { fetchDashboard } from './admin.api';
import styles from './admin.module.css';

export function AdminDashboard() {
  const auth = useAuth();
  const token = auth.token ?? '';
  const data = useAsyncData(`dashboard:${token}`, () => fetchDashboard(token), 'Não foi possível carregar o resumo.');

  if (data.status === 'loading') return <p className={styles.muted}>Carregando o resumo…</p>;
  if (data.status === 'error') return <p role="alert" className={styles.error}>{data.message}</p>;

  const { pedidos, pedidosPorStatus, faturamentoCentavos, clientes, produtosAtivos } = data.data;
  return (
    <div className={styles.block}>
      <dl className={styles.stats}>
        <div>
          <dt>Pedidos</dt>
          <dd>{pedidos}</dd>
        </div>
        <div>
          <dt>Faturamento aprovado</dt>
          <dd>{formatCentavos(faturamentoCentavos)}</dd>
        </div>
        <div>
          <dt>Clientes</dt>
          <dd>{clientes}</dd>
        </div>
        <div>
          <dt>Produtos ativos</dt>
          <dd>{produtosAtivos}</dd>
        </div>
      </dl>
      <h2 className={styles.subtitle}>Pedidos por status</h2>
      <ul className={styles.list}>
        {Object.entries(pedidosPorStatus).map(([status, count]) => (
          <li key={status} className={styles.row}>
            <span>{status}</span>
            <strong>{count}</strong>
          </li>
        ))}
        {Object.keys(pedidosPorStatus).length === 0 && <li className={styles.muted}>Nenhum pedido ainda.</li>}
      </ul>
    </div>
  );
}
