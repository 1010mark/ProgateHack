import { pool } from '../index';
import { Recipe } from '@/types/recipes';
import { Ingredient } from '@/types/ingredients';

export async function getRecipes(userId: string): Promise<Recipe[]> {
  const query = `
    SELECT
      id,
      recipes_name as "recipesName",
      people_count as "peopleCount",
      meal_preference as "mealPreference",
      cooking_time as "cookingTime",
      allergies,
      other_conditions as "otherConditions",
      status,
      description,
      content,
      created_at as "createdAt"
    FROM recipes
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
  // return mockRecipes.filter((recipe) => recipe.userId === userId);
}

export async function saveRecipe(recipe: Recipe): Promise<Recipe> {
  const query = `
    INSERT INTO recipes 
    (user_id, recipes_name, people_count, meal_preference, cooking_time, 
     allergies, other_conditions, status, description, content) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
    RETURNING 
      id,
      recipes_name as "recipesName",
      people_count as "peopleCount",
      meal_preference as "mealPreference",
      cooking_time as "cookingTime",
      allergies,
      other_conditions as "otherConditions",
      status,
      description,
      content,
      created_at as "createdAt"
  `;
  const values = [
    recipe.userId,
    recipe.recipesName,
    recipe.peopleCount,
    recipe.mealPreference,
    recipe.cookingTime,
    recipe.allergies,
    recipe.otherConditions,
    recipe.status,
    recipe.description,
    recipe.content,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function updateRecipe(
  recipe: Recipe & { user_id: string }
): Promise<Recipe> {
  const query = `
    UPDATE recipes 
    SET 
      recipes_name = $1,
      people_count = $2,
      meal_preference = $3,
      cooking_time = $4,
      allergies = $5,
      other_conditions = $6,
      status = $7,
      description = $8,
      content = $9,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $10 AND user_id = $11
    RETURNING 
      id,
      recipes_name as "recipesName",
      people_count as "peopleCount",
      meal_preference as "mealPreference",
      cooking_time as "cookingTime",
      allergies,
      other_conditions as "otherConditions",
      status,
      description,
      content,
      created_at as "createdAt"
  `;
  const values = [
    recipe.recipesName,
    recipe.peopleCount,
    recipe.mealPreference,
    recipe.cookingTime,
    recipe.allergies,
    recipe.otherConditions,
    recipe.status,
    recipe.description,
    recipe.content,
    recipe.id,
    recipe.user_id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function deleteRecipe(recipeId: string, userId: string): Promise<void> {
  const query = `
    DELETE FROM recipes 
    WHERE id = $1 AND user_id = $2
  `;
  await pool.query(query, [recipeId, userId]);
  console.log('simulating deleting ingredients');
}

export async function getRecipeIngredients(
  recipeId: string
): Promise<Ingredient[]> {
  const query = `
    SELECT ui.id, ui.name, ui.quantity, ui.unit, ui.expiration_date as "expirationDate", 
           ui.category, ui.user_id as "userId", ui.created_at as "createdAt",
           ui.updated_at as "updatedAt", ui.used_at as "usedAt", ui.status, ui.notes
    FROM recipe_task_ingredients rti
    JOIN user_ingredients ui ON rti.id = ui.id
    WHERE rti.recipe_id = $1
  `;
  const result = await pool.query(query, [recipeId]);
  return result.rows;
}

export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  const query = 'SELECT * FROM recipes WHERE id = $1';
  const { rows } = await pool.query(query, [recipeId]);
  return rows[0] || null;
}
