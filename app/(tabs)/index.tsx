import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Package, Plus, Star, Zap, Trophy, Apple, Beef, Milk } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, BounceIn } from 'react-native-reanimated';

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  daysLeft: number;
  icon: any;
}

const pantryItems: PantryItem[] = [
  { id: '1', name: 'Apples', quantity: 6, category: 'Fruits', daysLeft: 5, icon: Apple },
  { id: '2', name: 'Ground Beef', quantity: 2, category: 'Meat', daysLeft: 2, icon: Beef },
  { id: '3', name: 'Milk', quantity: 1, category: 'Dairy', daysLeft: 3, icon: Milk },
];

export default function PantryScreen() {
  const [userXP] = useState(1250);
  const [userLevel] = useState(8);

  const renderPantryItem = ({ item }: { item: PantryItem }) => {
    const Icon = item.icon;
    const urgencyColor = item.daysLeft <= 2 ? '#EF4444' : item.daysLeft <= 5 ? '#F59E0B' : '#4ADE80';
    
    return (
      <Animated.View entering={FadeInRight.delay(200)} style={styles.pantryItem}>
        <LinearGradient
          colors={['#374151', '#1F2937']}
          style={styles.itemGradient}
        >
          <View style={styles.itemHeader}>
            <View style={[styles.itemIcon, { backgroundColor: urgencyColor + '20' }]}>
              <Icon size={24} color={urgencyColor} strokeWidth={2.5} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </View>
            <View style={styles.itemMeta}>
              <Text style={styles.itemQuantity}>×{item.quantity}</Text>
              <Text style={[styles.itemDays, { color: urgencyColor }]}>
                {item.daysLeft}d left
              </Text>
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
              colors={['#4ADE80', '#22C55E']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.welcomeText}>Welcome back, Chef!</Text>
                  <Text style={styles.levelText}>Level {userLevel} • {userXP} XP</Text>
                </View>
                <View style={styles.headerIcons}>
                  <Animated.View entering={BounceIn.delay(300)} style={styles.xpBadge}>
                    <Zap size={16} color="#FFD700" />
                    <Text style={styles.xpText}>+50</Text>
                  </Animated.View>
                  <View style={styles.trophyBadge}>
                    <Trophy size={20} color="#FFD700" />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.statGradient}>
                <Package size={24} color="#FFFFFF" />
                <Text style={styles.statNumber}>23</Text>
                <Text style={styles.statLabel}>Items</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statGradient}>
                <Star size={24} color="#FFFFFF" />
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Recipes</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.statGradient}>
                <Zap size={24} color="#FFFFFF" />
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Expiring</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Pantry Items */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Pantry</Text>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={20} color="#4ADE80" strokeWidth={3} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={pantryItems}
              renderItem={renderPantryItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionCard}>
                <LinearGradient colors={['#FB7185', '#F43F5E']} style={styles.actionGradient}>
                  <Star size={24} color="#FFFFFF" />
                  <Text style={styles.actionText}>Find Recipes</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCard}>
                <LinearGradient colors={['#06B6D4', '#0891B2']} style={styles.actionGradient}>
                  <Package size={24} color="#FFFFFF" />
                  <Text style={styles.actionText}>Add Items</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
    borderColor: '#22C55E',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  xpText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
    color: '#FFD700',
  },
  trophyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
  },
  statGradient: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  sectionContainer: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  addButton: {
    backgroundColor: '#1F2937',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4ADE80',
  },
  pantryItem: {
    marginBottom: 12,
  },
  itemGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  itemCategory: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemMeta: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#4ADE80',
  },
  itemDays: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 10,
    marginTop: 2,
  },
  quickActions: {
    margin: 16,
    marginTop: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionCard: {
    flex: 1,
  },
  actionGradient: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
});