import { NextResponse } from 'next/server';
import {
  getRecipeById,
  getRecipeIngredients,
  deleteRecipe,
} from '@/lib/db/operations/recipes';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET({ params }: { params: { recipeId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recipe = await getRecipeById(params.recipeId);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Failed to fetch recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // レシピIDから使用食材を取得
    const ingredients = await getRecipeIngredients(params.recipeId);

    // 各食材のused_atを更新
    const updatePromises = ingredients.map(async (ingredient) => {
      const response = await fetch(`/api/ingredients/${ingredient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...ingredient,
          usedAt: new Date().toISOString(),
          status: 'used',
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ingredient ${ingredient.id}`);
      }

      return response.json();
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update recipe ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe ingredients' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteRecipe(params.recipeId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
