'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { getCategories } from '@/features/categories';
import { CategoryBadge, type Category } from '@/entities/category';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCategories(token);
      setCategories(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Не удалось загрузить категории';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Категории</h1>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Закрыть
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Все категории</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground">Категорий пока нет</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <CategoryBadge key={category.id} category={category} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
