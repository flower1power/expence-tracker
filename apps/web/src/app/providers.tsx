'use client';

import { AuthProvider } from '@/features/auth';

/**
 * Корневой компонент-агрегатор провайдеров приложения.
 *
 * @param children - Дочерние компоненты, обёрнутые в провайдеры
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
