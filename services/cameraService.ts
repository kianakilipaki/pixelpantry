import { CameraView } from 'expo-camera';
import { Platform } from 'react-native';

interface CaptureOptions {
  quality?: number;
  base64?: boolean;
  skipProcessing?: boolean;
}

interface CaptureResult {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

class CameraService {
  // Capture photo from camera
  async capturePhoto(
    cameraRef: React.RefObject<CameraView>,
    options: CaptureOptions = {}
  ): Promise<CaptureResult | null> {
    try {
      if (!cameraRef.current) {
        throw new Error('Camera reference not available');
      }

      const defaultOptions: CaptureOptions = {
        quality: 0.8,
        base64: false,
        skipProcessing: false,
        ...options,
      };

      const photo = await cameraRef.current.takePictureAsync(defaultOptions);
      
      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      return {
        uri: photo.uri,
        base64: photo.base64,
        width: photo.width || 0,
        height: photo.height || 0,
      };
    } catch (error) {
      console.error('Photo capture error:', error);
      return null;
    }
  }

  // Process captured image for AI analysis
  async processImageForAI(imageUri: string): Promise<string> {
    try {
      // For web platform, return the URI directly
      if (Platform.OS === 'web') {
        return imageUri;
      }

      // For mobile platforms, return the URI as-is for local processing
      // TensorFlow.js can handle the image preprocessing
      return imageUri;
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }

  // Validate image before processing
  validateImage(imageUri: string): boolean {
    try {
      // Basic validation - check if URI exists and has proper format
      if (!imageUri || typeof imageUri !== 'string') {
        return false;
      }

      // Check for common image formats
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const hasValidExtension = validExtensions.some(ext => 
        imageUri.toLowerCase().includes(ext)
      );

      // For data URIs (base64), check format
      const isDataUri = imageUri.startsWith('data:image/');
      
      return hasValidExtension || isDataUri;
    } catch (error) {
      console.error('Image validation error:', error);
      return false;
    }
  }

  // Get optimal camera settings for AI scanning
  getOptimalCameraSettings() {
    return {
      quality: 0.8, // Good balance between quality and file size
      base64: false, // We'll convert separately if needed
      skipProcessing: false,
      // Additional settings for better AI recognition
      autoFocus: true,
      whiteBalance: 'auto',
      flashMode: 'auto',
    };
  }

  // Create mock image data for testing (when camera is not available)
  createMockImageData(): CaptureResult {
    return {
      uri: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      base64: undefined,
      width: 1920,
      height: 1080,
    };
  }
}

export const cameraService = new CameraService();
export type { CaptureOptions, CaptureResult };