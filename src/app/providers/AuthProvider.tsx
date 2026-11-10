import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  fetchCurrentUser,
  loginRequest,
  registerRequest,
  type RegisterInput,
  type UserDto,
} from '../../features/auth/auth.api';
import { ApiError } from '../../shared/api/http';
import { AuthContext, type AuthContextValue } from './auth-context';

const TOKEN_KEY = 'origem-cafe.token';

// O token JWT dura 15 min (RNF002). Guardamos no localStorage só para sobreviver ao recarregamento.
function readToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null): void {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Sem armazenamento: a sessão dura só enquanto a aba estiver aberta.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<UserDto | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>(() =>
    readToken() ? 'checking' : 'anonymous',
  );

  // Ao abrir a página com um token salvo, confirma com a API quem é o usuário.
  useEffect(() => {
    if (!token) return;

    let active = true;
    fetchCurrentUser(token)
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (!active) return;
        // Token expirado ou inválido: limpa a sessão. Falha de rede mantém o token.
        if (error instanceof ApiError && error.status === 401) {
          writeToken(null);
          setToken(null);
        }
        setUser(null);
        setStatus('anonymous');
      });

    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      status,
      login: async (email, senha) => {
        const result = await loginRequest(email, senha);
        writeToken(result.token);
        setToken(result.token);
        setUser(result.user);
        setStatus('authenticated');
      },
      register: async (input: RegisterInput) => {
        const result = await registerRequest(input);
        writeToken(result.token);
        setToken(result.token);
        setUser(result.user);
        setStatus('authenticated');
      },
      logout: () => {
        writeToken(null);
        setToken(null);
        setUser(null);
        setStatus('anonymous');
      },
    }),
    [user, token, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
