import { NextResponse } from 'next/server';
import {
  updateIngredient,
  deleteIngredient,
} from '@/lib/db/operations/ingredients';
import { Ingredient } from '@/types/ingredients';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: Request,
  context: { params: { ingredientId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ingredientId } = context.params;

  try {
    const body = await request.json();
    const ingredient: Ingredient = {
      ...body,
      id: ingredientId,
      user_id: session.user.id,
    };

    const result = await updateIngredient(ingredient);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { error: '食材の更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { ingredientId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { ingredientId } = context.params;

  if (!ingredientId) {
    return NextResponse.json(
      { error: 'Ingredient ID is required' },
      { status: 400 }
    );
  }

  try {
    await deleteIngredient(ingredientId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
