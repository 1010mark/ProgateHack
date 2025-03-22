import { NextResponse } from 'next/server';
import {
  getStatistics,
  getExpiringIngredients,
  getUsageTrends,
  getPopularIngredients,
  getCategoryDistribution,
} from '@/lib/db/operations/dashboard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';


// ダッシュボードデータの取得
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    // URLのクエリパラメータに基づいて異なる統計データを返す
    switch (type) {
      case 'statistics':
        const statistics = await getStatistics(userId);
        return NextResponse.json(statistics);

      case 'expiring':
        const expiringIngredients = await getExpiringIngredients(userId);
        return NextResponse.json(expiringIngredients);

      case 'usage-trends':
        const usageTrends = await getUsageTrends(userId);
        return NextResponse.json(usageTrends);

      case 'popular-ingredients':
        const limit = url.searchParams.get('limit');
        const popularIngredients = await getPopularIngredients(
          userId,
          limit ? parseInt(limit) : 10
        );
        return NextResponse.json(popularIngredients);

      case 'category-distribution':
        const categoryDistribution = await getCategoryDistribution(userId);
        return NextResponse.json(categoryDistribution);

      // デフォルトはすべてのダッシュボードデータを返す
      default:
        const allData = {
          statistics: await getStatistics(userId),
          expiringIngredients: await getExpiringIngredients(userId),
          usageTrends: await getUsageTrends(userId),
          popularIngredients: await getPopularIngredients(userId, 5),
          categoryDistribution: await getCategoryDistribution(userId),
        };
        return NextResponse.json(allData);
    }
  } catch (error) {
    console.error('ダッシュボードデータの取得エラー:', error);
    return NextResponse.json(
      { error: 'ダッシュボードデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}
