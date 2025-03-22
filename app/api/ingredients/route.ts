// import { NextResponse } from 'next/server';
// import dynamoDB from '@/lib/dynamodb';
// import { v4 as uuidv4 } from 'uuid';
// import { getUserId } from '@/lib/auth';

// export async function POST(req: Request){
//   const userId = await getUserId(req);
//   if (!userId) return NextResponse.json({ error: 'IDが正しくありません。'}, {status: 401});

//   const body await req.json();
//   if (!body.name || !body.quantity || !body.unit || body.expirationDate) {
//     return NextResponse.json({ error: '無効な入力です。'}, {status: 400});
//   }
// }

import { NextResponse } from 'next/server';
import {
  getIngredients,
  saveIngredient,
} from '@/lib/db/operations/ingredients';
import { Ingredient } from '@/types/ingredients';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// get all ingredients
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const ingredients = await getIngredients(userId);
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: '食材の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// add ingredient
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const ingredient: Ingredient = {
      ...body,
      user_id: session.user.id,
    };

    const result = await saveIngredient(ingredient);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving ingredient:', error);
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
  }
}
