import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../../app/providers/auth-context';
import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { fetchMySubscriptions, subscriptionAction } from './assinaturas.api';
import styles from './assinaturas.module.css';

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function AssinaturaPage() {
  const auth = useAuth();
  if (auth.status === 'checking') return <p className={styles.muted}>Carregando sua conta…</p>;
  if (auth.status !== 'authenticated' || !auth.token) return <Navigate to="/entrar?next=/assinatura" replace />;
  return <AssinaturaContent token={auth.token} />;
}

function AssinaturaContent({ token }: { token: string }) {
  const [version, setVersion] = useState(0);
  const subscriptions = useAsyncData(`assinaturas:${token}:${version}`, () => fetchMySubscriptions(token), 'Não foi possível carregar as assinaturas.');
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function acao(id: string, tipo: 'pausar' | 'retomar' | 'cancelar') {
    setErro(null);
    setMensagem(null);
    try {
      await subscriptionAction(token, id, tipo);
      setMensagem(tipo === 'cancelar' ? 'Cancelamento agendado. Ele vale a partir da próxima cobrança.' : 'Assinatura atualizada.');
      setVersion((value) => value + 1);
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : 'Não foi possível atualizar a assinatura.');
    }
  }

  return (
    <section className={styles.page} aria-labelledby="assinatura-titulo">
      <h1 id="assinatura-titulo" className={styles.title}>
        Clube mensal
      </h1>
      <p className={styles.muted}>Um café por mês, na mesma data. Você pode pausar quando quiser.</p>

      {mensagem && <p role="status" className={styles.success}>{mensagem}</p>}
      {erro && <p role="alert" className={styles.error}>{erro}</p>}
      {subscriptions.status === 'loading' && <p className={styles.muted}>Carregando…</p>}
      {subscriptions.status === 'error' && <p role="alert" className={styles.error}>{subscriptions.message}</p>}

      {subscriptions.status === 'ready' && subscriptions.data.length === 0 && (
        <p className={styles.muted}>
          Você ainda não assinou. <Link to="/" className={styles.link}>Escolha um café</Link> e clique em “Assinar mensalmente”.
        </p>
      )}

      {subscriptions.status === 'ready' && subscriptions.data.map((subscription) => (
        <article key={subscription.id} className={styles.card}>
          <p className={styles.status}>
            {subscription.status === 'ativa' ? 'Ativa' : 'Pausada'}
            {subscription.cancelamentoSolicitado && ' · cancelamento agendado'}
          </p>
          <p>
            {subscription.moagem} · {subscription.pesoGramas} g
          </p>
          <p className={styles.muted}>Próxima cobrança: {formatarData(subscription.proximaCobranca)}</p>
          <div className={styles.actions}>
            {subscription.status === 'ativa' && !subscription.cancelamentoSolicitado && (
              <button type="button" className={styles.button} onClick={() => void acao(subscription.id, 'pausar')}>
                Pausar
              </button>
            )}
            {subscription.status === 'pausada' && (
              <button type="button" className={styles.button} onClick={() => void acao(subscription.id, 'retomar')}>
                Retomar
              </button>
            )}
            {!subscription.cancelamentoSolicitado && (
              <button type="button" className={styles.linkButton} onClick={() => void acao(subscription.id, 'cancelar')}>
                Cancelar na próxima cobrança
              </button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
