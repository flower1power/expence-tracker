'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { login } from '../api/auth.api';
import { useAuth } from '../model/auth.store';

/** Форма входа в аккаунт с валидацией обязательных полей. */
export function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Обрабатывает отправку формы: вызывает API входа и сохраняет сессию.
   *
   * @param e - Событие отправки формы
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      setAuth(response.user, response.accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Введите данные для входа в аккаунт</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">Электронная почта</Label>
            <Input id="email" name="email" type="email" placeholder="example@mail.ru" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-6 border-t-0 bg-transparent">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Нет аккаунта?{' '}
            <a href="/register" className="text-foreground font-medium hover:underline">
              Зарегистрироваться
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
