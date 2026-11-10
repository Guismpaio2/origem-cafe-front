// Cliente HTTP único do front (AGENTS.md, seção 6: nenhuma tela chama fetch direto).

export interface ApiErrorBody {
  code: string;
  message: string;
  details: unknown[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown[];

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

const API_BASE = '/api/v1';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    // Falha de rede (RNF010): a mensagem diz o que aconteceu e o que fazer.
    throw new ApiError(0, {
      code: 'NETWORK_ERROR',
      message: 'Sem conexão com a Origem Café. Verifique sua internet e tente de novo.',
      details: [],
    });
  }

  const json: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const fallback: ApiErrorBody = {
      code: 'HTTP_ERROR',
      message: 'Não foi possível concluir a ação. Tente de novo.',
      details: [],
    };
    const body = (json as { error?: ApiErrorBody } | null)?.error ?? fallback;
    throw new ApiError(response.status, body);
  }

  return json as T;
}
