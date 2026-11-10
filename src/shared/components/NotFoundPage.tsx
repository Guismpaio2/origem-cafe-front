import { Link } from 'react-router';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <section className={styles.page}>
      <h1>Página não encontrada</h1>
      <p className={styles.text}>O endereço pode estar errado ou a página foi movida.</p>
      <Link to="/" className={styles.link}>
        Voltar para os cafés
      </Link>
    </section>
  );
}
