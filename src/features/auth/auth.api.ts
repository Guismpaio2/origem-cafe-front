import { apiRequest } from '../../shared/api/http';

export interface SavedAddress {
  id: string;
  apelido: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface UserDto {
  id: string;
  nome: string;
  email: string;
  role: 'cliente' | 'admin';
  addresses: SavedAddress[];
}

export interface AuthResult {
  user: UserDto;
  token: string;
}

export interface RegisterInput {
  nome: string;
  email: string;
  senha: string;
  consentimentoLgpd: true;
}

export async function loginRequest(email: string, senha: string): Promise<AuthResult> {
  const response = await apiRequest<{ data: AuthResult }>('/auth/login', {
    method: 'POST',
    body: { email, senha },
  });
  return response.data;
}

export async function registerRequest(input: RegisterInput): Promise<AuthResult> {
  const response = await apiRequest<{ data: AuthResult }>('/auth/register', {
    method: 'POST',
    body: input,
  });
  return response.data;
}

export async function fetchCurrentUser(token: string): Promise<UserDto> {
  const response = await apiRequest<{ data: UserDto }>('/auth/me', { token });
  return response.data;
}
