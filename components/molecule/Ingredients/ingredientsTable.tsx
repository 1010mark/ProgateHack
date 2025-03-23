import { useEffect, useState } from 'react';

import { useAtom } from 'jotai';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { cn } from '@/lib/utils';
import { Ingredient } from '@/types/ingredients';
import { Checkbox } from '@/components/ui/checkbox';
import { selectedIngredientCartState } from '@/store/selectedIngredientCartState';
import { EditIngredientModal } from '@/components/pages/modal/editIngredientModal';

interface IngredientsTableProps {
  ingredients: Ingredient[];
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

export const IngredientsTable = ({ ingredients }: IngredientsTableProps) => {
  const [selectedIngredients, setSelectedIngredients] = useAtom(
    selectedIngredientCartState
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);

  const handleRowClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIsOpen(true);
  };

  useEffect(() => {
    console.log(selectedIngredient);
  }, [selectedIngredient]);

  const handleIngredientUpdated = () => {
    // TODO: 必要に応じて更新後の処理を追加
    setIsOpen(false);
    setSelectedIngredient(null);
  };

  return (
    <div>
      {selectedIngredient && (
        <EditIngredientModal
          ingredient={selectedIngredient}
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedIngredient(null);
          }}
          onSuccess={handleIngredientUpdated}
        />
      )}
      <Table className='w-full '>
        <TableHeader className='text-center'>
          <TableRow key={'header'}>
            <TableHead className='text-center w-[10%]'>選択</TableHead>
            <TableHead className='text-center w-[20%]'>食材名</TableHead>
            <TableHead className='text-center w-[10%]'>数量</TableHead>
            <TableHead className='text-center w-[10%]'>単位</TableHead>
            <TableHead className='text-center w-[25%]'>カテゴリ</TableHead>
            <TableHead className='text-center w-[25%]'>消費期限</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='text-center w-full'>
          {ingredients.map((ingredient) => (
            <TableRow
              key={ingredient.id}
              onClick={(e) => {
                // チェックボックスクリック時は編集モーダルを開かない
                if (!(e.target as HTMLElement).closest('.checkbox-cell')) {
                  handleRowClick(ingredient);
                }
              }}
              className='cursor-pointer hover:bg-gray-50'
            >
              <TableCell className='w-[10%] checkbox-cell'>
                <div className='flex items-center justify-center min-w-5 min-h-5'>
                  <Checkbox
                    checked={selectedIngredients.some(
                      (item) => item.id === ingredient.id
                    )}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIngredients([
                          ...selectedIngredients,
                          ingredient,
                        ]);
                      } else {
                        setSelectedIngredients(
                          selectedIngredients.filter(
                            (item) => item.id !== ingredient.id
                          )
                        );
                      }
                    }}
                    className='w-5 h-5 border-2 border-gray-300 rounded'
                  />
                </div>
              </TableCell>
              <TableCell className='font-bold w-[20%]'>
                {ingredient.name}
              </TableCell>
              <TableCell className='w-[10%]'>{ingredient.quantity}</TableCell>
              <TableCell className='w-[10%]'>{ingredient.unit}</TableCell>
              <TableCell className='w-[25%]'>
                <div className='flex justify-center items-center w-full'>
                  <div
                    className={cn(
                      'px-4  rounded-xl',
                      categoryColor(ingredient)
                    )}
                  >
                    {ingredient.category}
                  </div>
                </div>
              </TableCell>
              <TableCell
                className={`w-[25%] ${
                  new Date(ingredient.expiration_date) < new Date()
                    ? 'text-red-500'
                    : ''
                }`}
              >
                {ingredient.expiration_date instanceof Date
                  ? ingredient.expiration_date.toDateString()
                  : new Date(ingredient.expiration_date).toDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
