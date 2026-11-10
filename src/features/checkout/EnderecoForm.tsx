import type { ChangeEvent } from 'react';
import type { AddressInput } from '../pedidos/pedidos.api';
import styles from './checkout.module.css';

interface EnderecoFormProps {
  value: AddressInput;
  onChange: (next: AddressInput) => void;
}

// Campos de endereço para entrega. A busca por CEP (ViaCEP) entra depois (RF009).
export function EnderecoForm({ value, onChange }: EnderecoFormProps) {
  const update = (field: keyof AddressInput) => (event: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [field]: event.target.value });

  return (
    <div className={styles.grid}>
      <div className={styles.field}>
        <label htmlFor="end-cep">CEP</label>
        <input id="end-cep" autoComplete="postal-code" inputMode="numeric" placeholder="00000-000" value={value.cep} onChange={update('cep')} />
      </div>
      <div className={styles.field}>
        <label htmlFor="end-logradouro">Rua, avenida ou praça</label>
        <input id="end-logradouro" autoComplete="address-line1" value={value.logradouro} onChange={update('logradouro')} />
      </div>
      <div className={styles.field}>
        <label htmlFor="end-numero">Número</label>
        <input id="end-numero" autoComplete="address-line2" value={value.numero} onChange={update('numero')} />
      </div>
      <div className={styles.field}>
        <label htmlFor="end-complemento">Complemento (opcional)</label>
        <input id="end-complemento" value={value.complemento} onChange={update('complemento')} />
      </div>
      <div className={styles.field}>
        <label htmlFor="end-bairro">Bairro</label>
        <input id="end-bairro" value={value.bairro} onChange={update('bairro')} />
      </div>
      <div className={styles.field}>
        <label htmlFor="end-cidade">Cidade</label>
        <input id="end-cidade" autoComplete="address-level2" value={value.cidade} onChange={update('cidade')} />
      </div>
      <div className={styles.field}>
        <label htmlFor="end-uf">UF</label>
        <input id="end-uf" maxLength={2} autoComplete="address-level1" value={value.uf} onChange={update('uf')} />
      </div>
    </div>
  );
}
