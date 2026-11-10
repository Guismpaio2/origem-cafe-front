import { Link, Navigate, useParams } from 'react-router';
import { useAuth } from '../../app/providers/auth-context';
import { formatCentavos } from '../../shared/format/money';
import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { fetchOrder, type OrderDto } from './pedidos.api';
import styles from './pedidos.module.css';

const MENSAGEM_POR_STATUS: Record<string, string> = {
  Pago: 'Pagamento aprovado. Seu pedido está confirmado.',
  Cancelado: 'O pagamento não foi aprovado e o pedido foi cancelado. Nenhum item saiu do estoque. Você pode tentar de novo pelo carrinho.',
};

function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function OrderPage() {
  const auth = useAuth();
  const { id = '' } = useParams();

  if (auth.status === 'checking') return <p className={styles.muted}>Carregando seu pedido…</p>;
  if (auth.status !== 'authenticated' || !auth.token) {
    return <Navigate to={`/entrar?next=/pedidos/${id}`} replace />;
  }

  return <OrderDetails token={auth.token} id={id} />;
}

function OrderDetails({ token, id }: { token: string; id: string }) {
  const order = useAsyncData(`pedido:${id}`, () => fetchOrder(token, id), 'Não foi possível carregar este pedido.');

  return (
    <section className={styles.page} aria-labelledby="pedido-titulo">
      {order.status === 'loading' && <p className={styles.muted}>Carregando o pedido…</p>}
      {order.status === 'error' && (
        <p role="alert" className={styles.error}>
          {order.message}
        </p>
      )}
      {order.status === 'ready' && <OrderSummary order={order.data} />}
    </section>
  );
}

function OrderSummary({ order }: { order: OrderDto }) {
  const mensagem = MENSAGEM_POR_STATUS[order.status] ?? `Status atual: ${order.status}.`;

  return (
    <>
      <h1 id="pedido-titulo" className={styles.title}>
        {order.status === 'Pago' ? 'Pedido confirmado' : 'Pedido não concluído'}
      </h1>
      <p className={order.status === 'Pago' ? styles.success : styles.error}>{mensagem}</p>

      <div className={styles.columns}>
        <div className={styles.block}>
          <h2 className={styles.subtitle}>Itens</h2>
          <ul className={styles.list}>
            {order.items.map((item) => (
              <li key={item.sku}>
                <span>
                  {item.quantidade} × {item.nome}
                  {item.pesoGramas ? ` (${item.moagem}, ${item.pesoGramas} g)` : ''}
                </span>
                <span>{formatCentavos(item.precoCentavos * item.quantidade)}</span>
              </li>
            ))}
          </ul>
          <dl className={styles.totals}>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatCentavos(order.subtotalCentavos)}</dd>
            </div>
            <div>
              <dt>Frete</dt>
              <dd>{order.freteCentavos === 0 ? 'Sem frete' : formatCentavos(order.freteCentavos)}</dd>
            </div>
            <div className={styles.grandTotal}>
              <dt>Total</dt>
              <dd>{formatCentavos(order.totalCentavos)}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.block}>
          <h2 className={styles.subtitle}>{order.tipoEntrega === 'retirada' ? 'Retirada' : 'Entrega'}</h2>
          {order.tipoEntrega === 'retirada' && order.agendamento?.data && (
            <p>
              Retire na loja em {formatarData(order.agendamento.data)} às {order.agendamento.horario}.
            </p>
          )}
          {order.tipoEntrega === 'entrega' && order.endereco && (
            <address className={styles.address}>
              {order.endereco.logradouro}, {order.endereco.numero}
              {order.endereco.complemento ? ` · ${order.endereco.complemento}` : ''}
              <br />
              {order.endereco.bairro ? `${order.endereco.bairro} · ` : ''}
              {order.endereco.cidade} / {order.endereco.uf} · CEP {order.endereco.cep}
            </address>
          )}

          <h2 className={styles.subtitle}>Histórico</h2>
          <ol className={styles.history}>
            {order.statusHistory.map((entry, index) => (
              <li key={`${entry.status}-${index}`}>
                <strong>{entry.status}</strong>
                {entry.motivo && <span className={styles.muted}> · {entry.motivo}</span>}
              </li>
            ))}
          </ol>

          <Link to="/pedidos" className={styles.link}>
            Ver todos os meus pedidos
          </Link>
        </div>
      </div>
    </>
  );
}
