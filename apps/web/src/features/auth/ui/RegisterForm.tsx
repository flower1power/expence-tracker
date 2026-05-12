'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { registerSchema } from '../model/auth.schemas';
import { register as registerUser } from '../api/auth.api';
import { useAuth } from '../model/auth.store';

type RegisterFormData = z.infer<typeof registerSchema>;

/** Форма регистрации нового пользователя с Zod-валидацией через react-hook-form. */
export function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      agreeToTerms: false,
    },
  });

  /**
   * Обрабатывает валидную форму: вызывает API регистрации и сохраняет сессию.
   *
   * @param data - Валидированные данные формы
   */
  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const { agreeToTerms: _, ...credentials } = data;
      const response = await registerUser(credentials);
      setAuth(response.user, response.accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Создайте аккаунт для управления расходами</CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}
        noValidate
      >
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className={errors.name ? 'text-destructive' : ''}>
              Имя
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Иван Иванов"
              className={errors.name ? 'border-destructive' : ''}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className={errors.email ? 'text-destructive' : ''}>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={errors.email ? 'border-destructive' : ''}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className={errors.password ? 'text-destructive' : ''}>
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className={errors.password ? 'border-destructive' : ''}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="agreeToTerms" className={`text-sm leading-relaxed cursor-pointer ${errors.agreeToTerms ? 'text-destructive' : ''}`}>
              <input
                id="agreeToTerms"
                type="checkbox"
                className={`mr-2 h-4 w-4 rounded cursor-pointer align-middle accent-primary ${errors.agreeToTerms ? 'border-destructive' : 'border-input'}`}
                {...register('agreeToTerms')}
              />
              Согласен с <Link href="/terms" className="underline hover:no-underline" onClick={(e) => e.stopPropagation()}>пользовательским соглашением</Link> и <Link href="/privacy" className="underline hover:no-underline" onClick={(e) => e.stopPropagation()}>политикой обработки данных</Link>
            </label>
            {errors.agreeToTerms && (
              <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-6 border-t-0 bg-transparent">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Уже есть аккаунт?{' '}
            <a href="/login" className="text-foreground font-medium hover:underline">
              Войти
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
