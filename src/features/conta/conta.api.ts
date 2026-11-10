import { apiRequest } from '../../shared/api/http';
import type { AddressInput } from '../pedidos/pedidos.api';
import type { UserDto } from '../auth/auth.api';

export async function updateProfile(token: string, nome: string): Promise<UserDto> {
  const response = await apiRequest<{ data: UserDto }>('/users/me', { method: 'PATCH', body: { nome }, token });
  return response.data;
}

export async function addAddress(token: string, address: AddressInput): Promise<UserDto> {
  const response = await apiRequest<{ data: UserDto }>('/users/me/addresses', { method: 'POST', body: address, token });
  return response.data;
}

export async function removeAddress(token: string, addressId: string): Promise<UserDto> {
  const response = await apiRequest<{ data: UserDto }>(`/users/me/addresses/${encodeURIComponent(addressId)}`, {
    method: 'DELETE',
    token,
  });
  return response.data;
}

export async function deleteAccount(token: string): Promise<void> {
  await apiRequest<void>('/users/me', { method: 'DELETE', body: { confirmacao: 'EXCLUIR' }, token });
}
