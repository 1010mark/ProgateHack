// 現在はちょっと思いつかないけど、作りながら追加したり修正したりするかもしれません

export type Unit = '個' | 'g' | 'ml' | '束' | '本' | '枚' | 'パック';

// 食材
export interface Ingredient {
  id: string; // ユニークな識別子（例: UUID）
  user_id: string; // ユーザーID
  name: string; // 食材の名称
  quantity: number; // 数量（単位は別途 unit で管理）
  unit: Unit; // 数量の単位（例: 個、g、ml など）
  expiration_date: Date; // 賞味期限
  created_at: Date; // 作成日時
  updated_at: Date; // 更新日時
  used_at?: Date; // 使用日時
  category: IngredientCategory;
  notes?: string; // メモ
  status?: 'active' | 'used' | 'expired'; // 食材の状態（active: 未使用、used: 使用済み、expired: 賞味期限切れ）
}

// 食材（Catalog）
export interface CatalogIngredient {
  id: string; // ユニークな識別子（例：UUID）
  name: string; // 食材の名称
  defaultUnit: Unit; // デフォルトの単位（例: 個、g、ml など）
  description?: string; // 食材の説明（任意）
  category?: string; // カテゴリ（任意、例: 野菜、果物、肉類）
  imageUrl?: string; // 食材のイメージ画像のURL（任意）
}

// 食材（登録）
export type CreateIngredientInput = Omit<Ingredient, 'id' | 'createdAt'>; // IngredientからidとcreatedAtを除いたもの

export type IngredientCategory =
  | '野菜'
  | '果物'
  | '肉'
  | '魚'
  | '卵'
  | '雑穀'
  | '冷凍食品'
  | 'その他';
