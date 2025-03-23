import { Recipe } from '@/types/recipes';

/**
 * Get all recipes for the current user
 */
export async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const response = await fetch('/api/recipes');
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    throw error;
  }
}

/**
 * Get a specific recipe by ID
 */
export async function fetchRecipeById(recipeId: string): Promise<Recipe> {
  try {
    const response = await fetch(`/api/recipes/${recipeId}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch recipe with ID ${recipeId}:`, error);
    throw error;
  }
}

/**
 * Delete a recipe by ID
 */
export async function deleteRecipe(
  recipeId: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/recipes/${recipeId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to delete recipe with ID ${recipeId}:`, error);
    throw error;
  }
}
