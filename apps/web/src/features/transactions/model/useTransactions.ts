'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/features/auth';
import { getTransactions, createTransaction } from '../api/transactions.api';
import { getCategories } from '@/features/categories';
import type { Transaction } from '@/entities/transaction';
import type { Category } from '@/entities/category';
import type { CreateTransactionFormData } from './transaction.schemas';

export function useTransactions() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const [transactionsData, categoriesData] = await Promise.all([
        getTransactions(token),
        getCategories(token),
      ]);
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Не удалось загрузить данные';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleCreateTransaction = useCallback(
    async (data: CreateTransactionFormData) => {
      if (!token) throw new Error('Требуется авторизация');

      try {
        await createTransaction(
          {
            type: data.type,
            amount: data.amount,
            description: data.description,
            date: data.date,
            categoryId: data.categoryId,
          },
          token,
        );
        await loadData();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Не удалось создать транзакцию';
        setError(errorMessage);
        throw err;
      }
    },
    [token, loadData],
  );

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );

  return {
    transactions: sortedTransactions,
    categories,
    isLoading,
    error,
    loadData,
    handleCreateTransaction,
    clearError: () => setError(null),
  };
}
