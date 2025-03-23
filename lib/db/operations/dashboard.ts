import { pool } from '../index';

// 統計データの型定義
export interface Statistics {
  ingredientsCount: number; // 食材の総数
  expiringIngredients: number; // 期限切れ間近の食材数
  recipesCount: number; // レシピの総数
  totalPreferences?: number; // 料理の好みの総数
}

// 使用トレンドデータの型定義
export interface UsageTrend {
  date: string; // 日付 string
  usageCount: number; // 使用回数
}

// よく使われる食材の型定義
export interface PopularIngredient {
  name: string; // 食材名
  usageCount: number; // 使用回数
}

// カテゴリー別割合の型定義
export interface CategoryDistribution {
  category: string; // カテゴリー名
  count: number; // 食材数
}

// ダミーデータ
const dummyStatistics: Statistics = {
  ingredientsCount: 20,
  expiringIngredients: 5,
  recipesCount: 8,
};

/**
 * ユーザーの統計データを取得する
 * @param userId ユーザーID
 * @returns 食材総数、期限切れ間近の食材数、レシピ総数を含む統計オブジェクト
 */
export async function getStatistics(userId: string): Promise<Statistics> {
  // 実際のデータベースクエリバージョン
  const ingredientsCountQuery = `
    SELECT COUNT(*) AS count FROM user_ingredients
    WHERE user_id = $1 AND status = 'active'
  `;
  
  const expiringIngredientsQuery = `
    SELECT COUNT(*) AS count FROM user_ingredients
    WHERE user_id = $1
    AND expiration_date IS NOT NULL
    AND expiration_date <= NOW() + INTERVAL '3 days'
    AND expiration_date >= CAST(NOW() AS DATE)
    AND status = 'active'
  `;
  
  const recipesCountQuery = `
    SELECT COUNT(*) AS count FROM recipes
    WHERE user_id = $1
  `;
  
  const ingredientsResult = await pool.query(ingredientsCountQuery, [userId]);
  const expiringResult = await pool.query(expiringIngredientsQuery, [userId]);
  const recipesResult = await pool.query(recipesCountQuery, [userId]);
  
  return {
    ingredientsCount: parseInt(ingredientsResult.rows[0].count),
    expiringIngredients: parseInt(expiringResult.rows[0].count),
    recipesCount: parseInt(recipesResult.rows[0].count),
  };

  // シミュレーションバージョン
  console.log('ユーザーの統計情報を取得中:', userId);
  return dummyStatistics;
}

/**
 * 期限切れ間近の食材詳細を取得する
 * @param userId ユーザーID
 * @returns 3日以内に期限切れになる食材のリスト
 */
