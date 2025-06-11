import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, Sparkles, Zap, Package, Receipt, RotateCcw, CircleCheck as CheckCircle, Brain, Database, Cpu } from 'lucide-react-native';
import Animated, { FadeInDown, BounceIn, ZoomIn } from 'react-native-reanimated';
import { aiService, type IngredientItem } from '@/services/aiService';
import { cameraService } from '@/services/cameraService';

export default function ScannerScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<IngredientItem[] | null>(null);
  const [scanMode, setScanMode] = useState<'groceries' | 'receipt'>('groceries');
  const [serviceStatus, setServiceStatus] = useState(aiService.getServiceStatus());
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <ImageBackground
        source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTExODI3Ii8+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxRjI5MzciLz4KPHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjMyIiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzFGMjkzNyIvPgo8L3N2Zz4=' }}
        style={styles.background}
        resizeMode="repeat"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Animated.View entering={BounceIn} style={styles.loadingContent}>
              <Camera size={48} color="#4ADE80" />
              <Text style={styles.loadingText}>Loading Camera...</Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (!permission.granted) {
    return (
      <ImageBackground
        source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTExODI3Ii8+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxRjI5MzciLz4KPHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjMyIiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzFGMjkzNyIvPgo8L3N2Zz4=' }}
        style={styles.background}
        resizeMode="repeat"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Animated.View entering={FadeInDown} style={styles.permissionContent}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.permissionGradient}
              >
                <Camera size={48} color="#FFFFFF" />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionMessage}>
                  We need camera permission to scan groceries and receipts for AI-powered ingredient recognition using TensorFlow.js.
                </Text>
                <TouchableOpacity 
                  style={styles.permissionButton} 
                  onPress={requestPermission}
                >
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const handleScan = async () => {
    setIsScanning(true);
    
    try {
      let imageUri: string;
      
      // Try to capture photo from camera
      if (Platform.OS !== 'web' && cameraRef.current) {
        const photo = await cameraService.capturePhoto(cameraRef as React.RefObject<CameraView>, {
          quality: 0.8,
          base64: false,
        });
        
        if (photo) {
          imageUri = await cameraService.processImageForAI(photo.uri);
        } else {
          throw new Error('Failed to capture photo');
        }
      } else {
        // For web or when camera capture fails, use mock data
        const mockPhoto = cameraService.createMockImageData();
        imageUri = mockPhoto.uri;
      }

      // Validate the image
      if (!cameraService.validateImage(imageUri)) {
        throw new Error('Invalid image format');
      }

      // Analyze the image with local AI
      let results: IngredientItem[];
      
      if (scanMode === 'receipt') {
        results = await aiService.analyzeReceiptImage(imageUri);
      } else {
        results = await aiService.analyzeGroceryImage(imageUri);
      }

      if (results.length === 0) {
        Alert.alert(
          'No Items Found', 
          'Could not identify any items in the image. Please try again with better lighting or a clearer view.'
        );
        return;
      }

      setScanResult(results);
      
      // Update service status
      setServiceStatus(aiService.getServiceStatus());
      
      // Provide haptic feedback on mobile
      if (Platform.OS !== 'web') {
        // Haptic feedback would go here
      }
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert(
        'Scan Error', 
        'Failed to process the image with local AI. Please try again.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = () => {
    setScanResult(null);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleAddToPantry = async () => {
    if (!scanResult) return;
    
    try {
      await aiService.addItemsToPantry(scanResult);
      
      Alert.alert(
        'Success!', 
        `Added ${scanResult.length} items to your pantry using local AI. You can now generate recipes with these ingredients!`,
        [
          {
            text: 'View Pantry',
            onPress: () => {
              // Navigate to pantry tab
              resetScan();
            },
          },
          {
            text: 'Scan More',
            onPress: resetScan,
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add items to pantry. Please try again.');
    }
  };

  if (scanResult) {
    return (
      <ImageBackground
        source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTExODI3Ii8+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxRjI5MzciLz4KPHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjMyIiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzFGMjkzNyIvPgo8L3N2Zz4=' }}
        style={styles.background}
        resizeMode="repeat"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.resultContainer}>
            <Animated.View entering={ZoomIn} style={styles.resultContent}>
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                style={styles.resultGradient}
              >
                <View style={styles.resultHeader}>
                  <CheckCircle size={32} color="#FFFFFF" />
                  <Text style={styles.resultTitle}>Local AI Scan Complete!</Text>
                  <Text style={styles.resultSubtitle}>
                    Identified {scanResult.length} items with TensorFlow.js
                  </Text>
                  
                  {/* AI Service Status */}
                  <View style={styles.serviceStatus}>
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
                </View>
                
                <View style={styles.resultItems}>
                  <Text style={styles.resultItemsTitle}>Detected Items:</Text>
                  {scanResult.map((item, index) => (
                    <Animated.View 
                      key={index} 
                      entering={FadeInDown.delay(index * 100)}
                      style={styles.resultItem}
                    >
                      <Package size={16} color="#4ADE80" />
                      <View style={styles.resultItemInfo}>
                        <Text style={styles.resultItemText}>{item.name}</Text>
                        {item.quantity && (
                          <Text style={styles.resultItemQuantity}>{item.quantity}</Text>
                        )}
                        {item.category && (
                          <Text style={styles.resultItemCategory}>{item.category}</Text>
                        )}
                      </View>
                      <View style={styles.confidenceContainer}>
                        <Text style={styles.confidenceText}>
                          {Math.round(item.confidence * 100)}%
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
                </View>
                
                <View style={styles.resultActions}>
                  <TouchableOpacity 
                    style={styles.resultActionButton}
                    onPress={handleAddToPantry}
                  >
                    <LinearGradient
                      colors={['#4ADE80', '#22C55E']}
                      style={styles.actionGradient}
                    >
                      <Package size={20} color="#FFFFFF" />
                      <Text style={styles.actionText}>Add to Pantry</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.resultActionButton}
                    onPress={resetScan}
                  >
                    <LinearGradient
                      colors={['#6B7280', '#4B5563']}
                      style={styles.actionGradient}
                    >
                      <Camera size={20} color="#FFFFFF" />
                      <Text style={styles.actionText}>Scan Again</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Header */}
        <Animated.View entering={FadeInDown} style={styles.header}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.4)']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <Brain size={24} color="#4ADE80" />
              <Text style={styles.headerTitle}>Local AI Scanner</Text>
              <Animated.View entering={BounceIn.delay(300)}>
                <Sparkles size={20} color="#FFD700" />
              </Animated.View>
            </View>
            
            {/* Service Status Indicators */}
            <View style={styles.headerStatus}>
              <View style={[styles.statusDot, { backgroundColor: serviceStatus.tensorflow ? '#4ADE80' : '#EF4444' }]} />
              <Text style={styles.statusText}>TensorFlow.js</Text>
              <View style={[styles.statusDot, { backgroundColor: serviceStatus.database ? '#4ADE80' : '#EF4444' }]} />
              <Text style={styles.statusText}>SQLite</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Scan Mode Selector */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              scanMode === 'groceries' && styles.modeButtonActive
            ]}
            onPress={() => setScanMode('groceries')}
          >
            <Package size={20} color={scanMode === 'groceries' ? '#FFFFFF' : '#9CA3AF'} />
            <Text style={[
              styles.modeText,
              scanMode === 'groceries' && styles.modeTextActive
            ]}>
              Groceries
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              scanMode === 'receipt' && styles.modeButtonActive
            ]}
            onPress={() => setScanMode('receipt')}
          >
            <Receipt size={20} color={scanMode === 'receipt' ? '#FFFFFF' : '#9CA3AF'} />
            <Text style={[
              styles.modeText,
              scanMode === 'receipt' && styles.modeTextActive
            ]}>
              Receipt
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Scan Frame */}
        <Animated.View entering={ZoomIn.delay(400)} style={styles.scanFrame}>
          <View style={styles.scanFrameCorners}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          
          {isScanning && (
            <Animated.View entering={BounceIn} style={styles.scanningIndicator}>
              <LinearGradient
                colors={['#4ADE80', '#22C55E']}
                style={styles.scanningGradient}
              >
                <Cpu size={24} color="#FFFFFF" />
                <Text style={styles.scanningText}>TensorFlow Processing...</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </Animated.View>

        {/* Instructions */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.instructions}>
          <Text style={styles.instructionText}>
            {scanMode === 'groceries' 
              ? 'Point camera at groceries for TensorFlow.js identification'
              : 'Scan your receipt to extract all purchased items'
            }
          </Text>
          <Text style={styles.instructionSubtext}>
            Local AI will analyze the image using your device's processing power
          </Text>
        </Animated.View>

        {/* Controls */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <RotateCcw size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.captureButton, isScanning && styles.captureButtonScanning]}
            onPress={handleScan}
            disabled={isScanning}
          >
            <LinearGradient
              colors={isScanning ? ['#6B7280', '#4B5563'] : ['#4ADE80', '#22C55E']}
              style={styles.captureGradient}
            >
              {isScanning ? (
                <Cpu size={32} color="#FFFFFF" />
              ) : (
                <Camera size={32} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.controlButton} />
        </Animated.View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionContent: {
    width: '100%',
  },
  permissionGradient: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#DC2626',
  },
  permissionTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionMessage: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    opacity: 0.9,
  },
  permissionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  permissionButtonText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  modeSelector: {
    position: 'absolute',
    top: 140,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#4ADE80',
  },
  modeText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  modeTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Orbitron-Bold',
  },
  scanFrame: {
    position: 'absolute',
    top: '35%',
    left: '10%',
    right: '10%',
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrameCorners: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4ADE80',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanningIndicator: {
    alignItems: 'center',
  },
  scanningGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  scanningText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  instructions: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    borderRadius: 12,
  },
  instructionText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  instructionSubtext: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#4ADE80',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4ADE80',
  },
  captureButton: {
    width: 80,
    height: 80,
  },
  captureButtonScanning: {
    opacity: 0.7,
  },
  captureGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  resultContent: {
    width: '100%',
  },
  resultGradient: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 3,
    borderColor: '#16A34A',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 12,
  },
  resultSubtitle: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  serviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
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
  resultItems: {
    marginBottom: 24,
  },
  resultItemsTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  resultItemInfo: {
    flex: 1,
  },
  resultItemText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  resultItemQuantity: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#4ADE80',
    marginTop: 2,
  },
  resultItemCategory: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  confidenceContainer: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confidenceText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 10,
    color: '#4ADE80',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  resultActionButton: {
    flex: 1,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});