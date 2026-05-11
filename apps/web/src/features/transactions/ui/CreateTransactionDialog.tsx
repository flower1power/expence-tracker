'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Category } from '@/entities/category';
import { CreateTransactionForm } from './CreateTransactionForm';
import type { CreateTransactionFormData } from '../model/transaction.schemas';

interface CreateTransactionDialogProps {
  categories: Category[];
  onSubmit: (data: CreateTransactionFormData) => Promise<void>;
}

export function CreateTransactionDialog({
  categories,
  onSubmit,
}: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateTransactionFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>+ Создать транзакцию</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая транзакция</DialogTitle>
          <DialogDescription>
            Добавьте новый доход или расход
          </DialogDescription>
        </DialogHeader>
        <CreateTransactionForm
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
