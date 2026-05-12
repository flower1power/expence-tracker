import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Объединяет CSS-классы с разрешением конфликтов Tailwind.
 *
 * @param inputs - Условные и безусловные классы (строки, объекты, массивы)
 * @returns Итоговая строка классов без дублирующих Tailwind-утилит
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
