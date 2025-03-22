import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ResponsiveContainer as PieResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchCategoryDistribution } from '@/lib/api/dashboard';
import type { CategoryDistribution } from '@/lib/db/operations/dashboard';

// 円グラフ用の色設定
const COLORS = [
  '#60A5FA',
  '#F87171',
  '#34D399',
  '#FBBF24',
  '#A78BFA',
  '#EC4899',
];

export default function UserDashboardPieChart() {
  // カテゴリー分布データの状態管理
  const [pieData, setPieData] = useState<CategoryDistribution[]>([]);
  // ローディング状態
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // エラー状態
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // コンポーネントマウント時にデータを取得
    const loadPieData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCategoryDistribution();
        setPieData(data);
        setError(null);
      } catch (err) {
        setError('カテゴリーデータの読み込みに失敗しました');
        console.error('カテゴリーデータの取得エラー:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPieData();
  }, []);

  // データ読み込み中の表示
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>現在の食材のカテゴリ別分析</CardTitle>
        </CardHeader>
        <CardContent className='h-64 flex items-center justify-center'>
          <p>データを読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  // データが空の場合の表示
  if (pieData.length === 0) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>現在の食材のカテゴリ別分析</CardTitle>
        </CardHeader>
        <CardContent className='h-64 flex items-center justify-center'>
          <p>まだ食材は追加されていません～</p>
        </CardContent>
      </Card>
    );
  }

  // エラー発生時の表示
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>現在の食材のカテゴリ別分析</CardTitle>
        </CardHeader>
        <CardContent className='h-64 flex items-center justify-center'>
          <p className='text-red-500'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>現在の食材のカテゴリ別分析</CardTitle>
      </CardHeader>
      <CardContent className='h-64'>
        <PieResponsiveContainer width='100%' height='100%'>
          <RechartsPieChart>
            <Pie
              data={pieData}
              dataKey='count'
              nameKey='category'
              cx='50%'
              cy='50%'
              outerRadius={80}
              fill='#8884d8'
              label
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <PieTooltip />
            <Legend />
          </RechartsPieChart>
        </PieResponsiveContainer>
      </CardContent>
    </Card>
  );
}
