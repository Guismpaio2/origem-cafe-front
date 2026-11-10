import { useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: T };

interface Result<T> {
  key: string;
  data: T | null;
  message: string | null;
}

// Carrega dados quando a chave muda (ex.: id do produto ou filtro da URL).
// A chave identifica o pedido: resultados de chaves antigas são descartados.
export function useAsyncData<T>(key: string, load: () => Promise<T>, fallbackMessage: string): AsyncState<T> {
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    let ignore = false;

    load().then(
      (data) => {
        if (!ignore) setResult({ key, data, message: null });
      },
      (error: unknown) => {
        if (ignore) return;
        const message = error instanceof Error ? error.message : fallbackMessage;
        setResult({ key, data: null, message });
      },
    );

    return () => {
      ignore = true;
    };
    // De propósito, só a `key` é dependência: a função `load` é nova a cada render,
    // e incluí-la faria a requisição repetir em loop. A chave descreve a carga inteira.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!result || result.key !== key) return { status: 'loading' };
  if (result.message !== null) return { status: 'error', message: result.message };
  return { status: 'ready', data: result.data as T };
}
