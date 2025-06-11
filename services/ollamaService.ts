import { Platform } from 'react-native';

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
}

export interface GeneratedRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  nutritionInfo?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
}

export interface MealPlanDay {
  day: number;
  date: string;
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snack?: string;
  };
}

export interface GeneratedMealPlan {
  days: MealPlanDay[];
  shoppingList: string[];
  nutritionSummary: {
    avgCaloriesPerDay: number;
    balanceScore: number;
  };
}

class OllamaService {
  private baseUrl: string;
  private isConnected: boolean = false;
  private model: string = 'llama3.2'; // Default model

  constructor() {
    // Default to localhost for development
    this.baseUrl = Platform.OS === 'web' 
      ? 'http://localhost:11434' 
      : 'http://10.0.2.2:11434'; // Android emulator localhost
  }

  async initialize(customUrl?: string): Promise<void> {
    if (customUrl) {
      this.baseUrl = customUrl;
    }

    try {
      console.log('Connecting to Ollama server...');
      await this.checkConnection();
      console.log('Ollama service initialized successfully');
    } catch (error) {
      console.error('Ollama initialization error:', error);
      console.log('Using mock data for recipe generation');
    }
  }

  private async checkConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Available models:', data.models?.map((m: any) => m.name) || []);
        this.isConnected = true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Ollama connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async generateRecipes(
    availableIngredients: string[],
    preferences?: {
      dietary?: string[];
      cookTime?: number;
      difficulty?: string;
      cuisine?: string;
      servings?: number;
    }
  ): Promise<GeneratedRecipe[]> {
    try {
      if (!this.isConnected) {
        console.log('Ollama not connected, using mock recipes');
        return this.getMockRecipes(availableIngredients, preferences);
      }

      const prompt = this.buildRecipePrompt(availableIngredients, preferences);
      const response = await this.callOllama(prompt);
      
      return this.parseRecipeResponse(response);
    } catch (error) {
      console.error('Recipe generation error:', error);
      return this.getMockRecipes(availableIngredients, preferences);
    }
  }

  async generateMealPlan(
    availableIngredients: string[],
    days: number = 7,
    preferences?: {
      mealsPerDay?: number;
      dietary?: string[];
      budget?: string;
      cookingTime?: number;
    }
  ): Promise<GeneratedMealPlan> {
    try {
      if (!this.isConnected) {
        console.log('Ollama not connected, using mock meal plan');
        return this.getMockMealPlan(days, preferences);
      }

      const prompt = this.buildMealPlanPrompt(availableIngredients, days, preferences);
      const response = await this.callOllama(prompt);
      
      return this.parseMealPlanResponse(response, days);
    } catch (error) {
      console.error('Meal plan generation error:', error);
      return this.getMockMealPlan(days, preferences);
    }
  }

