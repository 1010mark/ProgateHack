// app/api/ingredients/[id]/route.ts
import { NextResponse } from 'next/server';
import {
  updateIngredient,
  deleteIngredient,
} from '@/lib/db/operations/ingredients';
import { Ingredient } from '@/types/ingredients';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const session = { user: { id: 'test' } };

// update specific ingredient
export async function PUT(
  request: Request,
  { params }: { params: { ingredientId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ingredient: Ingredient = {
      ...body,
      id: params.ingredientId,
      userId: session.user.id,
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

// delete specific ingredient
export async function DELETE(
  request: Request,
  { params }: { params: { ingredientId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteIngredient(params.ingredientId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
  }
}
