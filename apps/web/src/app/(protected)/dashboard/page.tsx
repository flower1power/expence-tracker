'use client';

import { useEffect } from 'react';
import { useAuth } from '@/features/auth';
import {
  TransactionsList,
  CreateTransactionDialog,
  useTransactions,
} from '@/features/transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

/** Главная страница дашборда для аутентифицированного пользователя. */
export default function DashboardPage() {
  const { user } = useAuth();
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Профиль</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Имя</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateTransactionDialog
              categories={categories}
              onSubmit={handleCreateTransaction}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние транзакции</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <TransactionsList transactions={transactions} pageSize={10} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
