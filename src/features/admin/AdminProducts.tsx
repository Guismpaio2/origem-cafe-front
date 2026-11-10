import { useState, type FormEvent } from 'react';
import { useAuth } from '../../app/providers/auth-context';
import { formatCentavos } from '../../shared/format/money';
import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { createAdminProduct, deactivateAdminProduct, fetchAdminProducts, type AdminVariant, type ProductInput } from './admin.api';
import styles from './admin.module.css';

const VARIANTE_VAZIA: AdminVariant & { precoReais: string; pesoTexto: string } = {
  sku: '',
  moagem: '',
  pesoGramas: undefined,
  pesoTexto: '',
  precoReais: '',
  precoCentavos: 0,
  estoque: 0,
};

export function AdminProducts() {
  const auth = useAuth();
  const token = auth.token ?? '';
  const [version, setVersion] = useState(0);
  const products = useAsyncData(`admin-produtos:${token}:${version}`, () => fetchAdminProducts(token), 'Não foi possível carregar os produtos.');

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'cafe' | 'acessorio'>('cafe');
  const [origem, setOrigem] = useState('');
  const [descricao, setDescricao] = useState('');
  const [notas, setNotas] = useState('');
  const [variants, setVariants] = useState([{ ...VARIANTE_VAZIA }]);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  function updateVariant(index: number, patch: Partial<(typeof variants)[number]>) {
    setVariants((current) => current.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setMensagem(null);
    const payload: ProductInput = {
      nome: nome.trim(),
      tipo,
      origem: origem.trim(),
      descricao: descricao.trim(),
      notasSensoriais: notas.split(',').map((note) => note.trim()).filter(Boolean),
      variants: variants.map((variant) => ({
        sku: variant.sku.trim(),
        moagem: tipo === 'cafe' ? variant.moagem?.trim() || undefined : undefined,
        pesoGramas: tipo === 'cafe' && variant.pesoTexto ? Number(variant.pesoTexto) : undefined,
        precoCentavos: Math.round(Number(variant.precoReais.replace(',', '.')) * 100),
        estoque: Number(variant.estoque),
      })),
    };
    try {
      await createAdminProduct(token, payload);
      setMensagem('Produto cadastrado.');
      setNome('');
      setOrigem('');
      setDescricao('');
      setNotas('');
      setVariants([{ ...VARIANTE_VAZIA }]);
      setVersion((value) => value + 1);
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : 'Não foi possível cadastrar o produto.');
    }
  }

  async function handleDeactivate(id: string) {
    setErro(null);
    try {
      await deactivateAdminProduct(token, id);
      setMensagem('Produto saiu do catálogo.');
      setVersion((value) => value + 1);
    } catch (caught) {
      setErro(caught instanceof Error ? caught.message : 'Não foi possível desativar o produto.');
    }
  }

  return (
    <div className={styles.block}>
      {mensagem && <p role="status" className={styles.success}>{mensagem}</p>}
      {erro && <p role="alert" className={styles.error}>{erro}</p>}

      <form className={styles.form} onSubmit={handleCreate}>
        <h2 className={styles.subtitle}>Novo produto</h2>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="p-nome">Nome</label>
            <input id="p-nome" value={nome} onChange={(event) => setNome(event.target.value)} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="p-tipo">Tipo</label>
            <select id="p-tipo" value={tipo} onChange={(event) => setTipo(event.target.value as 'cafe' | 'acessorio')}>
              <option value="cafe">Café</option>
              <option value="acessorio">Acessório</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="p-origem">Origem</label>
            <input id="p-origem" value={origem} onChange={(event) => setOrigem(event.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="p-notas">Notas de xícara (separe por vírgula)</label>
            <input id="p-notas" value={notas} onChange={(event) => setNotas(event.target.value)} />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="p-descricao">Descrição</label>
          <textarea id="p-descricao" rows={3} value={descricao} onChange={(event) => setDescricao(event.target.value)} />
        </div>

        <fieldset className={styles.fieldset}>
          <legend className={styles.subtitle}>Variantes</legend>
          {variants.map((variant, index) => (
            <div key={index} className={styles.variant}>
              <input aria-label={`SKU da variante ${index + 1}`} placeholder="SKU" value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value })} />
              {tipo === 'cafe' && (
                <>
                  <input aria-label={`Moagem da variante ${index + 1}`} placeholder="Moagem" value={variant.moagem ?? ''} onChange={(event) => updateVariant(index, { moagem: event.target.value })} />
                  <input aria-label={`Peso em gramas da variante ${index + 1}`} placeholder="Peso (g)" inputMode="numeric" value={variant.pesoTexto} onChange={(event) => updateVariant(index, { pesoTexto: event.target.value })} />
                </>
              )}
              <input aria-label={`Preço da variante ${index + 1} em reais`} placeholder="Preço (R$)" inputMode="decimal" value={variant.precoReais} onChange={(event) => updateVariant(index, { precoReais: event.target.value })} />
              <input aria-label={`Estoque da variante ${index + 1}`} placeholder="Estoque" inputMode="numeric" value={String(variant.estoque)} onChange={(event) => updateVariant(index, { estoque: Number(event.target.value) || 0 })} />
            </div>
          ))}
          <button type="button" className={styles.linkButton} onClick={() => setVariants((current) => [...current, { ...VARIANTE_VAZIA }])}>
            Adicionar variante
          </button>
        </fieldset>

        <button type="submit" className={styles.button}>Cadastrar produto</button>
      </form>

      <h2 className={styles.subtitle}>Produtos</h2>
      {products.status === 'loading' && <p className={styles.muted}>Carregando…</p>}
      {products.status === 'error' && <p role="alert" className={styles.error}>{products.message}</p>}
      {products.status === 'ready' && (
        <ul className={styles.list}>
          {products.data.map((product) => (
            <li key={product.id} className={styles.row}>
              <span>
                {product.nome} · {product.ativo ? 'no catálogo' : 'desativado'}
                {product.variants[0] && ` · a partir de ${formatCentavos(Math.min(...product.variants.map((v) => v.precoCentavos)))}`}
              </span>
              {product.ativo && (
                <button type="button" className={styles.linkButton} onClick={() => void handleDeactivate(product.id)}>
                  Tirar do catálogo
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
