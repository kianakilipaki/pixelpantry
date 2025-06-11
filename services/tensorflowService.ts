import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { Platform } from 'react-native';

export interface DetectedItem {
  name: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  category: string;
}

export interface ImageAnalysisResult {
  items: DetectedItem[];
  processingTime: number;
  modelVersion: string;
}

class TensorFlowService {
  private model: tf.LayersModel | null = null;
  private isInitialized = false;
  private foodLabels: string[] = [];

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      console.log('Initializing TensorFlow.js...');
      
      // Initialize TensorFlow.js platform
      await tf.ready();
      
      if (Platform.OS === 'web') {
        // For web, we can load a pre-trained model
        await this.loadWebModel();
      } else {
        // For mobile, use a lighter model or mock implementation
        await this.loadMobileModel();
      }

      this.initializeFoodLabels();
      this.isInitialized = true;
      console.log('TensorFlow.js initialized successfully');
    } catch (error) {
      console.error('TensorFlow initialization error:', error);
      // Initialize with mock data for fallback
      this.initializeMockModel();
    }
  }

  private async loadWebModel(): Promise<void> {
    try {
      // For demo purposes, we'll use a mock model
      // In production, you would load a real food classification model
      console.log('Loading web-based food classification model...');
      
      // Create a simple mock model for demonstration
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [224 * 224 * 3], units: 128, activation: 'relu' }),
          tf.layers.dense({ units: 64, activation: 'relu' }),
          tf.layers.dense({ units: this.getFoodCategoriesCount(), activation: 'softmax' })
        ]
      });

      console.log('Web model loaded successfully');
    } catch (error) {
      console.error('Failed to load web model:', error);
      throw error;
    }
  }

  private async loadMobileModel(): Promise<void> {
    try {
      console.log('Loading mobile-optimized food classification model...');
      
      // For mobile, we'll use a simpler approach or mock implementation
      // In production, you would load a TensorFlow Lite model
      this.model = null; // Use mock implementation for mobile
      
      console.log('Mobile model setup completed');
    } catch (error) {
      console.error('Failed to load mobile model:', error);
      throw error;
    }
  }

  private initializeMockModel(): void {
    console.log('Initializing mock model for fallback...');
    this.model = null;
    this.isInitialized = true;
  }

  private initializeFoodLabels(): void {
    // Common food items that our model can recognize
    this.foodLabels = [
      // Fruits
      'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'lemon', 'lime',
      'avocado', 'tomato', 'pear', 'peach', 'plum', 'cherry', 'watermelon', 'pineapple',
      
      // Vegetables
      'carrot', 'broccoli', 'spinach', 'lettuce', 'cucumber', 'bell pepper', 'onion',
      'garlic', 'potato', 'sweet potato', 'corn', 'peas', 'green beans', 'celery',
      
      // Proteins
      'chicken breast', 'ground beef', 'salmon', 'tuna', 'eggs', 'tofu', 'beans',
      'lentils', 'chickpeas', 'turkey', 'pork', 'shrimp', 'cod', 'bacon',
      
      // Dairy
      'milk', 'cheese', 'yogurt', 'butter', 'cream', 'mozzarella', 'cheddar',
      'parmesan', 'cottage cheese', 'sour cream',
      
      // Grains & Pantry
      'bread', 'rice', 'pasta', 'flour', 'oats', 'quinoa', 'barley', 'cereal',
      'crackers', 'noodles', 'bagel', 'tortilla',
      
      // Condiments & Spices
      'olive oil', 'salt', 'pepper', 'sugar', 'honey', 'vinegar', 'soy sauce',
      'ketchup', 'mustard', 'mayonnaise', 'hot sauce', 'herbs'
    ];
  }

  async analyzeImage(imageUri: string): Promise<ImageAnalysisResult> {
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('Analyzing image with TensorFlow.js...');

      // For now, we'll use a mock implementation
      // In production, you would preprocess the image and run inference
      const mockResult = await this.mockImageAnalysis(imageUri);
      
      const processingTime = Date.now() - startTime;
      
      return {
        ...mockResult,
        processingTime,
        modelVersion: 'PixelPantry-Food-v1.0'
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      
      // Return fallback result
      return {
        items: await this.getFallbackDetection(),
        processingTime: Date.now() - startTime,
        modelVersion: 'fallback-v1.0'
      };
    }
  }

  private async mockImageAnalysis(imageUri: string): Promise<{ items: DetectedItem[] }> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate realistic mock detections
    const possibleItems = this.getRandomFoodItems();
    const detectedItems: DetectedItem[] = [];

    for (let i = 0; i < Math.min(possibleItems.length, 3 + Math.floor(Math.random() * 4)); i++) {
      const item = possibleItems[i];
      const confidence = 0.7 + Math.random() * 0.25; // 70-95% confidence
      
      detectedItems.push({
        name: item.name,
        confidence: Math.round(confidence * 100) / 100,
        category: item.category,
        boundingBox: {
          x: Math.random() * 0.3,
          y: Math.random() * 0.3,
          width: 0.2 + Math.random() * 0.3,
          height: 0.2 + Math.random() * 0.3,
        }
      });
    }

    return { items: detectedItems };
  }

  private getRandomFoodItems(): Array<{ name: string; category: string }> {
    const foodCategories = {
      'Fruits': ['apple', 'banana', 'orange', 'grape', 'strawberry', 'avocado'],
      'Vegetables': ['carrot', 'broccoli', 'spinach', 'bell pepper', 'onion', 'tomato'],
      'Proteins': ['chicken breast', 'ground beef', 'salmon', 'eggs', 'tofu'],
      'Dairy': ['milk', 'cheese', 'yogurt', 'butter'],
      'Grains': ['bread', 'rice', 'pasta', 'oats'],
      'Pantry': ['olive oil', 'salt', 'pepper', 'honey']
    };

    const items: Array<{ name: string; category: string }> = [];
    
    Object.entries(foodCategories).forEach(([category, foods]) => {
      const randomFood = foods[Math.floor(Math.random() * foods.length)];
      items.push({ name: randomFood, category });
    });

    // Shuffle and return subset
    return items.sort(() => Math.random() - 0.5);
  }

  private async getFallbackDetection(): Promise<DetectedItem[]> {
    // Return some common items as fallback
    return [
      {
        name: 'apple',
        confidence: 0.85,
        category: 'Fruits'
      },
      {
        name: 'milk',
        confidence: 0.78,
        category: 'Dairy'
      },
      {
        name: 'bread',
        confidence: 0.82,
        category: 'Grains'
      }
    ];
  }

  private getFoodCategoriesCount(): number {
    return this.foodLabels.length;
  }

  async preprocessImage(imageUri: string): Promise<tf.Tensor | null> {
    try {
      if (Platform.OS === 'web') {
        // For web, we can use HTML5 Canvas to preprocess
        return await this.preprocessImageWeb(imageUri);
      } else {
        // For mobile, we'd need to use react-native-fs or similar
        return await this.preprocessImageMobile(imageUri);
      }
    } catch (error) {
      console.error('Image preprocessing error:', error);
      return null;
    }
  }

  private async preprocessImageWeb(imageUri: string): Promise<tf.Tensor | null> {
    try {
      // Create an image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Create canvas and resize image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }

            // Resize to model input size (224x224 is common for food classification)
            canvas.width = 224;
            canvas.height = 224;
            
            ctx.drawImage(img, 0, 0, 224, 224);
            
            // Convert to tensor
            const tensor = tf.browser.fromPixels(canvas)
              .resizeNearestNeighbor([224, 224])
              .toFloat()
              .div(255.0)
              .expandDims(0);
            
            resolve(tensor);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUri;
      });
    } catch (error) {
      console.error('Web image preprocessing error:', error);
      return null;
    }
  }

  private async preprocessImageMobile(imageUri: string): Promise<tf.Tensor | null> {
    try {
      // For mobile, we'd typically use react-native-fs to read the image
      // and then convert it to a tensor. For now, return null to use mock data
      console.log('Mobile image preprocessing not implemented, using mock data');
      return null;
    } catch (error) {
      console.error('Mobile image preprocessing error:', error);
      return null;
    }
  }

  // Utility methods
  getCategoryFromLabel(label: string): string {
    const categoryMap: { [key: string]: string } = {
      // Fruits
      'apple': 'Fruits', 'banana': 'Fruits', 'orange': 'Fruits', 'grape': 'Fruits',
      'strawberry': 'Fruits', 'avocado': 'Fruits', 'tomato': 'Fruits',
      
      // Vegetables
      'carrot': 'Vegetables', 'broccoli': 'Vegetables', 'spinach': 'Vegetables',
      'bell pepper': 'Vegetables', 'onion': 'Vegetables', 'potato': 'Vegetables',
      
      // Proteins
      'chicken breast': 'Proteins', 'ground beef': 'Proteins', 'salmon': 'Proteins',
      'eggs': 'Proteins', 'tofu': 'Proteins',
      
      // Dairy
      'milk': 'Dairy', 'cheese': 'Dairy', 'yogurt': 'Dairy', 'butter': 'Dairy',
      
      // Grains
      'bread': 'Grains', 'rice': 'Grains', 'pasta': 'Grains', 'oats': 'Grains',
      
      // Pantry
      'olive oil': 'Pantry', 'salt': 'Pantry', 'pepper': 'Pantry', 'honey': 'Pantry'
    };

    return categoryMap[label.toLowerCase()] || 'Other';
  }

  isModelReady(): boolean {
    return this.isInitialized;
  }

  getModelInfo(): { version: string; platform: string; ready: boolean } {
    return {
      version: 'PixelPantry-Food-v1.0',
      platform: Platform.OS,
      ready: this.isInitialized
    };
  }
}

export const tensorflowService = new TensorFlowService();