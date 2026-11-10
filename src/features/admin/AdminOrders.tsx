import { useState } from 'react';
import { useAuth } from '../../app/providers/auth-context';
import { formatCentavos } from '../../shared/format/money';
import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { changeOrderStatus, fetchAdminOrders, ORDER_STATUSES } from './admin.api';
import styles from './admin.module.css';

export function AdminOrders() {
  const auth = useAuth();
  const token = auth.token ?? '';
  const [filtro, setFiltro] = useState('');
  const [version, setVersion] = useState(0);
  const orders = useAsyncData(`admin-pedidos:${token}:${filtro}:${version}`, () => fetchAdminOrders(token, filtro), 'Não foi possível carregar os pedidos.');
  const [drafts, setDrafts] = useState<Record<string, { status: string; motivo: string }>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleChange(id: string, currentStatus: string) {
    const draft = drafts[id] ?? { status: currentStatus, motivo: '' };
    setErro(null);
    setMensagem(null);
    try {
      await changeOrderStatus(token, id, draft.status, draft.motivo);
      setMensagem('Status atualizado.');
      setVersion((value) => value + 1);
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : 'Não foi possível atualizar o status.');
    }
  }

  return (
    <div className={styles.block}>
      <div className={styles.field}>
        <label htmlFor="filtro-status">Filtrar por status</label>
        <select id="filtro-status" value={filtro} onChange={(event) => setFiltro(event.target.value)}>
          <option value="">Todos</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {mensagem && <p role="status" className={styles.success}>{mensagem}</p>}
      {erro && <p role="alert" className={styles.error}>{erro}</p>}
      {orders.status === 'loading' && <p className={styles.muted}>Carregando…</p>}
      {orders.status === 'error' && <p role="alert" className={styles.error}>{orders.message}</p>}
      {orders.status === 'ready' && orders.data.length === 0 && <p className={styles.muted}>Nenhum pedido neste filtro.</p>}

      {orders.status === 'ready' && (
        <ul className={styles.list}>
          {orders.data.map((order) => {
            const draft = drafts[order.id] ?? { status: order.status, motivo: '' };
            return (
              <li key={order.id} className={styles.orderCard}>
                <div className={styles.row}>
                  <span>
                    {order.cliente.nome} · {order.items.map((item) => `${item.quantidade}× ${item.nome}`).join(', ')}
                  </span>
                  <strong>{formatCentavos(order.totalCentavos)}</strong>
                </div>
                <p className={styles.muted}>Status atual: {order.status}</p>
                <div className={styles.statusForm}>
                  <label htmlFor={`status-${order.id}`} className={styles.visuallyHidden}>Novo status do pedido</label>
                  <select id={`status-${order.id}`} value={draft.status} onChange={(event) => setDrafts((current) => ({ ...current, [order.id]: { ...draft, status: event.target.value } }))}>
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <label htmlFor={`motivo-${order.id}`} className={styles.visuallyHidden}>Justificativa, se for cancelar</label>
                  <input id={`motivo-${order.id}`} placeholder="Justificativa (para cancelar em preparação)" value={draft.motivo} onChange={(event) => setDrafts((current) => ({ ...current, [order.id]: { ...draft, motivo: event.target.value } }))} />
                  <button type="button" className={styles.button} onClick={() => void handleChange(order.id, order.status)}>
                    Atualizar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
