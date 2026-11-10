import { useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { flushPending } from '../../features/avaliacoes/avaliacoes.api';
import { useAuth } from '../../app/providers/auth-context';
import { useCart } from '../../app/providers/cart-context';
import styles from './Layout.module.css';

// Casca comum a todas as telas: cabeçalho com navegação, conteúdo e rodapé.
export function Layout() {
  const auth = useAuth();
  const cart = useCart();
  const token = auth.token;

  // RNF010: ao abrir o site e ao voltar a conexão, reenvia avaliações guardadas sem duplicar.
  useEffect(() => {
    if (!token) return;
    const send = () => void flushPending(token);
    send();
    window.addEventListener('online', send);
    return () => window.removeEventListener('online', send);
  }, [token]);

  return (
    <div className={styles.shell}>
      <a href="#conteudo" className={styles.skip}>
        Pular para o conteúdo
      </a>

      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          Origem Café
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          <NavLink to="/" end className={styles.navLink}>
            Cafés
          </NavLink>
          <NavLink to="/carrinho" className={styles.navLink}>
            Carrinho <span className={styles.badge}>{cart.count}</span>
            <span className={styles.visuallyHidden}>itens</span>
          </NavLink>
          {auth.status === 'authenticated' ? (
            <>
              <NavLink to="/pedidos" className={styles.navLink}>
                Pedidos
              </NavLink>
              <NavLink to="/assinatura" className={styles.navLink}>
                Clube
              </NavLink>
              <NavLink to="/conta" className={styles.navLink}>
                Conta
              </NavLink>
              {auth.user?.role === 'admin' && (
                <NavLink to="/admin" className={styles.navLink}>
                  Painel
                </NavLink>
              )}
              <button type="button" className={styles.linkButton} onClick={auth.logout}>
                Sair
              </button>
            </>
          ) : (
            <NavLink to="/entrar" className={styles.navLink}>
              Entrar
            </NavLink>
          )}
        </nav>
      </header>

      <main id="conteudo" className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>Origem Café · cafés especiais por origem</p>
      </footer>
    </div>
  );
}
