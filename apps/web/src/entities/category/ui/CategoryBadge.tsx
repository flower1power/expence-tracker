import { Badge } from '@/components/ui/badge';
import type { Category } from '../model/category.types';

interface CategoryBadgeProps {
  category: Category;
}

const colorMap: Record<string, string> = {
  red: 'bg-red-100 text-red-800 hover:bg-red-100',
  green: 'bg-green-100 text-green-800 hover:bg-green-100',
  blue: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  purple: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  pink: 'bg-pink-100 text-pink-800 hover:bg-pink-100',
  orange: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  gray: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const colorClass = category.color ? colorMap[category.color] || '' : '';

  return (
    <Badge variant="secondary" className={colorClass}>
      {category.icon && <span className="mr-1">{category.icon}</span>}
      {category.name}
    </Badge>
  );
}
