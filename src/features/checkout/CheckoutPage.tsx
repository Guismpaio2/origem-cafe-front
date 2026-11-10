import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../../app/providers/auth-context';
import { useCart } from '../../app/providers/cart-context';
import { formatCentavos } from '../../shared/format/money';
import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { createOrder, type AddressInput, type TipoEntrega } from '../pedidos/pedidos.api';
import { quoteShipping, type CheckoutLine } from './checkout.api';
import { AgendaRetirada } from './AgendaRetirada';
import { EnderecoForm } from './EnderecoForm';
import styles from './checkout.module.css';

const ENDERECO_VAZIO: AddressInput = {
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

// Guarda da rota: finalizar exige login (RU003). Quem não entrou vai para /entrar e volta aqui.
export function CheckoutPage() {
  const auth = useAuth();
  const cart = useCart();

  if (auth.status === 'checking') {
    return <p className={styles.muted}>Carregando sua conta…</p>;
  }
  if (auth.status !== 'authenticated' || !auth.token) {
    return <Navigate to="/entrar?next=/checkout" replace />;
  }
  if (cart.items.length === 0) {
    return (
      <section className={styles.page}>
        <h1 className={styles.title}>Nada para finalizar</h1>
        <p className={styles.muted}>Seu carrinho está vazio.</p>
        <Link to="/" className={styles.primaryLink}>
          Ver os cafés
        </Link>
      </section>
    );
  }

  return <CheckoutForm token={auth.token} />;
}

function CheckoutForm({ token }: { token: string }) {
  const cart = useCart();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<TipoEntrega>('entrega');
  const [endereco, setEndereco] = useState<AddressInput>(ENDERECO_VAZIO);
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix');
  const [simularRecusa, setSimularRecusa] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // O frete e o total vêm da API (RN006). O front não calcula preço.
  const lines: CheckoutLine[] = cart.items.map((item) => ({
    productId: item.productId,
    sku: item.sku,
    quantidade: item.quantidade,
  }));
  const linesKey = lines.map((line) => `${line.sku}x${line.quantidade}`).join('|');
  const quote = useAsyncData(
    `quote:${tipo}:${linesKey}`,
    () => quoteShipping(lines, tipo),
    'Não foi possível calcular o frete agora.',
  );

  function validar(): string | null {
    if (tipo === 'entrega') {
      if (!/^\d{5}-?\d{3}$/.test(endereco.cep.trim())) return 'Informe um CEP válido, no formato 00000-000.';
      if (endereco.logradouro.trim().length < 3) return 'Informe a rua ou avenida de entrega.';
      if (!endereco.numero.trim()) return 'Informe o número do endereço.';
      if (endereco.cidade.trim().length < 2) return 'Informe a cidade.';
      if (endereco.uf.trim().length !== 2) return 'Informe a UF com 2 letras, por exemplo MG.';
      return null;
    }
    if (!data) return 'Escolha o dia da retirada.';
    if (!horario) return 'Escolha um horário livre para a retirada.';
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validar();
    if (problem) {
      setFormError(problem);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      const order = await createOrder(token, {
        items: lines,
        tipoEntrega: tipo,
        endereco: tipo === 'entrega' ? { ...endereco, uf: endereco.uf.toUpperCase() } : undefined,
        agendamento: tipo === 'retirada' ? { data, horario } : undefined,
        pagamento: { metodo, simularRecusa: import.meta.env.DEV ? simularRecusa : false },
      });
      cart.clear();
      navigate(`/pedidos/${order.id}`);
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Não foi possível concluir o pedido. Tente de novo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.page} aria-labelledby="checkout-titulo">
      <h1 id="checkout-titulo" className={styles.title}>
        Finalizar compra
      </h1>

      <form className={styles.layout} onSubmit={handleSubmit} noValidate>
        <div className={styles.steps}>
          {formError && (
            <p role="alert" className={styles.error}>
              {formError}
            </p>
          )}

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Como você quer receber</legend>
            <div className={styles.choices}>
              <label className={tipo === 'entrega' ? styles.choiceChecked : styles.choice}>
                <input type="radio" name="tipo" value="entrega" checked={tipo === 'entrega'} onChange={() => setTipo('entrega')} />
                Entrega no endereço
              </label>
              <label className={tipo === 'retirada' ? styles.choiceChecked : styles.choice}>
                <input type="radio" name="tipo" value="retirada" checked={tipo === 'retirada'} onChange={() => setTipo('retirada')} />
                Retirar na loja
              </label>
            </div>
          </fieldset>

          {tipo === 'entrega' ? (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Endereço de entrega</legend>
              <EnderecoForm value={endereco} onChange={setEndereco} />
            </fieldset>
          ) : (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Dia e horário</legend>
              <AgendaRetirada data={data} horario={horario} onDataChange={setData} onHorarioChange={setHorario} />
            </fieldset>
          )}

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Pagamento</legend>
            <div className={styles.choices}>
              <label className={metodo === 'pix' ? styles.choiceChecked : styles.choice}>
                <input type="radio" name="metodo" value="pix" checked={metodo === 'pix'} onChange={() => setMetodo('pix')} />
                Pix
              </label>
              <label className={metodo === 'cartao' ? styles.choiceChecked : styles.choice}>
                <input type="radio" name="metodo" value="cartao" checked={metodo === 'cartao'} onChange={() => setMetodo('cartao')} />
                Cartão
              </label>
            </div>
            <p className={styles.help}>
              Ambiente de teste: nenhum pagamento real é feito e nenhum dado de cartão é guardado.
            </p>
            {import.meta.env.DEV && (
              <label className={styles.devToggle}>
                <input type="checkbox" checked={simularRecusa} onChange={(event) => setSimularRecusa(event.target.checked)} />
                Simular pagamento recusado (só em desenvolvimento)
              </label>
            )}
          </fieldset>
        </div>

        <aside className={styles.summary} aria-label="Resumo do pedido">
          <h2 className={styles.summaryTitle}>Resumo</h2>
          <ul className={styles.summaryList}>
            {cart.items.map((item) => (
              <li key={item.sku}>
                <span>
                  {item.quantidade} × {item.nome}
                  {item.pesoGramas ? ` (${item.pesoGramas} g)` : ''}
                </span>
                <span>{formatCentavos(item.precoCentavos * item.quantidade)}</span>
              </li>
            ))}
          </ul>

          {quote.status === 'loading' && <p className={styles.muted}>Calculando frete…</p>}
          {quote.status === 'error' && (
            <p role="alert" className={styles.error}>
              {quote.message}
            </p>
          )}
          {quote.status === 'ready' && (
            <dl className={styles.totals}>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatCentavos(quote.data.subtotalCentavos)}</dd>
              </div>
              <div>
                <dt>Frete</dt>
                <dd>{quote.data.freteCentavos === 0 ? 'Sem frete' : formatCentavos(quote.data.freteCentavos)}</dd>
              </div>
              <div className={styles.grandTotal}>
                <dt>Total</dt>
                <dd>{formatCentavos(quote.data.totalCentavos)}</dd>
              </div>
            </dl>
          )}

          <p className={styles.help}>
            Você pode desistir da compra em até 7 dias após o recebimento (direito de arrependimento, CDC art. 49).
          </p>

          <button type="submit" className={styles.submit} disabled={submitting || quote.status !== 'ready'}>
            {submitting ? 'Confirmando pedido…' : 'Confirmar pedido'}
          </button>
        </aside>
      </form>
    </section>
  );
}
