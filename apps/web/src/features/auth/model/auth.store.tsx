'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/entities/user/model/user.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

/**
 * Провайдер контекста аутентификации.
 * При монтировании восстанавливает сессию из localStorage.
 *
 * @param children - Дочерние компоненты, которым доступен контекст
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  /**
   * Сохраняет данные аутентифицированного пользователя в state и localStorage.
   *
   * @param newUser - Данные пользователя
   * @param newToken - JWT access-токен
   */
  const setAuth = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  /** Очищает сессию пользователя из state и localStorage. */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Хук для доступа к контексту аутентификации.
 *
 * @returns Контекст аутентификации: user, token, setAuth, logout, isLoading
 * @throws Error если используется вне AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
