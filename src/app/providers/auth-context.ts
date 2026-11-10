import { createContext, useContext } from 'react';
import type { RegisterInput, UserDto } from '../../features/auth/auth.api';

export interface AuthContextValue {
  user: UserDto | null;
  token: string | null;
  status: 'checking' | 'anonymous' | 'authenticated';
  login: (email: string, senha: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// Hook: o componente diz "me dê o usuário" e não precisa saber de onde ele vem.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  }
  return context;
}
