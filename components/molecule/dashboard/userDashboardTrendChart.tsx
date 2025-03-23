import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchUsageTrends } from '@/lib/api/dashboard';
import type { UsageTrend } from '@/lib/db/operations/dashboard';

export default function UserDashboardTrendChart() {
  const [trendData, setTrendData] = useState<UsageTrend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrendData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchUsageTrends();
        console.log('data:', data);

        // If the data is empty, fill the chart with zero values for 30 days
        if (data.length === 0) {
          const today = new Date();
          const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (30 - i));
            return `${date.getMonth() + 1}/${date.getDate()}`;
          });
          const zeroData = last30Days.map((date) => ({ date, usageCount: 0 }));
          setTrendData(zeroData);
        } else {
          setTrendData(data);
        }

        setError(null);
      } catch (err) {
        setError('トレンドデータの読み込みに失敗しました');
        console.error('トレンドデータの取得エラー:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendData();
  }, []);

  if (isLoading) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>食材の使用トレンド</CardTitle>
        </CardHeader>
        <CardContent className='h-60 flex items-center justify-center'>
          <p>データを読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>食材の使用トレンド</CardTitle>
        </CardHeader>
        <CardContent className='h-60 flex items-center justify-center'>
          <p className='text-red-500'>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>食材の使用トレンド</CardTitle>
      </CardHeader>
      <CardContent className='h-60'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => {
                const nameMap: Record<string, string> = {
                  usageCount: '使用量',
                };
                return [value, nameMap[name] || name];
              }}
            />
            <Line
              type='monotone'
              dataKey='usageCount'
              stroke='#3b82f6'
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
