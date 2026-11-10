import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../app/providers/auth-context';
import styles from './auth.module.css';

// Só aceita caminhos internos (ex.: /checkout). Evita redirecionar para outro site.
function destinoDepoisDoLogin(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destino = destinoDepoisDoLogin(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (auth.status === 'authenticated') {
    return <Navigate to={destino} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !senha) {
      setError('Informe o e-mail e a senha para entrar.');
      return;
    }

    setPending(true);
    try {
      await auth.login(email, senha);
      navigate(destino);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível entrar. Tente de novo.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.page} aria-labelledby="entrar-titulo">
      <div className={styles.intro}>
        <h1 id="entrar-titulo" className={styles.title}>
          Entrar
        </h1>
        <p className={styles.lead}>
          Você pode navegar e montar o carrinho sem conta. Entre só quando for finalizar a compra.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error && (
          <p role="alert" className={styles.alert}>
            {error}
          </p>
        )}

        <div className={styles.field}>
          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="login-senha">Senha</label>
          <input
            id="login-senha"
            name="senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar na minha conta'}
        </button>

        <p className={styles.switch}>
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </section>
  );
}
