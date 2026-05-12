/**
 * Layout для публичных страниц аутентификации (/login, /register).
 * Центрирует контент на весь экран с приглушённым фоном.
 *
 * @param children - Страница аутентификации
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-center min-h-screen bg-muted/30">{children}</div>;
}
