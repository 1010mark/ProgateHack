import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPopularIngredients } from '@/lib/api/dashboard';
import type { PopularIngredient } from '@/lib/db/operations/dashboard';

export default function UserDashboardRankList() {
  // 人気食材データの状態管理
  const [rankData, setRankData] = useState<PopularIngredient[]>([]);
  // ローディング状態
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // コンポーネントマウント時にデータを取得
    const loadRankData = async () => {
      try {
        setIsLoading(true);
        // デフォルトで5件の人気食材を取得
        const data = await fetchPopularIngredients(5);
        setRankData(data);
        setError(null);
      } catch (err) {
        setError('人気食材データの読み込みに失敗しました');
        console.error('人気食材データの取得エラー:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRankData();
  }, []);

  // データ読み込み中の表示
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>よく使われる食材</CardTitle>
        </CardHeader>
        <CardContent className='flex justify-center'>
          <p>データを読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  // データが空の場合の表示
  if (rankData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>よく使われる食材</CardTitle>
        </CardHeader>
        <CardContent className='flex justify-center'>
          <p>現在使用した食材はありません～</p>
        </CardContent>
      </Card>
    );
  }

  // エラー発生時の表示
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>よく使われる食材</CardTitle>
        </CardHeader>
        <CardContent className='flex justify-center'>
          <p className='text-red-500'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>よく使われる食材</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='space-y-2'>
          {rankData.map((item, index) => (
            <li key={index} className='flex justify-between border-b pb-1'>
              <span>
                {index + 1}. {item.name}
              </span>
              <span className='text-blue-600 font-medium'>{item.usageCount} 次</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
