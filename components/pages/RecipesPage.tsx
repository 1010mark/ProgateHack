'use client';
import React, { useState, useEffect } from 'react';
import { RecipesTable } from '../molecule/recipes/recipesTable';
import { Recipe } from '@/types/recipes';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

import { fetchRecipes, deleteRecipe } from '@/lib/api/recipes';
import { useShowDialog } from '@/hooks/useShowDialog';

const RecipesPage = () => {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  // useShowDialog フックを使用
  const showDialog = useShowDialog();

  // 初回レンダリング時にレシピを取得
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        const recipes = await fetchRecipes();
        setAllRecipes(recipes);
        setTotalItems(recipes.length);
      } catch (err) {
        console.error('レシピの取得に失敗しました:', err);
        setError('レシピの取得に失敗しました。後でもう一度お試しください。');
      } finally {
        setLoading(false);
      }
    };
    
    loadRecipes();
  }, []);

  useEffect(() => {
    // 表示するレシピを更新
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allRecipes.length);
    setDisplayedRecipes(allRecipes.slice(startIndex, endIndex));
  }, [allRecipes, currentPage, itemsPerPage]);


  const handlePageChange = (page: number) => {
    if (page < 1 || page > Math.ceil(totalItems / itemsPerPage)) return;
    setCurrentPage(page);
  };

  // 削除確認と実行を行う関数
  const confirmDeleteRecipe = async (id: string) => {
    // useShowDialogを使用して確認ダイアログを表示
    const confirmed = await showDialog({
      title: 'レシピの削除',
      content: 'このレシピを削除してもよろしいですか？この操作は元に戻せません。'
    });
    
    if (confirmed) {
      try {
        await deleteRecipe(id);
        const updatedRecipes = allRecipes.filter((recipe) => recipe.id !== id);
        setAllRecipes(updatedRecipes);

        // ページの最後のアイテムを削除する場合、前のページに移動（ページ1の場合を除く）
        const newTotalItems = updatedRecipes.length;
        const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);

        if (currentPage > newTotalPages && currentPage > 1) {
          setCurrentPage(newTotalPages || 1);
        }
      } catch (err) {
        console.error('レシピの削除に失敗しました:', err);
        setError('レシピの削除に失敗しました。後でもう一度お試しください。');
      }
    }
  };

  // 総ページ数を計算
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className='container mx-auto p-4'>
      <div className='w-full mb-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold'>レシピ提案一覧</h2>
        </div>

        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        ) : (
          <div className=''>
            <RecipesTable
              recipes={displayedRecipes}
              onRemove={confirmDeleteRecipe}
            />

            <div className='p-4 border-t flex justify-between items-center text-sm text-gray-500'>
              <span>
                {totalItems > 0
                  ? `${totalItems} 件中 ${
                      (currentPage - 1) * itemsPerPage + 1
                    }-${Math.min(
                      currentPage * itemsPerPage,
                      totalItems
                    )} 件を表示`
                  : '表示するレシピがありません'}
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
        )}
      </div>
    </div>
  );
};

export default RecipesPage;