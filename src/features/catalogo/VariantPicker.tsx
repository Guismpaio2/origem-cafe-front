import styles from './VariantPicker.module.css';

export interface PickerOption<T extends string | number> {
  value: T;
  label: string;
}

interface VariantPickerProps<T extends string | number> {
  name: string;
  legend: string;
  options: PickerOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
}

// Grupo de opções com rádio por baixo: navegável por Tab e setas (RNF005), sem JavaScript extra.
export function VariantPicker<T extends string | number>({
  name,
  legend,
  options,
  selected,
  onSelect,
}: VariantPickerProps<T>) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => {
          const id = `${name}-${String(option.value)}`;
          const checked = selected === option.value;
          return (
            <label key={id} htmlFor={id} className={checked ? styles.optionChecked : styles.option}>
              <input
                id={id}
                type="radio"
                name={name}
                value={String(option.value)}
                checked={checked}
                onChange={() => onSelect(option.value)}
                className={styles.input}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
