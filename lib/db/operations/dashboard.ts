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
  // 実際のデータベースクエリバージョン;
  const ingredientsCountQuery = `
    SELECT COUNT(*) AS count FROM user_ingredients
    WHERE user_id = $1 AND status = 'active'
  `;

  const expiringIngredientsQuery = `
    SELECT COUNT(*) AS count FROM user_ingredients
    WHERE user_id = $1
    AND expiration_date IS NOT NULL
    AND expiration_date <= NOW() + INTERVAL '3 days'
    AND expiration_date > NOW()
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
    AND expiration_date > NOW()
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
 * @returns 日付ごとの食材使用回数の配列
 */
export async function getUsageTrends(userId: string): Promise<UsageTrend[]> {
  // 実際のデータベースクエリバージョン
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
  return result.rows.map((row) => ({
    date: row.date,
    usageCount: parseInt(row.usage_count),
  }));

  // シミュレーションバージョン
  console.log('食材使用トレンドを取得中:', userId);

  // 過去30日間のダミーデータを生成
  const trends: UsageTrend[] = [];
  const today = new Date();

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

    const usageCount = Math.floor(Math.random() * 6);

    trends.push({
      date: formattedDate,
      usageCount: usageCount,
    });
  }

  return trends;
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
  // 実際のデータベースクエリバージョン
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
  return result.rows.map((row) => ({
    name: row.name,
    usageCount: parseInt(row.usage_count),
  }));

  // シミュレーションバージョン
  console.log('よく使われる食材を取得中:', userId, 'limit:', limit);

  return [
    { name: 'トマト', usageCount: 15 },
    { name: '玉ねぎ', usageCount: 12 },
    { name: 'にんにく', usageCount: 10 },
    { name: '豚肉', usageCount: 8 },
    { name: 'じゃがいも', usageCount: 7 },
    { name: 'にんじん', usageCount: 6 },
    { name: '鶏肉', usageCount: 5 },
    { name: 'ブロッコリー', usageCount: 4 },
    { name: 'ピーマン', usageCount: 3 },
    { name: 'きのこ', usageCount: 2 },
  ].slice(0, limit);
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
  return result.rows.map((row) => ({
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
