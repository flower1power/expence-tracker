import { apiClient } from '@/shared/api/client';
import type { Transaction, CreateTransactionInput } from '@/entities/transaction';

export async function getTransactions(token: string): Promise<Transaction[]> {
  return apiClient<Transaction[]>('/transactions', { token });
}

export async function createTransaction(
  input: CreateTransactionInput,
  token: string,
): Promise<Transaction> {
  return apiClient<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
    token,
  });
}
