import { pool } from '../index';
import { Ingredient } from '@/types/ingredients';

const dummyData = [] as Ingredient[];

for (let i = 0; i < 10; i++) {
  dummyData.push({
    id: i + '',
    name: `トマト+${i}`,
    quantity: 1,
    unit: '個',
    expirationDate: new Date('2022-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
    category: '野菜',
    status: 'active',
    userId: 'dummy-user-id',
  });
}

for (let i = 10; i < 20; i++) {
  dummyData.push({
    id: i + '',
    name: `牛肉${i}`,
    quantity: 1,
    unit: '個',
    expirationDate: new Date('2022-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
    category: '肉',
    status: 'active',
    userId: 'dummy-user-id',
  });
}

export async function getIngredients(userId: string): Promise<Ingredient[]> {
  const query = `
    SELECT * FROM user_ingredients
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
  console.log('simulating fetching ingredients');
  return dummyData;
}

export async function saveIngredient(
  ingredient: Ingredient
): Promise<Ingredient> {
  const query = `
    INSERT INTO user_ingredients
    (user_id, name, quantity, unit, expiration_date, category, notes, status, used_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const values = [
    ingredient.userId,
    ingredient.name,
    ingredient.quantity,
    ingredient.unit,
    ingredient.expirationDate,
    ingredient.category,
    ingredient.notes,
    ingredient.status || 'active',
    ingredient.usedAt,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];

  // シミュレーションバージョン
  console.log('simulating saving ingredient');
  const newIngredient = {
    ...ingredient,
    id: dummyData.length + 1 + '',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ingredient.status || 'active',
  };

  dummyData.push(newIngredient);
  return newIngredient;
}

export async function updateIngredient(
  ingredient: Ingredient
): Promise<Ingredient> {
  const query = `
    UPDATE user_ingredients
    SET name = $1, quantity = $2, unit = $3, expiration_date = $4,
        category = $5, notes = $6, status = $7, used_at = $8, updated_at = CURRENT_TIMESTAMP
    WHERE id = $9 AND user_id = $10
    RETURNING *
  `;
  const values = [
    ingredient.name,
    ingredient.quantity,
    ingredient.unit,
    ingredient.expirationDate,
    ingredient.category,
    ingredient.notes,
    ingredient.status || 'active',
    ingredient.usedAt,
    ingredient.id,
    ingredient.userId,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];

  // シミュレーションバージョン
  console.log('simulating updating ingredient');
  const index = dummyData.findIndex(
    (item) => item.id === ingredient.id && item.userId === ingredient.userId
  );

  if (index === -1) {
    throw new Error('Ingredient not found');
  }

  const updatedIngredient = {
    ...dummyData[index],
    ...ingredient,
    updatedAt: new Date(),
    status: ingredient.status || dummyData[index].status,
  };

  dummyData[index] = updatedIngredient;
  return updatedIngredient;
}

export async function deleteIngredient(
  id: string,
  userId: string
): Promise<void> {
  const query = `
    DELETE FROM user_ingredients
    WHERE id = $1 AND user_id = $2
  `;
  await pool.query(query, [id, userId]);
  console.log('simulating deleting ingredients');
  return;
}
