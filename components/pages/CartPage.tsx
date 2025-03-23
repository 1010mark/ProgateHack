'use client';
import React, { useState } from 'react';
import { usePagination } from '@/hooks/usePagination';
import { useIngredientsCart } from '@/hooks/useIngredientsCart';

import { IngredientsTable } from '../molecule/IngredientsCart/cartTable';
import { CartFilter } from '../molecule/IngredientsCart/cartFilterArea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useShowDialog } from '@/hooks/useShowDialog';

const CartPage = () => {
  const itemsPerPage = 10;
  const {
    ingredients,
    removeIngredient,
    updateQuantity,
    clearAll,
    filterIngredients,
  } = useIngredientsCart(itemsPerPage);

  const { currentPage, totalPages, handlePageChange, getCurrentPageItems } =
    usePagination(ingredients.length, itemsPerPage);

  const displayedIngredients = getCurrentPageItems(ingredients);

  const hasIngredients = ingredients.length > 0;

  const setDialog = useShowDialog();

  const handleRemoveIngredient = (id: string) => {
    removeIngredient(id, currentPage, handlePageChange);
  };

  const openConfirmDialog = async () => {
    const confirm = await setDialog({
      title: '削除確認',
      content:
        'すべての食材を削除してもよろしいですか？この操作は元に戻せません。',
    });

    if (confirm) {
      clearAll();
    }
  };

  const handleFilterApply = (filterParams: { category?: string }) => {
    if (filterParams.category) {
      filterIngredients(filterParams.category);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='w-full mb-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold'>提案する食材リスト</h2>
          <Button
            onClick={openConfirmDialog}
            className='hover:cursor-pointer bg-red-400 hover:bg-red-700 text-white size-12 w-18 mr-1'
          >
            <div className='flex items-center gap-1'>
              <Trash2 />
            </div>
          </Button>
        </div>

        <div className='bg-white overflow-hidden'>
          <IngredientsTable
            ingredients={displayedIngredients}
            onRemove={handleRemoveIngredient}
            onQuantityChange={updateQuantity}
          />

          <div className='p-4 border-t flex justify-between items-center text-sm text-gray-500'>
            <span>
              {ingredients.length > 0
                ? `${ingredients.length} 件中 ${
                    (currentPage - 1) * itemsPerPage + 1
                  }-${Math.min(
                    currentPage * itemsPerPage,
                    ingredients.length
                  )} 件を表示`
                : '表示する食材がありません'}
            </span>
            <div className='flex space-x-2'>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='p-2 border rounded-md disabled:opacity-50'
              >
                &lt;
              </button>
              <span className='p-2'>
                ページ {currentPage} / {totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || totalPages === 0}
                className='p-2 border rounded-md disabled:opacity-50'
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        <div className='mt-6'>
          <CartFilter
            onApplyFilter={handleFilterApply}
            hasIngredients={hasIngredients}
            ingredients={ingredients}
            clearAll={clearAll}
          />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
