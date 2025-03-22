export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

// レシピ提案のリクエストデータ
export interface RecipeSuggestionRequest {
  id?: string; // ユニークな識別子（例：UUID）
  userId: string; // ユーザーID
  ingredients: Ingredient[]; // 選択された食材のID配列
  peopleCount?: number; // 人数
  mealPreference?: string; // 料理の好み（例：'和食'）
  cookingTime?: string; // 調理時間（例：'30分以内'）
  allergies?: string[]; // アレルギー情報（例：'乳'）
  recipesName: string; // レシピ名（例：'晩ごはん提案'）
  otherConditions?: string; // その他の条件（例：'グルテンフリー'）
}

// レシピ
export interface Recipe extends RecipeSuggestionRequest {
  id: string; // 必須に変更
  description?: string; // レシピの説明
  status: '作成中' | '完了' | '失敗'; // レシピの状態
  content?: string; // レシピの詳細内容（Markdown形式）
  createdAt: Date; // 作成日時
}
