import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ImageBackground, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChefHat, Clock, Users, Star, Sparkles, Flame, Heart, Zap, RefreshCw, Database, Brain, Cpu } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, BounceIn } from 'react-native-reanimated';
import { aiService, type Recipe } from '@/services/aiService';
import { databaseService } from '@/services/databaseService';

interface RecipeWithImage extends Recipe {
  image: string;
  isAI: boolean;
  rating: number;
}

export default function RecipesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recipes, setRecipes] = useState<RecipeWithImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [serviceStatus, setServiceStatus] = useState(aiService.getServiceStatus());
  
  const categories = ['All', 'Breakfast', 'Main Dish', 'Dessert', 'Snacks'];

  // Load initial recipes
  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const dbRecipes = await databaseService.getRecipes();
      const recipesWithImages: RecipeWithImage[] = dbRecipes.map(recipe => ({
        id: recipe.id.toString(),
        name: recipe.name,
        description: recipe.description,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions),
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        category: recipe.category,
        nutritionInfo: undefined, // Could be added to database schema
        image: recipe.imageUri || getRandomFoodImage(recipe.category),
        isAI: recipe.isAIGenerated,
        rating: recipe.rating || 4.5,
      }));

      // Add some initial mock recipes if database is empty
      if (recipesWithImages.length === 0) {
        const initialRecipes = getInitialRecipes();
        setRecipes(initialRecipes);
        
        // Save initial recipes to database
        for (const recipe of initialRecipes) {
          try {
            await databaseService.addRecipe({
              name: recipe.name,
              description: recipe.description,
              ingredients: JSON.stringify(recipe.ingredients),
              instructions: JSON.stringify(recipe.instructions),
              cookTime: recipe.cookTime,
              servings: recipe.servings,
              difficulty: recipe.difficulty,
              category: recipe.category,
              isAIGenerated: recipe.isAI,
              rating: recipe.rating,
              imageUri: recipe.image,
            });
          } catch (error) {
            console.error('Failed to save initial recipe:', error);
          }
        }
      } else {
        setRecipes(recipesWithImages);
      }
    } catch (error) {
      console.error('Failed to load recipes:', error);
      setRecipes(getInitialRecipes());
    }
  };

  const generateAIRecipes = async () => {
    setIsGenerating(true);
    
    try {
      // Get pantry ingredients
      const pantryIngredients = await aiService.getPantryIngredients();
      
      if (pantryIngredients.length === 0) {
        Alert.alert(
          'No Pantry Items',
          'Please scan some groceries first to generate personalized recipes.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      // Generate recipes using local AI (Ollama)
      const aiRecipes = await aiService.generateRecipes(pantryIngredients, {
        dietary: [],
        cookTime: 60,
        difficulty: 'Easy',
      });

      // Convert to RecipeWithImage format
      const recipesWithImages: RecipeWithImage[] = aiRecipes.map((recipe, index) => ({
        ...recipe,
        image: getRandomFoodImage(recipe.category),
        isAI: true,
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      }));

      // Add new recipes to the existing list
      setRecipes(prev => [...recipesWithImages, ...prev]);
      setLastGenerated(new Date());
      setServiceStatus(aiService.getServiceStatus());
      
      Alert.alert(
        'Local AI Recipes Generated!',
        `Created ${aiRecipes.length} new recipes using Ollama and your pantry ingredients.`,
        [{ text: 'Awesome!', style: 'default' }]
      );
    } catch (error) {
      console.error('Recipe generation error:', error);
      Alert.alert(
        'Generation Failed',
        'Unable to generate recipes with local AI. Please check if Ollama is running and try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getRandomFoodImage = (category: string): string => {
    const foodImages = {
      'Breakfast': [
        'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=300',
        'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=300',
      ],
      'Main Dish': [
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
        'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=300',
      ],
      'Dessert': [
        'https://images.pexels.com/photos/7474206/pexels-photo-7474206.jpeg?auto=compress&cs=tinysrgb&w=300',
        'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=300',
      ],
      'Snacks': [
        'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=300',
        'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=300',
      ],
    };

    const categoryImages = foodImages[category as keyof typeof foodImages] || foodImages['Main Dish'];
    return categoryImages[Math.floor(Math.random() * categoryImages.length)];
  };

  const getInitialRecipes = (): RecipeWithImage[] => {
    return [
      {
        id: 'initial_1',
        name: 'Classic Apple Crisp',
        description: 'A delicious dessert made with fresh apples and a crispy oat topping.',
        ingredients: [
          { name: 'Apples', amount: '6', unit: 'medium' },
          { name: 'Oats', amount: '1', unit: 'cup' },
          { name: 'Brown sugar', amount: '1/2', unit: 'cup' },
          { name: 'Butter', amount: '1/4', unit: 'cup' },
          { name: 'Cinnamon', amount: '1', unit: 'tsp' },
        ],
        instructions: [
          'Preheat oven to 375°F (190°C).',
          'Peel and slice apples, place in baking dish.',
          'Mix oats, brown sugar, and cinnamon in a bowl.',
          'Cut in butter until mixture resembles coarse crumbs.',
          'Sprinkle topping over apples.',
          'Bake for 35-40 minutes until golden brown.',
        ],
        cookTime: 45,
        servings: 6,
        difficulty: 'Easy',
        category: 'Dessert',
        image: 'https://images.pexels.com/photos/7474206/pexels-photo-7474206.jpeg?auto=compress&cs=tinysrgb&w=300',
        isAI: false,
        rating: 4.8,
        nutritionInfo: {
          calories: 280,
          protein: '3g',
          carbs: '58g',
          fat: '8g',
        },
      },
      {
        id: 'initial_2',
        name: 'Hearty Beef Tacos',
        description: 'Flavorful ground beef tacos with fresh toppings.',
        ingredients: [
          { name: 'Ground beef', amount: '1', unit: 'lb' },
          { name: 'Taco shells', amount: '8', unit: 'pieces' },
          { name: 'Onion', amount: '1', unit: 'medium' },
          { name: 'Tomatoes', amount: '2', unit: 'medium' },
          { name: 'Cheese', amount: '1', unit: 'cup' },
        ],
        instructions: [
          'Brown ground beef in a large skillet over medium heat.',
          'Add diced onion and cook until softened.',
          'Season with taco seasoning and simmer.',
          'Warm taco shells according to package directions.',
          'Fill shells with beef mixture and top with cheese and tomatoes.',
        ],
        cookTime: 25,
        servings: 4,
        difficulty: 'Medium',
        category: 'Main Dish',
        image: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg?auto=compress&cs=tinysrgb&w=300',
        isAI: false,
        rating: 4.6,
        nutritionInfo: {
          calories: 420,
          protein: '28g',
          carbs: '22g',
          fat: '24g',
        },
      },
    ];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4ADE80';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const filteredRecipes = selectedCategory === 'All' 
    ? recipes 
    : recipes.filter(recipe => recipe.category === selectedCategory);

  const renderRecipe = ({ item }: { item: RecipeWithImage }) => {
    return (
      <Animated.View entering={FadeInRight.delay(200)} style={styles.recipeCard}>
        <LinearGradient
          colors={['#374151', '#1F2937']}
          style={styles.recipeGradient}
        >
          <View style={styles.recipeImageContainer}>
            <Image source={{ uri: item.image }} style={styles.recipeImage} />
            {item.isAI && (
              <Animated.View entering={BounceIn.delay(300)} style={styles.aiBadge}>
                <Brain size={12} color="#FFD700" />
                <Text style={styles.aiText}>LOCAL AI</Text>
              </Animated.View>
            )}
            <TouchableOpacity style={styles.favoriteButton}>
              <Heart size={16} color="#EF4444" fill="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.recipeContent}>
            <Text style={styles.recipeName}>{item.name}</Text>
            <Text style={styles.recipeCategory}>{item.category}</Text>
            <Text style={styles.recipeDescription} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.recipeStats}>
              <View style={styles.statItem}>
                <Clock size={14} color="#9CA3AF" />
                <Text style={styles.statText}>{item.cookTime}m</Text>
              </View>
              <View style={styles.statItem}>
                <Users size={14} color="#9CA3AF" />
                <Text style={styles.statText}>{item.servings}</Text>
              </View>
              <View style={styles.statItem}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.statText}>{item.rating.toFixed(1)}</Text>
              </View>
            </View>
            
            <View style={styles.recipeFooter}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                  {item.difficulty}
                </Text>
              </View>
              <Text style={styles.ingredientsText}>{item.ingredients.length} ingredients</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <ImageBackground
      source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTExODI3Ii8+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxRjI5MzciLz4KPHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjMyIiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzFGMjkzNyIvPgo8L3N2Zz4=' }}
      style={styles.background}
      resizeMode="repeat"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <LinearGradient
              colors={['#FB923C', '#F97316']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.headerTitle}>Local AI Recipe Lab</Text>
                  <Text style={styles.headerSubtitle}>Recipes from your pantry using Ollama</Text>
                </View>
                <View style={styles.headerIcon}>
                  <ChefHat size={32} color="#FFFFFF" />
                  <Animated.View entering={BounceIn.delay(400)} style={styles.sparkleContainer}>
                    <Brain size={16} color="#FFD700" />
                  </Animated.View>
                </View>
              </View>
              
              {/* Service Status */}
              <View style={styles.serviceStatusHeader}>
                <View style={styles.serviceItem}>
                  <Database size={12} color={serviceStatus.database ? "#4ADE80" : "#EF4444"} />
                  <Text style={styles.serviceText}>SQLite</Text>
                </View>
                <View style={styles.serviceItem}>
                  <Cpu size={12} color={serviceStatus.tensorflow ? "#4ADE80" : "#EF4444"} />
                  <Text style={styles.serviceText}>TensorFlow</Text>
                </View>
                <View style={styles.serviceItem}>
                  <Brain size={12} color={serviceStatus.ollama ? "#4ADE80" : "#F59E0B"} />
                  <Text style={styles.serviceText}>Ollama</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Categories */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categories}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.categoryButtonActive
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category && styles.categoryTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Animated.View>

          {/* AI Generated Badge */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.aiSection}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.aiSectionGradient}
            >
              <View style={styles.aiSectionContent}>
                <Brain size={24} color="#FFD700" />
                <View style={styles.aiSectionText}>
                  <Text style={styles.aiSectionTitle}>Local AI-Generated Recipes</Text>
                  <Text style={styles.aiSectionSubtitle}>
                    {lastGenerated 
                      ? `Last updated: ${lastGenerated.toLocaleTimeString()}`
                      : 'Powered by Ollama & TensorFlow.js'
                    }
                  </Text>
                </View>
                <View style={styles.aiCounter}>
                  <Text style={styles.aiCounterText}>
                    {recipes.filter(r => r.isAI).length}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Recipes List */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.recipesContainer}>
            {filteredRecipes.length > 0 ? (
              <FlatList
                data={filteredRecipes}
                renderItem={renderRecipe}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <ChefHat size={48} color="#6B7280" />
                <Text style={styles.emptyStateText}>No recipes found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try generating some local AI recipes or select a different category
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Generate More Button */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.generateButton}>
            <TouchableOpacity onPress={generateAIRecipes} disabled={isGenerating}>
              <LinearGradient
                colors={isGenerating ? ['#6B7280', '#4B5563'] : ['#4ADE80', '#22C55E']}
                style={styles.generateGradient}
              >
                {isGenerating ? (
                  <RefreshCw size={20} color="#FFFFFF" />
                ) : (
                  <Brain size={20} color="#FFFFFF" />
                )}
                <Text style={styles.generateText}>
                  {isGenerating ? 'Generating with Ollama...' : 'Generate Local AI Recipes'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
  },
  header: {
    margin: 16,
    marginBottom: 8,
  },
  headerGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 3,
    borderColor: '#F97316',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  headerIcon: {
    position: 'relative',
  },
  sparkleContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  serviceStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  categories: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#374151',
    backgroundColor: '#1F2937',
  },
  categoryButtonActive: {
    borderColor: '#4ADE80',
    backgroundColor: '#4ADE80',
  },
  categoryText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Orbitron-Bold',
  },
  aiSection: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  aiSectionGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  aiSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiSectionText: {
    flex: 1,
  },
  aiSectionTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  aiSectionSubtitle: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  aiCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  aiCounterText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  recipesContainer: {
    paddingHorizontal: 16,
  },
  recipeCard: {
    marginBottom: 16,
  },
  recipeGradient: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    overflow: 'hidden',
  },
  recipeImageContainer: {
    position: 'relative',
    height: 120,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    
    resizeMode: 'cover',
  },
  aiBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 9,
    color: '#FFD700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 8,
  },
  recipeContent: {
    padding: 16,
  },
  recipeName: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recipeCategory: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  recipeDescription: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 16,
    marginBottom: 12,
  },
  recipeStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  recipeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 10,
  },
  ingredientsText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  generateButton: {
    margin: 16,
    marginTop: 8,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#22C55E',
    gap: 8,
  },
  generateText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});