'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategorySelect } from '@/shared/ui';
import type { Category } from '@/entities/category';
import {
  createTransactionSchema,
  type CreateTransactionFormData,
} from '../model/transaction.schemas';

interface CreateTransactionFormProps {
  categories: Category[];
  onSubmit: (data: CreateTransactionFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CreateTransactionForm({
  categories,
  onSubmit,
  isLoading = false,
}: CreateTransactionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const type = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Тип транзакции</Label>
        <Select
          value={type}
          onValueChange={(value) =>
            setValue('type', value as 'INCOME' | 'EXPENSE')
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">💸 Расход</SelectItem>
            <SelectItem value="INCOME">💰 Доход</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Сумма</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="1000"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание (необязательно)</Label>
        <Input
          id="description"
          placeholder="Покупка продуктов"
          {...register('description')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Дата</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Категория (необязательно)</Label>
        <CategorySelect
          categories={categories}
          value={watch('categoryId')}
          onValueChange={(value) => setValue('categoryId', value)}
          placeholder="Без категории"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Создание...' : 'Создать транзакцию'}
      </Button>
    </form>
  );
}
