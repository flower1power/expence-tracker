'use client';

import { useEffect } from 'react';
import {
  TransactionsList,
  CreateTransactionDialog,
  useTransactions,
} from '@/features/transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function TransactionsPage() {
  const {
    transactions,
    categories,
    isLoading,
    error,
    loadData,
    handleCreateTransaction,
    clearError,
  } = useTransactions();

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Транзакции</h1>
        <CreateTransactionDialog
          categories={categories}
          onSubmit={handleCreateTransaction}
        />
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={clearError}>
              Закрыть
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Все транзакции</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <TransactionsList transactions={transactions} pageSize={15} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
