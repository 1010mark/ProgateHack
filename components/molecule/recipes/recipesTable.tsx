import { useState } from 'react';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Recipe } from '@/types/recipes';
import { RecipesModal } from './recipesDetailModal';
import { Button } from '@/components/ui/button';
import { useShowDialog } from '@/hooks/useShowDialog';

interface RecipesTableProps {
  recipes: Recipe[];
  onRemove?: (id: string) => void;
}

const statusColor = (recipe: Recipe) => {
  switch (recipe.status) {
    case '作成中':
      return 'bg-yellow-100/80';
    case '完了':
      return 'bg-green-100/80';
    case '失敗':
      return 'bg-red-100/80';
    default:
      return 'bg-gray-100/80';
  }
};

export const RecipesTable = ({ recipes, onRemove }: RecipesTableProps) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const showDialog = useShowDialog();

  const handleRemove = (id: string) => {
    if (onRemove) {
      onRemove(id);
    }
  };

  const handleViewResult = (recipe: Recipe) => {
    if (recipe.status === '完了') {
      setSelectedRecipe(recipe);
    }
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  const useIngredientFromRecipe = async () => {
    //TODO ここに処理を追加
    const confirm = await showDialog({
      title: 'レシピの使用',
      content: 'このレシピを使用しますか？',
    });

    closeModal();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isViewable = (status: string) => {
    return status === '完了';
  };

  return (
    <>
      <Table className='w-full'>
        <TableHeader className='text-center'>
          <TableRow key={'header'}>
            <TableHead className='text-center'>作成日時</TableHead>
            <TableHead className='text-center'>提案の名前</TableHead>
            <TableHead className='text-center'>ステータス</TableHead>
            <TableHead className='text-center'>結果</TableHead>
            <TableHead className='text-center'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='text-center w-full'>
          {recipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell>{formatDate(recipe.createdAt)}</TableCell>
              <TableCell className='font-bold'>{recipe.recipesName}</TableCell>
              <TableCell>
                <div className='flex justify-center items-center'>
                  <div
                    className={cn(
                      'w-25 rounded-xl items-center px-2 py-1',
                      statusColor(recipe)
                    )}
                  >
                    {recipe.status}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  className={cn(
                    'px-3 py-1 rounded-md',
                    isViewable(recipe.status)
                      ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                  onClick={() =>
                    isViewable(recipe.status) && handleViewResult(recipe)
                  }
                  disabled={!isViewable(recipe.status)}
                >
                  表示
                </Button>
              </TableCell>
              <TableCell className='flex gap-2 items-center justify-center'>
                <Button
                  className={cn(
                    'px-3 py-1 rounded-md',
                    isViewable(recipe.status)
                      ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                  onClick={useIngredientFromRecipe}
                >
                  使用
                </Button>
                <button
                  className='round-button click-transition cursor-pointer'
                  onClick={() => handleRemove(recipe.id)}
                >
                  <Image
                    src='/icons/ui/close.png'
                    alt='close'
                    height={12}
                    width={12}
                  />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedRecipe && (
        <RecipesModal
          recipe={selectedRecipe}
          onClose={closeModal}
          onUse={useIngredientFromRecipe}
        />
      )}
    </>
  );
};
