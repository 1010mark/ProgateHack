import { TableRow, TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { Ingredient, IngredientCategory } from '@/types/ingredients';

interface IngredientsTableRowProps {
  ingredient: Ingredient;
  className?: string;
}

const categoryColor = (ingredient: Ingredient) => {
  switch (ingredient.category) {
    case '野菜':
      return 'bg-green-100/80';
    case '果物':
      return 'bg-yellow-100/80';
    case '肉':
      return 'bg-red-100/80';
    case '魚':
      return 'bg-blue-100/80';
    case '卵':
      return 'bg-yellow-100/80';
    case '冷凍食品':
      return 'bg-blue-100/80';
    case 'その他':
      return 'bg-gray-100/80';
    default:
      return 'bg-gray-100/80';
  }
};

export const IngredientsTableRow = ({
  ingredient,
  className,
}: IngredientsTableRowProps) => {
  const categoryClass = categoryColor(ingredient);

  return (
    <TableRow>
      <TableCell className='font-medium'>{ingredient.name}</TableCell>
      <TableCell>{ingredient.quantity}</TableCell>
      <TableCell>{ingredient.unit}</TableCell>
      <TableCell>{ingredient.category}</TableCell>
      <TableCell>{ingredient.expiration_date.toDateString()}</TableCell>
    </TableRow>
  );
};
