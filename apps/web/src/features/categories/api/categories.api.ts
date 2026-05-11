import { apiClient } from '@/shared/api/client';
import type { Category } from '@/entities/category';

export async function getCategories(token: string): Promise<Category[]> {
  return apiClient<Category[]>('/categories', { token });
}
