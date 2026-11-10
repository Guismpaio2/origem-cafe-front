import { useState, type FormEvent } from 'react';
import { ApiError } from '../../shared/api/http';
import { VariantPicker } from '../../shared/components/VariantPicker';
import { sendReview, savePending } from './avaliacoes.api';
import styles from './avaliacoes.module.css';

interface ReviewFormProps {
  token: string;
  productId: string;
  productName: string;
  onSent: () => void;
}

// RS002: 1 a 5 estrelas e comentário opcional. Falha de rede guarda a avaliação para reenvio (RNF010).
export function ReviewForm({ token, productId, productName, onSent }: ReviewFormProps) {
  const [nota, setNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setMensagem(null);
    if (nota === null) {
      setErro('Escolha de 1 a 5 estrelas para enviar a avaliação.');
      return;
    }
    setPending(true);
    try {
      await sendReview(token, productId, nota, comentario.trim());
      setMensagem('Obrigado! Sua avaliação foi registrada.');
      onSent();
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 0) {
        savePending({ productId, nota, comentario: comentario.trim() });
        setMensagem('Sem conexão agora. Guardamos sua avaliação e enviaremos quando a internet voltar.');
      } else if (caught instanceof ApiError && caught.status === 409) {
        setMensagem('Você já avaliou este produto.');
        onSent();
      } else {
        setErro(caught instanceof Error ? caught.message : 'Não foi possível enviar a avaliação.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.formTitle}>Avalie {productName}</p>
      <VariantPicker
        name={`nota-${productId}`}
        legend="Sua nota"
        options={[1, 2, 3, 4, 5].map((value) => ({ value, label: `${value} ★` }))}
        selected={nota}
        onSelect={setNota}
      />
      <div className={styles.field}>
        <label htmlFor={`comentario-${productId}`}>Comentário (opcional)</label>
        <textarea id={`comentario-${productId}`} rows={3} maxLength={1000} value={comentario} onChange={(event) => setComentario(event.target.value)} />
      </div>
      {erro && <p role="alert" className={styles.error}>{erro}</p>}
      {mensagem && <p role="status" className={styles.muted}>{mensagem}</p>}
      <button type="submit" className={styles.button} disabled={pending}>
        {pending ? 'Enviando…' : 'Enviar avaliação'}
      </button>
    </form>
  );
}
