import { apiClient } from '@/shared/api/client';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../model/auth.types';

/**
 * Аутентифицирует пользователя по email и паролю.
 *
 * @param credentials - Email и пароль пользователя
 * @returns JWT access-токен и данные пользователя
 * @throws ApiException если учётные данные неверны (401)
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

/**
 * Регистрирует нового пользователя.
 *
 * @param credentials - Email, имя и пароль нового пользователя
 * @returns JWT access-токен и данные созданного пользователя
 * @throws ApiException если email уже занят (409)
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
