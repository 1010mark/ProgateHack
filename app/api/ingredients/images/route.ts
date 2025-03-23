import { NextRequest, NextResponse } from 'next/server';
import { generateIngredientsFromImage} from '@/lib/api/llm_image';

export async function POST(request: NextRequest) {
  try {
    // リクエストから画像データを取得
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    console.log(imageFile);

    if (!imageFile) {
      return NextResponse.json(
        { error: '画像ファイルが必要です' },
        { status: 400 }
      );
    }

    // ファイルタイプの検証
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '画像ファイルのみ受け付けます' },
        { status: 400 }
      );
    }

    // ファイルサイズの検証（例：100MB以下）
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      );
    }

    // 画像をBase64に変換
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // LLMで画像を解析
    const ingredients = await generateIngredientsFromImage(base64Image);
    // 各食材をデータベースに追加
    for (const ingredient of ingredients) {
      await fetch(new URL('/api/ingredients', request.url).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          expirationDate: ingredient.expirationDate,
          category: ingredient.category,
          notes: ingredient.notes,
          updatedAt: new Date(),
        }),
      });
    }

    // リダイレクトレスポンスを返す
    return NextResponse.redirect(new URL('/user/ingredients', request.url));
  } catch (error) {
    console.error('画像解析エラー:', error);
    return NextResponse.json(
      { error: '画像の解析に失敗しました' },
      { status: 500 }
    );
  }
} 