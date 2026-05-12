import { env } from '../config/env';
import { ApiException } from './types';

interface RequestOptions extends RequestInit {
  token?: string;
}

/**
 * Универсальный HTTP-клиент для запросов к API.
 * Автоматически добавляет Content-Type и, при наличии token, заголовок Authorization.
 *
 * @param endpoint - Путь относительно базового URL API (например, '/auth/login')
 * @param options - Опции fetch + необязательный JWT-токен
 * @returns Типизированный ответ от API
 * @throws ApiException если ответ сервера не является успешным (не 2xx)
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${env.apiUrl}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiException(
      response.status,
      data.message || 'Something went wrong',
    );
  }

  return data;
}
