import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../../app/providers/auth-context';
import { EnderecoForm } from '../checkout/EnderecoForm';
import type { AddressInput } from '../pedidos/pedidos.api';
import { addAddress, deleteAccount, removeAddress, updateProfile } from './conta.api';
import styles from './conta.module.css';

const ENDERECO_VAZIO: AddressInput = { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' };

export function ContaPage() {
  const auth = useAuth();
  if (auth.status === 'checking') return <p className={styles.muted}>Carregando sua conta…</p>;
  if (auth.status !== 'authenticated' || !auth.token || !auth.user) {
    return <Navigate to="/entrar?next=/conta" replace />;
  }
  return <ContaContent token={auth.token} />;
}

function ContaContent({ token }: { token: string }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const user = auth.user!;

  const [nome, setNome] = useState(user.nome);
  const [novoEndereco, setNovoEndereco] = useState<AddressInput>(ENDERECO_VAZIO);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState('');
  const [busy, setBusy] = useState(false);

  // Mantém o contexto de autenticação em dia depois de cada mudança.
  async function run(action: () => Promise<void>, sucesso: string) {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await action();
      await auth.refreshUser();
      setMessage(sucesso);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível concluir. Tente de novo.');
    } finally {
      setBusy(false);
    }
  }

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      await updateProfile(token, nome.trim());
    }, 'Nome atualizado.');
  }

  async function handleAddAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(async () => {
      await addAddress(token, { ...novoEndereco, uf: novoEndereco.uf.toUpperCase() });
      setNovoEndereco(ENDERECO_VAZIO);
    }, 'Endereço salvo.');
  }

  async function handleDelete() {
    if (confirmacao !== 'EXCLUIR') {
      setError('Digite EXCLUIR exatamente como mostrado para confirmar.');
      return;
    }
    setBusy(true);
    try {
      await deleteAccount(token);
      auth.logout();
      navigate('/');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível excluir a conta. Tente de novo.');
      setBusy(false);
    }
  }

  return (
    <section className={styles.page} aria-labelledby="conta-titulo">
      <h1 id="conta-titulo" className={styles.title}>
        Minha conta
      </h1>

      {message && <p role="status" className={styles.success}>{message}</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}

      <form className={styles.block} onSubmit={handleProfile}>
        <h2 className={styles.subtitle}>Dados pessoais</h2>
        <div className={styles.field}>
          <label htmlFor="conta-nome">Nome completo</label>
          <input id="conta-nome" value={nome} onChange={(event) => setNome(event.target.value)} autoComplete="name" />
        </div>
        <p className={styles.muted}>E-mail: {user.email}</p>
        <button type="submit" className={styles.button} disabled={busy}>
          Salvar nome
        </button>
      </form>

      <section className={styles.block} aria-labelledby="enderecos-titulo">
        <h2 id="enderecos-titulo" className={styles.subtitle}>Endereços</h2>
        {user.addresses.length === 0 && <p className={styles.muted}>Você ainda não guardou nenhum endereço.</p>}
        <ul className={styles.list}>
          {user.addresses.map((address) => (
            <li key={address.id} className={styles.row}>
              <span>
                {address.logradouro}, {address.numero} · {address.cidade}/{address.uf} · {address.cep}
              </span>
              <button
                type="button"
                className={styles.linkButton}
                disabled={busy}
                onClick={() => void run(() => removeAddress(token, address.id).then(() => undefined), 'Endereço removido.')}
              >
                Remover<span className={styles.visuallyHidden}> endereço {address.logradouro}</span>
              </button>
            </li>
          ))}
        </ul>

        <form className={styles.form} onSubmit={handleAddAddress}>
          <EnderecoForm value={novoEndereco} onChange={setNovoEndereco} />
          <button type="submit" className={styles.button} disabled={busy}>
            Salvar endereço
          </button>
        </form>
      </section>

      <section className={styles.danger} aria-labelledby="excluir-titulo">
        <h2 id="excluir-titulo" className={styles.subtitle}>Excluir conta</h2>
        <p className={styles.muted}>
          Seus dados pessoais são apagados. Pedidos e avaliações continuam registrados, sem a sua identificação, por obrigação fiscal.
        </p>
        <div className={styles.field}>
          <label htmlFor="conta-confirmacao">Para confirmar, digite EXCLUIR</label>
          <input id="conta-confirmacao" value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} autoComplete="off" />
        </div>
        <button type="button" className={styles.dangerButton} disabled={busy} onClick={handleDelete}>
          Excluir minha conta
        </button>
      </section>
    </section>
  );
}