export async function getExpiringIngredients(userId: string): Promise<any[]> {
  // 実際のデータベースクエリバージョン
  const query = `
    SELECT * FROM user_ingredients
    WHERE user_id = $1
    AND expiration_date IS NOT NULL
    AND expiration_date <= NOW() + INTERVAL '3 days'
    AND expiration_date >= CAST(NOW() AS DATE)
    AND status = 'active'
    ORDER BY expiration_date ASC
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;

  // シミュレーションバージョン
  console.log('期限切れ間近の食材を取得中');
  return [
    {
      id: '1',
      name: 'トマト+1',
      quantity: 1,
      unit: '個',
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2日後
      createdAt: new Date(),
      updatedAt: new Date(),
      category: '野菜',
      status: 'active',
      userId: userId,
    },
    {
      id: '2',
      name: 'キュウリ',
      quantity: 2,
      unit: '本',
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1日後
      createdAt: new Date(),
      updatedAt: new Date(),
      category: '野菜',
      status: 'active',
      userId: userId,
    },
    {
      id: '11',
      name: '豚肉',
      quantity: 300,
      unit: 'g',
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12時間後
      createdAt: new Date(),
      updatedAt: new Date(),
      category: '肉',
      status: 'active',
      userId: userId,
    },
  ];
}

/**
 * 統計データを更新する（食材/レシピの追加や削除時など）
 * @param userId ユーザーID
 * @returns 更新後の統計データ
 */
export async function updateStatistics(userId: string): Promise<Statistics> {
  // 実際のアプリケーションでは、このメソッドはキャッシュされた統計データを
  // 強制的に更新するために使用されるかもしれませんが、
  // 現在はgetStatisticsを再度呼び出すだけです
  return await getStatistics(userId);
}

/**
 * 過去30日間の食材使用トレンドを取得する
 * @param userId ユーザーID
 * @returns 日付ごとの食材使用回数の配列（MM-DD 表示）
 */
export async function getUsageTrends(userId: string): Promise<UsageTrend[]> {
  const query = `
    SELECT DATE_TRUNC('day', used_at) AS date, COUNT(*) AS usage_count
    FROM user_ingredients
    WHERE user_id = $1
    AND used_at >= NOW() - INTERVAL '30 days'
    AND status = 'used'
    GROUP BY DATE_TRUNC('day', used_at)
    ORDER BY date ASC
  `;

  const result = await pool.query(query, [userId]);

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });

  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - i));
    return formatDate(date);
  });

  // dummy data（usageCount: 1~10）
  if (result.rows.length === 0) {
    const dummyData: UsageTrend[] = last30Days.map((date) => ({
      date,
      usageCount: Math.floor(Math.random() * 5) + 1, // 1~10
    }));
    return dummyData;
  }

  const trends: UsageTrend[] = result.rows.map((row: any) => ({
    date: formatDate(new Date(row.date)),
    usageCount: parseInt(row.usage_count),
  }));

  const filledTrends: UsageTrend[] = last30Days.map((date) => {
    const existingTrend = trends.find((trend) => trend.date === date);
    return existingTrend ? existingTrend : {
      date,
      usageCount: 0,
    };
  });

  return filledTrends;
}




/**
 * よく使われる食材のランキングを取得する
 * @param userId ユーザーID
 * @param limit 取得する食材の最大数（デフォルト10）
 * @returns 使用回数の多い順に並べた食材の配列
 */
export async function getPopularIngredients(
  userId: string,
  limit: number = 10
): Promise<PopularIngredient[]> {
  const query = `
    SELECT name, COUNT(*) AS usage_count
    FROM user_ingredients
    WHERE user_id = $1
    AND status = 'used'
    GROUP BY name
    ORDER BY usage_count DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [userId, limit]);

  if (result.rows.length > 0) {
    return result.rows.map((row: any) => ({
      name: row.name,
      usageCount: parseInt(row.usage_count),
    }));
  }

  // dummy data
  const dummyIngredients = [
    'トマト', '玉ねぎ', 'にんにく', '豚肉', 'じゃがいも',
    'にんじん', '鶏肉', 'ブロッコリー', 'ピーマン', 'きのこ',
    'キャベツ', 'なす', '豆腐', '白菜', 'ベーコン',
  ];

  const shuffled = dummyIngredients.sort(() => 0.5 - Math.random());
  const dummyData: PopularIngredient[] = shuffled.slice(0, limit).map(name => ({
    name,
    usageCount: Math.floor(Math.random() * 20) + 1, // 1~20
  }));

  dummyData.sort((a, b) => b.usageCount - a.usageCount);

  return dummyData;
}


/**
 * 食材のカテゴリー別割合を取得する
 * @param userId ユーザーID
 * @returns カテゴリー別の食材数の配列
 */
export async function getCategoryDistribution(
  userId: string
): Promise<CategoryDistribution[]> {
  // 実際のデータベースクエリバージョン
  const query = `
    SELECT COALESCE(category, '他の') AS category, COUNT(*) AS count
    FROM user_ingredients
    WHERE user_id = $1
    AND status = 'active'
    GROUP BY category
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows.map((row: any) => ({
    category: row.category,
    count: parseInt(row.count),
  }));

  // シミュレーションバージョン
  console.log('カテゴリー別割合を取得中:', userId);

  return [
    { category: '野菜', count: 8 },
    { category: '肉', count: 4 },
    { category: '魚', count: 3 },
    { category: '乳製品', count: 2 },
    { category: '調味料', count: 5 },
    { category: '果物', count: 3 },
    { category: '穀物', count: 2 },
    { category: '他の', count: 1 },
  ];
}