  private async callOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Ollama API call failed:', error);
      throw error;
    }
  }

  private buildRecipePrompt(
    ingredients: string[],
    preferences?: any
  ): string {
    let prompt = `You are a professional chef. Create 3 detailed recipes using primarily these ingredients: ${ingredients.join(', ')}.

Requirements:
- Use as many of the provided ingredients as possible
- Provide complete ingredient lists with amounts
- Include step-by-step instructions
- Specify cooking time, servings, and difficulty level
- Categorize each recipe (Breakfast, Main Dish, Dessert, etc.)`;

    if (preferences?.dietary?.length) {
      prompt += `\n- Follow these dietary restrictions: ${preferences.dietary.join(', ')}`;
    }

    if (preferences?.cookTime) {
      prompt += `\n- Recipes should take no more than ${preferences.cookTime} minutes`;
    }

    if (preferences?.difficulty) {
      prompt += `\n- Difficulty level should be ${preferences.difficulty}`;
    }

    if (preferences?.cuisine) {
      prompt += `\n- Focus on ${preferences.cuisine} cuisine`;
    }

    prompt += `

Format your response as valid JSON with this exact structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "ingredients": [
        {"name": "ingredient", "amount": "1", "unit": "cup"}
      ],
      "instructions": ["Step 1", "Step 2"],
      "cookTime": 30,
      "servings": 4,
      "difficulty": "Easy",
      "category": "Main Dish",
      "nutritionInfo": {
        "calories": 350,
        "protein": "25g",
        "carbs": "30g",
        "fat": "15g"
      }
    }
  ]
}`;

    return prompt;
  }

  private buildMealPlanPrompt(
    ingredients: string[],
    days: number,
    preferences?: any
  ): string {
    let prompt = `Create a ${days}-day meal plan using these available ingredients: ${ingredients.join(', ')}.

Requirements:
- Plan breakfast, lunch, and dinner for each day
- Use the available ingredients efficiently
- Minimize food waste
- Provide a shopping list for additional needed items
- Include nutritional balance information`;

    if (preferences?.dietary?.length) {
      prompt += `\n- Follow these dietary restrictions: ${preferences.dietary.join(', ')}`;
    }

    if (preferences?.budget) {
      prompt += `\n- Keep within a ${preferences.budget} budget`;
    }

    if (preferences?.cookingTime) {
      prompt += `\n- Limit cooking time to ${preferences.cookingTime} minutes per meal`;
    }

    prompt += `

Format your response as valid JSON with this structure:
{
  "days": [
    {
      "day": 1,
      "date": "2024-01-15",
      "meals": {
        "breakfast": "Meal name",
        "lunch": "Meal name",
        "dinner": "Meal name"
      }
    }
  ],
  "shoppingList": ["item1", "item2"],
  "nutritionSummary": {
    "avgCaloriesPerDay": 2000,
    "balanceScore": 85
  }
}`;

    return prompt;
  }

  private parseRecipeResponse(response: string): GeneratedRecipe[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const recipes = parsed.recipes || [];

      return recipes.map((recipe: any, index: number) => ({
        id: `ollama_recipe_${Date.now()}_${index}`,
        name: recipe.name || 'Generated Recipe',
        description: recipe.description || '',
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        cookTime: recipe.cookTime || 30,
        servings: recipe.servings || 4,
        difficulty: recipe.difficulty || 'Medium',
        category: recipe.category || 'Main Dish',
        nutritionInfo: recipe.nutritionInfo,
      }));
    } catch (error) {
      console.error('Failed to parse recipe response:', error);
      return [];
    }
  }

  private parseMealPlanResponse(response: string, days: number): GeneratedMealPlan {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        days: parsed.days || [],
        shoppingList: parsed.shoppingList || [],
        nutritionSummary: parsed.nutritionSummary || {
          avgCaloriesPerDay: 2000,
          balanceScore: 80
        }
      };
    } catch (error) {
      console.error('Failed to parse meal plan response:', error);
      return this.getMockMealPlan(days);
    }
  }

  // Mock data for fallback
  private getMockRecipes(
    ingredients: string[],
    preferences?: any
  ): GeneratedRecipe[] {
    const mainIngredient = ingredients[0] || 'mixed ingredients';
    
    return [
      {
        id: `mock_recipe_${Date.now()}_1`,
        name: `Local AI ${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Delight`,
        description: `A delicious recipe featuring ${mainIngredient} created by our local AI chef.`,
        ingredients: [
          { name: mainIngredient, amount: '2', unit: 'cups' },
          { name: 'olive oil', amount: '2', unit: 'tbsp' },
          { name: 'salt', amount: '1', unit: 'tsp' },
          { name: 'black pepper', amount: '1/2', unit: 'tsp' },
          { name: 'garlic', amount: '2', unit: 'cloves' },
        ],
        instructions: [
          'Prepare all ingredients and wash them thoroughly.',
          'Heat olive oil in a large pan over medium heat.',
          'Add garlic and cook until fragrant, about 1 minute.',
          `Add ${mainIngredient} and cook for 5-7 minutes.`,
          'Season with salt and pepper to taste.',
          'Cook for an additional 10-15 minutes until tender.',
          'Serve hot and enjoy your AI-generated meal!',
        ],
        cookTime: preferences?.cookTime || 25,
        servings: preferences?.servings || 4,
        difficulty: preferences?.difficulty || 'Easy',
        category: 'Main Dish',
        nutritionInfo: {
          calories: 320,
          protein: '18g',
          carbs: '25g',
          fat: '12g',
        },
      },
      {
        id: `mock_recipe_${Date.now()}_2`,
        name: 'Ollama-Style Quick Stir Fry',
        description: 'A fast and healthy stir fry using your available ingredients.',
        ingredients: [
          { name: ingredients[1] || 'vegetables', amount: '1', unit: 'cup' },
          { name: 'soy sauce', amount: '2', unit: 'tbsp' },
          { name: 'ginger', amount: '1', unit: 'tsp' },
          { name: 'sesame oil', amount: '1', unit: 'tbsp' },
        ],
        instructions: [
          'Heat sesame oil in a wok or large skillet.',
          'Add ginger and stir for 30 seconds.',
          'Add vegetables and stir-fry for 3-5 minutes.',
          'Add soy sauce and toss to combine.',
          'Serve immediately over rice.',
        ],
        cookTime: 15,
        servings: 2,
        difficulty: 'Easy',
        category: 'Main Dish',
        nutritionInfo: {
          calories: 180,
          protein: '8g',
          carbs: '15g',
          fat: '10g',
        },
      },
    ];
  }

  private getMockMealPlan(days: number = 7, preferences?: any): GeneratedMealPlan {
    const startDate = new Date();
    const mealPlanDays: MealPlanDay[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      mealPlanDays.push({
        day: i + 1,
        date: currentDate.toISOString().split('T')[0],
        meals: {
          breakfast: `Day ${i + 1} AI Breakfast Bowl`,
          lunch: `Local Chef's Lunch Special`,
          dinner: `Ollama-Generated Dinner`,
        },
      });
    }

    return {
      days: mealPlanDays,
      shoppingList: [
        'Fresh herbs',
        'Seasonal vegetables',
        'Protein of choice',
        'Whole grains',
        'Healthy fats',
      ],
      nutritionSummary: {
        avgCaloriesPerDay: 2100,
        balanceScore: 88,
      },
    };
  }

  // Utility methods
  async setModel(modelName: string): Promise<void> {
    this.model = modelName;
    console.log(`Ollama model set to: ${modelName}`);
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      if (!this.isConnected) {
        return ['llama3.2', 'mistral', 'codellama'];
      }

      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to get available models:', error);
      return ['llama3.2'];
    }
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  getConnectionInfo(): { url: string; model: string; connected: boolean } {
    return {
      url: this.baseUrl,
      model: this.model,
      connected: this.isConnected,
    };
  }
}

export const ollamaService = new OllamaService();