import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], {
    message: 'Выберите тип транзакции',
  }),
  amount: z
    .number({ message: 'Введите сумму' })
    .positive('Сумма должна быть положительной'),
  description: z.string().optional(),
  date: z.string().min(1, 'Выберите дату'),
  categoryId: z.string().optional(),
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
