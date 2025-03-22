import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from '@aws-sdk/client-bedrock-agent-runtime';

import { RecipeSuggestionRequest } from '@/types/recipes';
import { getRecipeIngredients } from '@/lib/db/operations/recipes';

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

// LLMとの通信を行うための共通関数
async function callLLM(prompt: string): Promise<string> {
  try {
    const client = initializeAWSClient();
    const sessionId = Date.now().toString();
    const command = new InvokeAgentCommand({
      agentId: process.env.NEXT_PUBLIC_AWS_AGENTID,
      agentAliasId: process.env.NEXT_PUBLIC_AWS_AGENT_ALIASID,
      sessionId,
      inputText: prompt,
    });

    // ベドロックエージェントの呼び出し
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
    // console.log('LLM response:', completion);
    // ダミー実装（実際のAPIに置き換えてください）
    return completion;
  } catch (error) {
    console.error('LLM API call failed:', error);
    throw error;
  }
}

/**
 * 提案リクエストからLLMを使用してレシピを生成する
 */
export async function generateRecipeSuggestions(
  suggestion: RecipeSuggestionRequest,
  recipeId: string
): Promise<string> {

  const ingredientLines = suggestion.ingredients.map(
    (item) => `- ${item.name}：${item.quantity}${item.unit}`
  );

  // LLM用のプロンプトを構築
  const prompt = `
${suggestion.recipesName}のレシピを作成してください。

【条件】
- 人数: ${suggestion.peopleCount}人前
${suggestion.mealPreference ? `- 料理の好み: ${suggestion.mealPreference}` : ''}
${suggestion.cookingTime ? `- 調理時間: ${suggestion.cookingTime}` : ''}
${
  suggestion.allergies && suggestion.allergies.length > 0
    ? `- アレルギー: ${suggestion.allergies.join(', ')}`
    : ''
}
${
  suggestion.otherConditions
    ? `- その他の条件: ${suggestion.otherConditions}`
    : ''
}

【使用できる食材】
${ingredientLines.join('\n')}

以下の形式でマークダウン形式のレシピを作成してください：
# レシピ名

## 材料（人数分）
- 材料1: 量
- 材料2: 量
...

## 作り方
1. 手順1
2. 手順2
...

## ポイント
- 調理のコツや注意点
`.trim();
  console.log('LLM prompt:', prompt);
  // LLMサービスを呼び出してレシピを生成
  const generatedContent = await callLLM(prompt);
  console.log('Generated recipe:', generatedContent);
  return generatedContent;
}
