import { NavLink, Navigate, Outlet } from 'react-router';
import { useAuth } from '../../app/providers/auth-context';
import styles from './admin.module.css';

// Guarda das rotas administrativas: no front é só UX. A API valida o papel em cada chamada (RNF007).
export function AdminLayout() {
  const auth = useAuth();
  if (auth.status === 'checking') return <p className={styles.muted}>Carregando…</p>;
  if (auth.status !== 'authenticated') return <Navigate to="/entrar?next=/admin" replace />;
  if (auth.user?.role !== 'admin') {
    return (
      <section className={styles.page}>
        <h1 className={styles.title}>Acesso restrito</h1>
        <p className={styles.muted}>Esta área é só para a equipe da Origem Café.</p>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-labelledby="admin-titulo">
      <h1 id="admin-titulo" className={styles.title}>
        Painel da equipe
      </h1>
      <nav className={styles.tabs} aria-label="Seções do painel">
        <NavLink to="/admin" end className={({ isActive }) => (isActive ? styles.tabActive : styles.tab)}>
          Resumo
        </NavLink>
        <NavLink to="/admin/produtos" className={({ isActive }) => (isActive ? styles.tabActive : styles.tab)}>
          Produtos
        </NavLink>
        <NavLink to="/admin/pedidos" className={({ isActive }) => (isActive ? styles.tabActive : styles.tab)}>
          Pedidos
        </NavLink>
      </nav>
      <Outlet />
    </section>
  );
}
