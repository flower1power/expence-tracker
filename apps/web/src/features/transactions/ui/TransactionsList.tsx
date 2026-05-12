'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TransactionCard, type Transaction } from '@/entities/transaction';

interface TransactionsListProps {
  transactions: Transaction[];
  pageSize?: number;
}

export function TransactionsList({
  transactions,
  pageSize = 10,
}: TransactionsListProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [transactions]);

  const { totalPages, currentTransactions } = useMemo(() => {
    const total = Math.ceil(transactions.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const current = transactions.slice(startIndex, endIndex);

    return {
      totalPages: total,
      currentTransactions: current,
    };
  }, [transactions, page, pageSize]);

  const goToPrevPage = () => setPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Транзакций пока нет
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {currentTransactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={page === 1}
          >
            ← Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={page === totalPages}
          >
            Вперёд →
          </Button>
        </div>
      )}
    </div>
  );
}
