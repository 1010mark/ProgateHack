import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Recipe } from '@/types/recipes';
import ReactMarkdown from 'react-markdown';

interface RecipesDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  onUse: () => void;
}

export const RecipesModal = ({
  recipe,
  onClose,
  onUse,
}: RecipesDetailModalProps) => {
  // 日付をフォーマット
  const formatDate = (date: Date) => {
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center z-20'>
      <div
        className='absolute inset-0 bg-black opacity-50'
        onClick={onClose}
      ></div>
      <div className='relative w-2/3 h-4/5 bg-white rounded-xl shadow-lg p-6 overflow-auto'>
        <button
          className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:cursor-pointer'
          onClick={onClose}
        >
          <X />
        </button>
        <div className='mb-4'>
          <div className='flex justify-between items-center'>
            <div>
              <p className='text-sm text-gray-500'>
                作成日時: {formatDate(recipe.createdAt)}
              </p>
              <h2 className='text-2xl font-bold'>{recipe.recipesName}</h2>
            </div>
          </div>
        </div>
        <div className='border-t border-dashed mx-3 my-4'></div>
        <div className='markdown-content'>
          <ReactMarkdown>{recipe.content || ''}</ReactMarkdown>
        </div>
        <div className='flex justify-end mt-6 gap-2'>
          <Button
            onClick={onUse}
            className='py-2 px-4 bg-blue-400 hover:bg-blue-600 text-white rounded-md'
          >
            使用する
          </Button>
          <Button
            onClick={onClose}
            className='py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md'
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
};
