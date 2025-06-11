import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChefHat, Sparkles, Zap, Trophy, Apple, Play, Chrome, Shield, Star, Gamepad2 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, BounceIn, ZoomIn, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { useAuth } from '@/components/AuthContext';
import type { ColorValue } from 'react-native';

export default function LoginScreen() {
  const { login, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'playstore') => {
    try {
      await login(provider);
      Alert.alert(
        'Welcome to PixelPantry!', 
        `Successfully logged in with ${provider}. Ready to start your culinary adventure?`,
        [
          {
            text: 'Let\'s Cook!',
            onPress: () => router.replace('/(tabs)'),
          }
        ]
      );
    } catch (error) {
      Alert.alert('Login Error', 'Failed to authenticate. Please try again.');
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google': return Chrome;
      case 'apple': return Apple;
      case 'playstore': return Play;
      default: return Shield;
    }
  };


  const getProviderColors = (provider: string): [ColorValue, ColorValue] => {
    switch (provider) {
      case 'google': return ['#4285F4', '#34A853'];
      case 'apple': return ['#000000', '#1D1D1F'];
      case 'playstore': return ['#01875F', '#4CAF50'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTExODI3Ii8+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxRjI5MzciLz4KPHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjMyIiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzFGMjkzNyIvPgo8L3N2Zz4=' }}
      style={styles.background}
      resizeMode="repeat"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Animated Header */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
            <View style={styles.logoContainer}>
              <Animated.View entering={BounceIn.delay(600)} style={styles.logoBackground}>
                <LinearGradient
                  colors={['#4ADE80', '#22C55E']}
                  style={styles.logoGradient}
                >
                  <ChefHat size={48} color="#FFFFFF" strokeWidth={2.5} />
                  <Animated.View entering={ZoomIn.delay(1000)} style={styles.sparkleTopRight}>
                    <Sparkles size={20} color="#FFD700" />
                  </Animated.View>
                  <Animated.View entering={ZoomIn.delay(1200)} style={styles.sparkleBottomLeft}>
                    <Zap size={16} color="#FFD700" />
                  </Animated.View>
                </LinearGradient>
              </Animated.View>
            </View>
            
            <Animated.Text entering={SlideInLeft.delay(800)} style={styles.title}>
              PixelPantry
            </Animated.Text>
            <Animated.Text entering={SlideInRight.delay(1000)} style={styles.subtitle}>
              Your AI-Powered Culinary Adventure
            </Animated.Text>
          </Animated.View>

          {/* Feature Highlights */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <Animated.View entering={SlideInLeft.delay(1200)} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: '#8B5CF620' }]}>
                  <Zap size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.featureText}>AI Scanner</Text>
              </Animated.View>
              
              <Animated.View entering={FadeInDown.delay(1400)} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: '#F59E0B20' }]}>
                  <Trophy size={20} color="#F59E0B" />
                </View>
                <Text style={styles.featureText}>Achievements</Text>
              </Animated.View>
              
              <Animated.View entering={SlideInRight.delay(1600)} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: '#EF444420' }]}>
                  <Gamepad2 size={20} color="#EF4444" />
                </View>
                <Text style={styles.featureText}>Gamified</Text>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Login Options */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.loginContainer}>
            <Text style={styles.loginTitle}>Choose Your Login Method</Text>
            
            <View style={styles.loginButtons}>
              {/* Google Login */}
              <Animated.View entering={SlideInLeft.delay(1800)}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={getProviderColors('google')}
                    style={styles.loginGradient}
                  >
                    <View style={styles.loginContent}>
                      <View style={styles.loginIconContainer}>
                        <Chrome size={24} color="#FFFFFF" strokeWidth={2.5} />
                      </View>
                      <Text style={styles.loginText}>Continue with Google</Text>
                      <View style={styles.loginArrow}>
                        <Star size={16} color="#FFFFFF" />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Apple Login */}
              {Platform.OS === 'ios' && (
                <Animated.View entering={FadeInDown.delay(2000)}>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => handleSocialLogin('apple')}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={getProviderColors('apple')}
                      style={styles.loginGradient}
                    >
                      <View style={styles.loginContent}>
                        <View style={styles.loginIconContainer}>
                          <Apple size={24} color="#FFFFFF" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.loginText}>Continue with Apple</Text>
                        <View style={styles.loginArrow}>
                          <Star size={16} color="#FFFFFF" />
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Play Store Login */}
              {Platform.OS === 'android' && (
                <Animated.View entering={SlideInRight.delay(2200)}>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => handleSocialLogin('playstore')}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={getProviderColors('playstore')}
                      style={styles.loginGradient}
                    >
                      <View style={styles.loginContent}>
                        <View style={styles.loginIconContainer}>
                          <Play size={24} color="#FFFFFF" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.loginText}>Continue with Play Games</Text>
                        <View style={styles.loginArrow}>
                          <Star size={16} color="#FFFFFF" />
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </Animated.View>

          {/* Loading State */}
          {isLoading && (
            <Animated.View entering={ZoomIn} style={styles.loadingOverlay}>
              <LinearGradient
                colors={['#4ADE80', '#22C55E']}
                style={styles.loadingContainer}
              >
                <Animated.View entering={BounceIn}>
                  <Zap size={32} color="#FFFFFF" />
                </Animated.View>
                <Text style={styles.loadingText}>Authenticating...</Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Footer */}
          <Animated.View entering={FadeInUp.delay(2400)} style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </Animated.View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoBackground: {
    position: 'relative',
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  sparkleBottomLeft: {
    position: 'absolute',
    bottom: 5,
    left: 5,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(74, 222, 128, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    marginVertical: 40,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 300,
  },
  loginTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loginButtons: {
    gap: 16,
  },
  loginButton: {
    marginBottom: 4,
  },
  loginGradient: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  loginIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  loginText: {
    flex: 1,
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loginArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#22C55E',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  footer: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});