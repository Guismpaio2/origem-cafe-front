import { Link, NavLink, Outlet } from 'react-router';
import { useAuth } from '../../app/providers/auth-context';
import { useCart } from '../../app/providers/cart-context';
import styles from './Layout.module.css';

// Casca comum a todas as telas: cabeçalho com navegação, conteúdo e rodapé.
export function Layout() {
  const auth = useAuth();
  const cart = useCart();

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
            <button type="button" className={styles.linkButton} onClick={auth.logout}>
              Sair
            </button>
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
