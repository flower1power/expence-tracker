import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'Необходимо принять пользовательское соглашение',
  }),
});
