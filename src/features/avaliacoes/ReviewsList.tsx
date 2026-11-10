import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { fetchReviews } from './avaliacoes.api';
import styles from './avaliacoes.module.css';

export function ReviewsList({ productId, version }: { productId: string; version: number }) {
  const reviews = useAsyncData(`avaliacoes:${productId}:${version}`, () => fetchReviews(productId), 'Não foi possível carregar as avaliações.');

  if (reviews.status === 'loading') return <p className={styles.muted}>Carregando avaliações…</p>;
  if (reviews.status === 'error') return <p role="alert" className={styles.error}>{reviews.message}</p>;
  if (reviews.data.length === 0) return <p className={styles.muted}>Ainda não há avaliações para este café.</p>;

  return (
    <ul className={styles.list}>
      {reviews.data.map((review) => (
        <li key={review.id} className={styles.review}>
          <p className={styles.stars} aria-label={`${review.nota} de 5 estrelas`}>{'★'.repeat(review.nota)}<span className={styles.muted}>{'★'.repeat(5 - review.nota)}</span></p>
          {review.comentario && <p>{review.comentario}</p>}
          <p className={styles.muted}>{review.autor}</p>
        </li>
      ))}
    </ul>
  );
}
