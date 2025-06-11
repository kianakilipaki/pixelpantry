import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
  addedDate: string;
  confidence?: number;
  imageUri?: string;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients: string; // JSON string
  instructions: string; // JSON string
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  createdDate: string;
  isAIGenerated: boolean;
  rating?: number;
  imageUri?: string;
}

export interface MealPlan {
  id: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId?: number;
  recipeName: string;
  completed: boolean;
  createdDate: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // For web, we'll use a simple in-memory storage
        this.initializeWebStorage();
        return;
      }

      this.db = await SQLite.openDatabaseAsync('pixelpantry.db');
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    // Create pantry items table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS pantry_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity REAL NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'pieces',
        category TEXT NOT NULL DEFAULT 'Other',
        expiry_date TEXT,
        added_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        confidence REAL DEFAULT 1.0,
        image_uri TEXT
      );
    `);

    // Create recipes table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        cook_time INTEGER NOT NULL DEFAULT 30,
        servings INTEGER NOT NULL DEFAULT 4,
        difficulty TEXT NOT NULL DEFAULT 'Medium',
        category TEXT NOT NULL DEFAULT 'Main Dish',
        created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        is_ai_generated BOOLEAN DEFAULT FALSE,
        rating REAL,
        image_uri TEXT
      );
    `);

    // Create meal plans table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        recipe_id INTEGER,
        recipe_name TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
      );
    `);

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_pantry_category ON pantry_items(category);
      CREATE INDEX IF NOT EXISTS idx_pantry_expiry ON pantry_items(expiry_date);
      CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
      CREATE INDEX IF NOT EXISTS idx_meal_plans_date ON meal_plans(date);
    `);
  }

  private initializeWebStorage(): void {
    // Initialize web storage with default data if not exists
    if (!localStorage.getItem('pixelpantry_pantry')) {
      localStorage.setItem('pixelpantry_pantry', JSON.stringify([]));
    }
    if (!localStorage.getItem('pixelpantry_recipes')) {
      localStorage.setItem('pixelpantry_recipes', JSON.stringify([]));
    }
    if (!localStorage.getItem('pixelpantry_mealplans')) {
      localStorage.setItem('pixelpantry_mealplans', JSON.stringify([]));
    }
  }

  // Pantry Items CRUD Operations
  async addPantryItem(item: Omit<PantryItem, 'id' | 'addedDate'>): Promise<number> {
    if (Platform.OS === 'web') {
      return this.addPantryItemWeb(item);
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO pantry_items (name, quantity, unit, category, expiry_date, confidence, image_uri)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item.name, item.quantity, item.unit, item.category, item.expiryDate || null, item.confidence || 1.0, item.imageUri || null]
    );

    return result.lastInsertRowId;
  }

  private addPantryItemWeb(item: Omit<PantryItem, 'id' | 'addedDate'>): number {
    const items = JSON.parse(localStorage.getItem('pixelpantry_pantry') || '[]');
    const newItem: PantryItem = {
      ...item,
      id: Date.now(),
      addedDate: new Date().toISOString(),
    };
    items.push(newItem);
    localStorage.setItem('pixelpantry_pantry', JSON.stringify(items));
    return newItem.id;
  }

  async getPantryItems(): Promise<PantryItem[]> {
    if (Platform.OS === 'web') {
      return JSON.parse(localStorage.getItem('pixelpantry_pantry') || '[]');
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(`
      SELECT id, name, quantity, unit, category, expiry_date as expiryDate, 
             added_date as addedDate, confidence, image_uri as imageUri
      FROM pantry_items 
      ORDER BY added_date DESC
    `);

    return result as PantryItem[];
  }

  async updatePantryItem(id: number, updates: Partial<PantryItem>): Promise<void> {
    if (Platform.OS === 'web') {
      const items = JSON.parse(localStorage.getItem('pixelpantry_pantry') || '[]');
      const index = items.findIndex((item: PantryItem) => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...updates };
        localStorage.setItem('pixelpantry_pantry', JSON.stringify(items));
      }
      return;
    }

    if (!this.db) throw new Error('Database not initialized');

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'addedDate')
      .map(key => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
      .join(', ');

    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'addedDate')
      .map(([, value]) => value);

    await this.db.runAsync(
      `UPDATE pantry_items SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  async deletePantryItem(id: number): Promise<void> {
    if (Platform.OS === 'web') {
      const items = JSON.parse(localStorage.getItem('pixelpantry_pantry') || '[]');
      const filtered = items.filter((item: PantryItem) => item.id !== id);
      localStorage.setItem('pixelpantry_pantry', JSON.stringify(filtered));
      return;
    }

    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM pantry_items WHERE id = ?', [id]);
  }

  // Recipe CRUD Operations
  async addRecipe(recipe: Omit<Recipe, 'id' | 'createdDate'>): Promise<number> {
    if (Platform.OS === 'web') {
      return this.addRecipeWeb(recipe);
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO recipes (name, description, ingredients, instructions, cook_time, servings, difficulty, category, is_ai_generated, rating, image_uri)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipe.name,
        recipe.description,
        recipe.ingredients,
        recipe.instructions,
        recipe.cookTime,
        recipe.servings,
        recipe.difficulty,
        recipe.category,
        recipe.isAIGenerated,
        recipe.rating || null,
        recipe.imageUri || null
      ]
    );

    return result.lastInsertRowId;
  }

  private addRecipeWeb(recipe: Omit<Recipe, 'id' | 'createdDate'>): number {
    const recipes = JSON.parse(localStorage.getItem('pixelpantry_recipes') || '[]');
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now(),
      createdDate: new Date().toISOString(),
    };
    recipes.push(newRecipe);
    localStorage.setItem('pixelpantry_recipes', JSON.stringify(recipes));
    return newRecipe.id;
  }

  async getRecipes(): Promise<Recipe[]> {
    if (Platform.OS === 'web') {
      return JSON.parse(localStorage.getItem('pixelpantry_recipes') || '[]');
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(`
      SELECT id, name, description, ingredients, instructions, cook_time as cookTime,
             servings, difficulty, category, created_date as createdDate,
             is_ai_generated as isAIGenerated, rating, image_uri as imageUri
      FROM recipes 
      ORDER BY created_date DESC
    `);

    return result as Recipe[];
  }

  // Meal Plan CRUD Operations
  async addMealPlan(mealPlan: Omit<MealPlan, 'id' | 'createdDate'>): Promise<number> {
    if (Platform.OS === 'web') {
      return this.addMealPlanWeb(mealPlan);
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO meal_plans (date, meal_type, recipe_id, recipe_name, completed)
       VALUES (?, ?, ?, ?, ?)`,
      [mealPlan.date, mealPlan.mealType, mealPlan.recipeId || null, mealPlan.recipeName, mealPlan.completed]
    );

    return result.lastInsertRowId;
  }

  private addMealPlanWeb(mealPlan: Omit<MealPlan, 'id' | 'createdDate'>): number {
    const mealPlans = JSON.parse(localStorage.getItem('pixelpantry_mealplans') || '[]');
    const newMealPlan: MealPlan = {
      ...mealPlan,
      id: Date.now(),
      createdDate: new Date().toISOString(),
    };
    mealPlans.push(newMealPlan);
    localStorage.setItem('pixelpantry_mealplans', JSON.stringify(mealPlans));
    return newMealPlan.id;
  }

  async getMealPlans(startDate?: string, endDate?: string): Promise<MealPlan[]> {
    if (Platform.OS === 'web') {
      const mealPlans = JSON.parse(localStorage.getItem('pixelpantry_mealplans') || '[]');
      if (startDate && endDate) {
        return mealPlans.filter((plan: MealPlan) => 
          plan.date >= startDate && plan.date <= endDate
        );
      }
      return mealPlans;
    }

    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT id, date, meal_type as mealType, recipe_id as recipeId,
             recipe_name as recipeName, completed, created_date as createdDate
      FROM meal_plans
    `;
    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY date ASC, meal_type ASC';

    const result = await this.db.getAllAsync(query, params);
    return result as MealPlan[];
  }

  // Utility methods
  async getItemsByCategory(category: string): Promise<PantryItem[]> {
    if (Platform.OS === 'web') {
      const items = JSON.parse(localStorage.getItem('pixelpantry_pantry') || '[]');
      return items.filter((item: PantryItem) => item.category === category);
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(`
      SELECT id, name, quantity, unit, category, expiry_date as expiryDate,
             added_date as addedDate, confidence, image_uri as imageUri
      FROM pantry_items 
      WHERE category = ?
      ORDER BY added_date DESC
    `, [category]);

    return result as PantryItem[];
  }

  async getExpiringItems(days: number = 7): Promise<PantryItem[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    if (Platform.OS === 'web') {
      const items = JSON.parse(localStorage.getItem('pixelpantry_pantry') || '[]');
      return items.filter((item: PantryItem) => 
        item.expiryDate && item.expiryDate <= futureDateStr
      );
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(`
      SELECT id, name, quantity, unit, category, expiry_date as expiryDate,
             added_date as addedDate, confidence, image_uri as imageUri
      FROM pantry_items 
      WHERE expiry_date IS NOT NULL AND expiry_date <= ?
      ORDER BY expiry_date ASC
    `, [futureDateStr]);

    return result as PantryItem[];
  }

  async searchItems(query: string): Promise<PantryItem[]> {
    if (Platform.OS === 'web') {
      const items = JSON.parse(localStorage.getItem('pixelpantry_pantry') || '[]');
      return items.filter((item: PantryItem) => 
        item.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync(`
      SELECT id, name, quantity, unit, category, expiry_date as expiryDate,
             added_date as addedDate, confidence, image_uri as imageUri
      FROM pantry_items 
      WHERE name LIKE ?
      ORDER BY added_date DESC
    `, [`%${query}%`]);

    return result as PantryItem[];
  }

  async getStats(): Promise<{
    totalItems: number;
    totalRecipes: number;
    expiringItems: number;
    categoryCounts: { [category: string]: number };
  }> {
    if (Platform.OS === 'web') {
      const items = JSON.parse(localStorage.getItem('pixelpantry_pantry') || '[]');
      const recipes = JSON.parse(localStorage.getItem('pixelpantry_recipes') || '[]');
      const expiringItems = await this.getExpiringItems();
      
      const categoryCounts: { [category: string]: number } = {};
      items.forEach((item: PantryItem) => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      });

      return {
        totalItems: items.length,
        totalRecipes: recipes.length,
        expiringItems: expiringItems.length,
        categoryCounts,
      };
    }

    if (!this.db) throw new Error('Database not initialized');

    const [totalItemsResult, totalRecipesResult, expiringItemsResult, categoryCountsResult] = await Promise.all([
      this.db.getFirstAsync('SELECT COUNT(*) as count FROM pantry_items'),
      this.db.getFirstAsync('SELECT COUNT(*) as count FROM recipes'),
      this.getExpiringItems(),
      this.db.getAllAsync('SELECT category, COUNT(*) as count FROM pantry_items GROUP BY category'),
    ]);

    const categoryCounts: { [category: string]: number } = {};
    (categoryCountsResult as any[]).forEach(row => {
      categoryCounts[row.category] = row.count;
    });

    return {
      totalItems: (totalItemsResult as any).count,
      totalRecipes: (totalRecipesResult as any).count,
      expiringItems: expiringItemsResult.length,
      categoryCounts,
    };
  }
}

export const databaseService = new DatabaseService();