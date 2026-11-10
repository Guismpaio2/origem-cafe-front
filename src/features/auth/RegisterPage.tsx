import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../../app/providers/auth-context';
import styles from './auth.module.css';

export function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (auth.status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Validação visível e explicada (RNF004): cada erro diz o que falta.
    if (nome.trim().length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    if (!email.trim()) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (senha.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (!consent) {
      setError('Marque a caixa de consentimento para criar a conta.');
      return;
    }

    setPending(true);
    try {
      await auth.register({ nome: nome.trim(), email, senha, consentimentoLgpd: true });
      navigate('/');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível criar a conta. Tente de novo.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.page} aria-labelledby="cadastro-titulo">
      <div className={styles.intro}>
        <h1 id="cadastro-titulo" className={styles.title}>
          Criar conta
        </h1>
        <p className={styles.lead}>Uma conta guarda seus pedidos, endereços e assinaturas.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && (
          <p role="alert" className={styles.alert}>
            {error}
          </p>
        )}

        <div className={styles.field}>
          <label htmlFor="cadastro-nome">Nome completo</label>
          <input
            id="cadastro-nome"
            name="nome"
            autoComplete="name"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="cadastro-email">E-mail</label>
          <input
            id="cadastro-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="cadastro-senha">Senha</label>
          <input
            id="cadastro-senha"
            name="senha"
            type="password"
            autoComplete="new-password"
            aria-describedby="cadastro-senha-ajuda"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
          />
          <p id="cadastro-senha-ajuda" className={styles.help}>
            Mínimo de 8 caracteres.
          </p>
        </div>

        <div className={styles.consent}>
          <input
            id="cadastro-consentimento"
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <label htmlFor="cadastro-consentimento">
            Concordo que a Origem Café use meus dados pessoais para criar e manter a minha conta, conforme a Lei
            Geral de Proteção de Dados (LGPD). Posso excluir a conta quando quiser.
          </label>
        </div>

        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? 'Criando conta…' : 'Criar conta'}
        </button>

        <p className={styles.switch}>
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </p>
      </form>
    </section>
  );
}
