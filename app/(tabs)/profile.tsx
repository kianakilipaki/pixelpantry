import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { User, Trophy, Star, Zap, ChefHat, Target, Calendar, Package, Settings, Crown, Medal, Award, LogOut, Edit, Shield, Bell, HelpCircle, Chrome, Apple, Play } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, BounceIn } from 'react-native-reanimated';
import { useAuth } from '@/components/AuthContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
}

const achievements: Achievement[] = [
  { id: '1', title: 'First Cook', description: 'Cooked your first recipe', icon: ChefHat, unlocked: true, rarity: 'common' },
  { id: '2', title: 'AI Master', description: 'Used AI scanner 10 times', icon: Zap, unlocked: true, rarity: 'rare' },
  { id: '3', title: 'Recipe Collector', description: 'Saved 25 recipes', icon: Star, unlocked: true, rarity: 'epic' },
  { id: '4', title: 'Pantry Pro', description: 'Maintained 50+ items', icon: Package, unlocked: false, rarity: 'legendary' },
];

const stats: Stat[] = [
  { label: 'Recipes Cooked', value: '47', icon: ChefHat, color: '#4ADE80' },
  { label: 'Days Streak', value: '12', icon: Calendar, color: '#F59E0B' },
  { label: 'Items Scanned', value: '156', icon: Zap, color: '#8B5CF6' },
  { label: 'XP Earned', value: '2,450', icon: Star, color: '#EF4444' },
];

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const [userLevel] = useState(8);
  const [userXP] = useState(1250);
  const [nextLevelXP] = useState(1500);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of PixelPantry?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google': return Chrome;
      case 'apple': return Apple;
      case 'playstore': return Play;
      default: return Shield;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'google': return '#4285F4';
      case 'apple': return '#000000';
      case 'playstore': return '#01875F';
      default: return '#6B7280';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#A855F7';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return ['#6B7280', '#4B5563'];
      case 'rare': return ['#3B82F6', '#2563EB'];
      case 'epic': return ['#A855F7', '#9333EA'];
      case 'legendary': return ['#F59E0B', '#D97706'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  const levelProgress = (userXP / nextLevelXP) * 100;

  if (!user) {
    return null;
  }

  const ProviderIcon = getProviderIcon(user.provider);

  return (
    <ImageBackground
      source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTExODI3Ii8+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxRjI5MzciLz4KPHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMUYyOTM3Ii8+CjxyZWN0IHg9IjMyIiB5PSIzMiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iIzFGMjkzNyIvPgo8L3N2Zz4=' }}
      style={styles.background}
      resizeMode="repeat"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.profileHeader}>
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.profileGradient}
            >
              <View style={styles.profileContent}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarWrapper}>
                    {user.avatar ? (
                      <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                    ) : (
                      <LinearGradient
                        colors={['#FFD700', '#F59E0B']}
                        style={styles.avatarGradient}
                      >
                        <User size={40} color="#FFFFFF" />
                      </LinearGradient>
                    )}
                    <Animated.View entering={BounceIn.delay(400)} style={styles.crownIcon}>
                      <Crown size={20} color="#FFD700" />
                    </Animated.View>
                  </View>
                  
                  {/* Provider Badge */}
                  <View style={[styles.providerBadge, { backgroundColor: getProviderColor(user.provider) + '20' }]}>
                    <ProviderIcon size={16} color={getProviderColor(user.provider)} />
                  </View>
                </View>
                
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.levelContainer}>
                    <Text style={styles.levelText}>Level {userLevel}</Text>
                    <View style={styles.levelBadge}>
                      <Trophy size={16} color="#FFD700" />
                    </View>
                  </View>
                </View>
                
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.editButton}>
                    <Edit size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={isLoading}
                  >
                    <LogOut size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* XP Progress */}
              <View style={styles.xpContainer}>
                <View style={styles.xpInfo}>
                  <Text style={styles.xpText}>{userXP} / {nextLevelXP} XP</Text>
                  <Text style={styles.xpToNext}>{nextLevelXP - userXP} XP to next level</Text>
                </View>
                <View style={styles.xpProgressBackground}>
                  <Animated.View 
                    entering={FadeInRight.delay(500)}
                    style={[styles.xpProgressFill, { width: `${levelProgress}%` }]}
                  />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Account Info */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.accountSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.accountCard}>
              <LinearGradient
                colors={['#374151', '#1F2937']}
                style={styles.accountGradient}
              >
                <View style={styles.accountRow}>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountLabel}>Signed in with</Text>
                    <Text style={styles.accountValue}>
                      {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
                    </Text>
                  </View>
                  <View style={[styles.accountIcon, { backgroundColor: getProviderColor(user.provider) + '20' }]}>
                    <ProviderIcon size={24} color={getProviderColor(user.provider)} />
                  </View>
                </View>
                
                <View style={styles.accountRow}>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountLabel}>Member since</Text>
                    <Text style={styles.accountValue}>December 2024</Text>
                  </View>
                  <View style={[styles.accountIcon, { backgroundColor: '#4ADE8020' }]}>
                    <Calendar size={24} color="#4ADE80" />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Animated.View 
                    key={stat.label} 
                    entering={FadeInDown.delay(400 + index * 100)}
                    style={styles.statCard}
                  >
                    <LinearGradient
                      colors={['#374151', '#1F2937']}
                      style={styles.statGradient}
                    >
                      <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                        <Icon size={24} color={stat.color} />
                      </View>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                    </LinearGradient>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

          {/* Settings Menu */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsMenu}>
              <TouchableOpacity style={styles.settingItem}>
                <LinearGradient
                  colors={['#374151', '#1F2937']}
                  style={styles.settingGradient}
                >
                  <View style={styles.settingContent}>
                    <View style={[styles.settingIcon, { backgroundColor: '#8B5CF620' }]}>
                      <Bell size={20} color="#8B5CF6" />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>Notifications</Text>
                      <Text style={styles.settingDescription}>Manage your notification preferences</Text>
                    </View>
                    <Settings size={16} color="#9CA3AF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <LinearGradient
                  colors={['#374151', '#1F2937']}
                  style={styles.settingGradient}
                >
                  <View style={styles.settingContent}>
                    <View style={[styles.settingIcon, { backgroundColor: '#F59E0B20' }]}>
                      <Shield size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>Privacy & Security</Text>
                      <Text style={styles.settingDescription}>Control your data and privacy</Text>
                    </View>
                    <Settings size={16} color="#9CA3AF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <LinearGradient
                  colors={['#374151', '#1F2937']}
                  style={styles.settingGradient}
                >
                  <View style={styles.settingContent}>
                    <View style={[styles.settingIcon, { backgroundColor: '#06B6D420' }]}>
                      <HelpCircle size={20} color="#06B6D4" />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>Help & Support</Text>
                      <Text style={styles.settingDescription}>Get help and contact support</Text>
                    </View>
                    <Settings size={16} color="#9CA3AF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Achievements Preview */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.achievementsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <View style={styles.achievementCount}>
                <Medal size={16} color="#FFD700" />
                <Text style={styles.achievementCountText}>
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </Text>
              </View>
            </View>
            
            <View style={styles.achievementsList}>
              {achievements.slice(0, 2).map((achievement, index) => {
                const Icon = achievement.icon;
                const rarityColors = getRarityGradient(achievement.rarity);
                
                return (
                  <Animated.View
                    key={achievement.id}
                    entering={FadeInRight.delay(700 + index * 100)}
                    style={[
                      styles.achievementCard,
                      !achievement.unlocked && styles.achievementCardLocked
                    ]}
                  >
                    <LinearGradient
                      colors={achievement.unlocked ? rarityColors : ['#374151', '#1F2937']}
                      style={styles.achievementGradient}
                    >
                      <View style={styles.achievementContent}>
                        <View style={[
                          styles.achievementIcon,
                          !achievement.unlocked && styles.achievementIconLocked
                        ]}>
                          <Icon 
                            size={24} 
                            color={achievement.unlocked ? '#FFFFFF' : '#6B7280'} 
                          />
                        </View>
                        
                        <View style={styles.achievementInfo}>
                          <View style={styles.achievementHeader}>
                            <Text style={[
                              styles.achievementTitle,
                              !achievement.unlocked && styles.achievementTitleLocked
                            ]}>
                              {achievement.title}
                            </Text>
                            <View style={[
                              styles.rarityBadge,
                              { backgroundColor: getRarityColor(achievement.rarity) + '30' }
                            ]}>
                              <Text style={[
                                styles.rarityText,
                                { color: getRarityColor(achievement.rarity) }
                              ]}>
                                {achievement.rarity.toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <Text style={[
                            styles.achievementDescription,
                            !achievement.unlocked && styles.achievementDescriptionLocked
                          ]}>
                            {achievement.description}
                          </Text>
                        </View>
                        
                        {achievement.unlocked && (
                          <Animated.View entering={BounceIn.delay(800)}>
                            <Award size={20} color="#FFD700" />
                          </Animated.View>
                        )}
                      </View>
                    </LinearGradient>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View entering={FadeInDown.delay(700)} style={styles.logoutContainer}>
            <TouchableOpacity 
              style={styles.logoutButtonLarge}
              onPress={handleLogout}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.logoutGradient}
              >
                <LogOut size={20} color="#FFFFFF" />
                <Text style={styles.logoutText}>
                  {isLoading ? 'Signing Out...' : 'Sign Out'}
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
  profileHeader: {
    margin: 16,
    marginBottom: 8,
  },
  profileGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  crownIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  providerBadge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    padding: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userEmail: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  levelText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 4,
    borderRadius: 6,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    padding: 12,
    borderRadius: 8,
  },
  xpContainer: {
    gap: 8,
  },
  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  xpToNext: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  xpProgressBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  accountSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  accountCard: {
    marginBottom: 4,
  },
  accountGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  accountValue: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  accountIcon: {
    padding: 8,
    borderRadius: 8,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
  },
  statGradient: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  statIcon: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  settingsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingsMenu: {
    gap: 8,
  },
  settingItem: {
    marginBottom: 4,
  },
  settingGradient: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  settingDescription: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  achievementsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
    gap: 6,
  },
  achievementCountText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
    color: '#FFD700',
  },
  achievementsList: {
    gap: 8,
  },
  achievementCard: {
    marginBottom: 4,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  achievementIconLocked: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  achievementTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  achievementTitleLocked: {
    color: '#6B7280',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 8,
  },
  achievementDescription: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  achievementDescriptionLocked: {
    color: '#6B7280',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  logoutButtonLarge: {
    marginTop: 8,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
    gap: 8,
  },
  logoutText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});