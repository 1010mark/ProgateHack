import { NextResponse } from 'next/server';
import {
  getRecipes,
  saveRecipe,
  updateRecipe,
} from '@/lib/db/operations/recipes';
import { RecipeSuggestionRequest, Recipe } from '@/types/recipes';
import { generateRecipeSuggestions } from '@/lib/api/llm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/recipes - レシピ一覧の取得
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recipes = await getRecipes(session.user.id);
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// POST /api/recipes - 新規レシピの作成
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as RecipeSuggestionRequest;
    const userId = session.user.id
    // 初期値でレシピを保存
    const initialRecipe = {
      ...body,
      status: '作成中',
      description: `${body.peopleCount}人分の${body.mealPreference || ''}レシピを生成中...`,
      content: '',
      userId: userId,
    } as Recipe;
    console.log('initialRecipe:', initialRecipe);

    const savedRecipe = await saveRecipe(initialRecipe);

    // バックグラウンドでレシピを生成
    generateRecipeSuggestions(body, savedRecipe.id)
      .then(async (content) => {
        if (content) {
          // 生成されたレシピの内容から説明を抽出（最初の数行）
          const descriptionLines = content.split('\n').slice(0, 3).join(' ');
          const description = descriptionLines.length > 100 
            ? descriptionLines.substring(0, 100) + '...' 
            : descriptionLines;
          
          // console.log('Generated recipe:', content);
          await updateRecipe({
            ...savedRecipe,
            status: '完了',
            description: description,
            content: content,
            user_id: userId,
          });
        } else {
          await updateRecipe({
            ...savedRecipe,
            status: '失敗',
            description: 'レシピの生成に失敗しました。',
            content: '',
            user_id: userId,
          });
        }
      })
      .catch(async (error) => {
        console.error('Failed to generate recipe:', error);
        await updateRecipe({
          ...savedRecipe,
          status: '失敗' as const,
          description: 'レシピの生成中にエラーが発生しました。',
          user_id: body.userId,
        });
      });

    return NextResponse.json({ id: savedRecipe.id });
  } catch (error) {
    console.error('Failed to process recipe creation:', error);
    return NextResponse.json(
      { error: 'Failed to process recipe creation' },
      { status: 500 }
    );
  }
}