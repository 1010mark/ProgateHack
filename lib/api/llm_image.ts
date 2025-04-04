import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from '@aws-sdk/client-bedrock-agent-runtime';
import { Ingredient } from '@/types/ingredients';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';

export type RawIngredient = Omit<Ingredient, 'id'>;

const initializeAWSClient = () => {
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1';
  const credentials = {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY as string,
    sessionToken: process.env.NEXT_PUBLIC_AWS_SESSION_TOKEN as string,
  };
  return new BedrockAgentRuntimeClient({
    region: region,
    credentials: credentials,
  });
};

/**
 * Base64エンコードされた画像データをPDFに変換する
 * @param imageBase64 Base64エンコードされた画像データ
 * @returns PDFのバイトデータ
 */
async function convertImageToPDF(imageBase64: string): Promise<Uint8Array> {
  // Base64デコード
  const imageBuffer = Buffer.from(imageBase64, 'base64');
  
  // 画像を処理
  const processedImage = await sharp(imageBuffer)
    .resize(800, 600, { fit: 'inside' }) // サイズを調整
    .toBuffer();

  // PDFドキュメントを作成
  const doc = new PDFDocument({
    autoFirstPage: true,
    size: 'A4',
    bufferPages: true
  });
  const chunks: Buffer[] = [];

  // PDFデータを収集
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  
  // 画像をPDFに追加（テキストを使用しない）
  doc.image(processedImage, {
    fit: [500, 400],
    align: 'center',
    valign: 'center'
  });

  // テキストを使用しないため、フォントは不要
  doc.end();

  // PromiseでPDFデータを待機
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(new Uint8Array(pdfBuffer));
    });
    doc.on('error', reject);
  });
}

/**
 * 文字列を配列として解釈する
 * @param text 解釈対象の文字列
 * @returns 解釈された配列、またはnull
 */
function parseResponseAsArray(text: string): any[] | null {
  try {
    // 文字列から配列部分を抽出
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (!arrayMatch) return null;

    // 配列文字列を評価
    const arrayStr = arrayMatch[0];
    return eval(arrayStr);
  } catch (error) {
    console.error('Failed to parse response as array:', error);
    return null;
  }
}

/**
 * 画像を含むLLMとの通信を行うための共通関数
 * @param prompt テキストプロンプト
 * @param imageBase64 Base64エンコードされた画像データ
 * @param maxRetries 最大リトライ回数
 * @returns LLMからの応答を配列として解釈した結果
 */
export async function callLLMwithImage(
  prompt: string,
  imageBase64: string,
  maxRetries: number = 3
): Promise<RawIngredient[]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = initializeAWSClient();
      const sessionId = Date.now().toString();

      // 画像をPDFに変換
      const pdfData = await convertImageToPDF(imageBase64);

      const command = new InvokeAgentCommand({
        agentId: process.env.NEXT_PUBLIC_AWS_AGENTID,
        agentAliasId: process.env.NEXT_PUBLIC_AWS_AGENT_ALIASID,
        sessionId,
        inputText: prompt,
        sessionState: {
          files: [{
            name: "image.pdf",
            source: {
              sourceType: "BYTE_CONTENT",
              byteContent: {
                mediaType: "application/pdf",
                data: pdfData
              }
            } as const,
            useCase: "CHAT" as const
          }]
        }
      });

      const response = await client.send(command);
      let completion = '';

      if (response.completion) {
        for await (const chunkEvent of response.completion) {
          const chunk = chunkEvent.chunk;
          if (chunk !== undefined) {
            const decodedResponse = new TextDecoder('utf-8').decode(chunk.bytes);
            completion += decodedResponse;
          }
        }
      }
      console.log(completion);
      // 応答を配列として解釈
      const parsedArray = parseResponseAsArray(completion);
      if (parsedArray !== null) {
        // 必要なフィールドを追加して返却
        return parsedArray.map(ingredient => ({
          ...ingredient,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active' as const
        }));
      }

      console.warn(`Attempt ${attempt}: Failed to parse response as array, retrying...`);
      lastError = new Error('Failed to parse response as array');
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error as Error;
    }

    // 最後の試行でない場合は少し待ってから再試行
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // すべての試行が失敗した場合
  throw lastError || new Error('All attempts failed to get valid array response');
}

/**
 * 画像からレシピを生成する
 * @param imageBase64 Base64エンコードされた画像データ
 * @param additionalPrompt 追加のプロンプト（オプション）
 * @returns 生成されたレシピ
 */
export async function generateIngredientsFromImage(
  imageBase64: string,
  additionalPrompt?: string
): Promise<RawIngredient[]> {
  const basePrompt = `
あなたは食材画像認識AIです。あなたのタスクは画像に写っている食材をすべて列挙することです。食材のみを挙げてください。まず、添付しているtxtをjpegのbase64として認識してください。そして画像を認識して、食材を返してください。レスポンスは以下のIngredient型の配列で返してください。

export type Unit = '個' | 'g' | 'ml' | '束' | '本' | '枚' | 'パック';

export type IngredientCategory =
  | '野菜'
  | '果物'
  | '肉'
  | '魚'
  | '卵'
  | '冷凍食品'
  | 'その他';

export interface Ingredient {
  name: string; // 食材の名称
  quantity: number; // 数量（単位は別途 unit で管理）
  unit: Unit; // 数量の単位（例: 個、g、ml など）
  expirationDate: Date; // 賞味期限（もし認識できない場合、一般的な期間を考えて推測してください。本日は2025/03/23です。）
  category: IngredientCategory;
  notes?: string; // メモ
}

例） [ { name: '玉ねぎ', quantity: 2, unit: '個', expirationDate: new Date(2025, 3, 30), category: '野菜', notes: '常温保存' }, { name: 'にんじん', quantity: 3, unit: '本', expirationDate: new Date(2025, 3, 30), category: '野菜' }, { name: '牛肉', quantity: 300, unit: 'g', expirationDate: new Date(2025, 3, 25), category: '肉', notes: '冷蔵保存' }, { name: '鶏もも肉', quantity: 500, unit: 'g', expirationDate: new Date(2025, 3, 26), category: '肉' }, { name: '卵', quantity: 6, unit: '個', expirationDate: new Date(2025, 4, 6), category: '卵' }]

なお、食材以外の内容を返す必要はありません。必ず配列のみを返してください。また、食材が写っていない場合は空の配列を返してください。
`;

  const prompt = additionalPrompt ? `${basePrompt}\n\n${additionalPrompt}` : basePrompt;

  return callLLMwithImage(prompt, imageBase64);
}
