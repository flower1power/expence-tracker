'use client';

import { cn } from '@/lib/utils';
import type { Transaction } from '../model/transaction.types';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isExpense = transaction.type === 'EXPENSE';
  const formattedAmount = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(transaction.amount);

  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(transaction.date));

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-2xl">
          {transaction.category?.icon || (isExpense ? '💸' : '💰')}
        </span>
        <div>
          <p className="font-medium">
            {transaction.category?.name || (isExpense ? 'Расход' : 'Доход')}
          </p>
          {transaction.description && (
            <p className="text-sm text-muted-foreground">{transaction.description}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'font-semibold',
            isExpense ? 'text-red-500' : 'text-green-500',
          )}
        >
          {isExpense ? '-' : '+'}{formattedAmount}
        </p>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>
    </div>
  );
}
