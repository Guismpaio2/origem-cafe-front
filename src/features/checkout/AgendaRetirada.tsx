import { useAsyncData } from '../../shared/hooks/useAsyncData';
import { VariantPicker } from '../../shared/components/VariantPicker';
import { fetchPickupSlots } from './checkout.api';
import styles from './checkout.module.css';

interface AgendaRetiradaProps {
  data: string;
  horario: string;
  onDataChange: (data: string) => void;
  onHorarioChange: (horario: string) => void;
}

// Hoje no fuso local, no formato AAAA-MM-DD, para bloquear datas passadas no seletor.
function hojeLocal(): string {
  return new Date().toLocaleDateString('en-CA');
}

// Retirada: a data escolhida consulta a API, que aplica a RN003 (seg a sáb, 08h–18h, 2 h de antecedência).
export function AgendaRetirada({ data, horario, onDataChange, onHorarioChange }: AgendaRetiradaProps) {
  const slots = useAsyncData(
    `slots:${data}`,
    () => (data ? fetchPickupSlots(data) : Promise.resolve([] as string[])),
    'Não foi possível carregar os horários.',
  );

  return (
    <div className={styles.agenda}>
      <div className={styles.field}>
        <label htmlFor="retirada-data">Dia da retirada</label>
        <input
          id="retirada-data"
          type="date"
          min={hojeLocal()}
          value={data}
          onChange={(event) => {
            onDataChange(event.target.value);
            onHorarioChange('');
          }}
        />
        <p className={styles.help}>Retiramos de segunda a sábado. Domingo não há retirada.</p>
      </div>

      {data && slots.status === 'loading' && <p className={styles.muted}>Buscando horários livres…</p>}
      {data && slots.status === 'error' && (
        <p role="alert" className={styles.error}>
          {slots.message}
        </p>
      )}
      {data && slots.status === 'ready' && slots.data.length === 0 && (
        <p role="alert" className={styles.error}>
          Não há horários livres nesse dia. Escolha outra data.
        </p>
      )}
      {data && slots.status === 'ready' && slots.data.length > 0 && (
        <VariantPicker
          name="horario"
          legend="Horário"
          options={slots.data.map((value) => ({ value, label: value }))}
          selected={horario || null}
          onSelect={onHorarioChange}
        />
      )}
    </div>
  );
}
