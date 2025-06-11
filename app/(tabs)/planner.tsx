import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ChefHat, Clock, Users, Plus, Target, Zap, Trophy, CircleCheck as CheckCircle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, BounceIn } from 'react-native-reanimated';

interface MealPlan {
  id: string;
  day: string;
  date: string;
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  completed: number;
  total: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: string;
  icon: any;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const currentWeek: MealPlan[] = [
  {
    id: '1',
    day: 'Mon',
    date: '12',
    meals: { breakfast: 'Milk Pancakes', lunch: 'Beef Tacos', dinner: 'Apple Crisp' },
    completed: 2,
    total: 3
  },
  {
    id: '2',
    day: 'Tue',
    date: '13',
    meals: { breakfast: 'Oatmeal Bowl', lunch: 'Chicken Salad' },
    completed: 0,
    total: 2
  },
  {
    id: '3',
    day: 'Wed',
    date: '14',
    meals: { dinner: 'Pasta Night' },
    completed: 0,
    total: 1
  },
];

const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Cook Streak',
    description: 'Cook 7 days in a row',
    progress: 4,
    target: 7,
    reward: '500 XP',
    icon: Zap
  },
  {
    id: '2',
    title: 'Recipe Explorer',
    description: 'Try 10 new recipes',
    progress: 6,
    target: 10,
    reward: 'Chef Badge',
    icon: Trophy
  },
];

export default function PlannerScreen() {
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [weeklyGoal] = useState({ completed: 8, target: 12 });

  const renderMealPlan = ({ item }: { item: MealPlan }) => {
    const isSelected = item.day === selectedDay;
    const completionPercentage = (item.completed / item.total) * 100;
    
    return (
      <Animated.View entering={FadeInRight.delay(200)}>
        <TouchableOpacity
          style={[styles.dayCard, isSelected && styles.dayCardSelected]}
          onPress={() => setSelectedDay(item.day)}
        >
          <LinearGradient
            colors={isSelected ? ['#4ADE80', '#22C55E'] : ['#374151', '#1F2937']}
            style={styles.dayGradient}
          >
            <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
              {item.day}
            </Text>
            <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
              {item.date}
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${completionPercentage}%`,
                      backgroundColor: isSelected ? '#FFFFFF' : '#4ADE80'
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, isSelected && styles.progressTextSelected]}>
                {item.completed}/{item.total}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderChallenge = ({ item }: { item: Challenge }) => {
    const Icon = item.icon;
    const progressPercentage = (item.progress / item.target) * 100;
    
    return (
      <Animated.View entering={FadeInDown.delay(300)} style={styles.challengeCard}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.challengeGradient}
        >
          <View style={styles.challengeHeader}>
            <View style={styles.challengeIcon}>
              <Icon size={24} color="#FFD700" />
            </View>
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>{item.title}</Text>
              <Text style={styles.challengeDescription}>{item.description}</Text>
            </View>
            <View style={styles.challengeReward}>
              <Text style={styles.rewardText}>{item.reward}</Text>
            </View>
          </View>
          
          <View style={styles.challengeProgress}>
            <View style={styles.challengeProgressBackground}>
              <View 
                style={[styles.challengeProgressFill, { width: `${progressPercentage}%` }]}
              />
            </View>
            <Text style={styles.challengeProgressText}>
              {item.progress}/{item.target}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const selectedDayPlan = currentWeek.find(day => day.day === selectedDay);

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
              colors={['#A855F7', '#9333EA']}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.headerTitle}>Meal Planner</Text>
                  <Text style={styles.headerSubtitle}>Plan your culinary adventures</Text>
                </View>
                <View style={styles.headerIcon}>
                  <Calendar size={32} color="#FFFFFF" />
                  <Animated.View entering={BounceIn.delay(400)} style={styles.targetIcon}>
                    <Target size={16} color="#FFD700" />
                  </Animated.View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Weekly Goal */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.goalContainer}>
            <LinearGradient
              colors={['#06B6D4', '#0891B2']}
              style={styles.goalGradient}
            >
              <View style={styles.goalContent}>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>Weekly Goal</Text>
                  <Text style={styles.goalSubtitle}>Meals planned this week</Text>
                </View>
                <View style={styles.goalStats}>
                  <Text style={styles.goalNumber}>{weeklyGoal.completed}</Text>
                  <Text style={styles.goalTotal}>/{weeklyGoal.target}</Text>
                </View>
              </View>
              <View style={styles.goalProgress}>
                <View style={styles.goalProgressBackground}>
                  <View 
                    style={[
                      styles.goalProgressFill, 
                      { width: `${(weeklyGoal.completed / weeklyGoal.target) * 100}%` }
                    ]}
                  />
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Week View */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.weekContainer}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <FlatList
              data={currentWeek}
              renderItem={renderMealPlan}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.weekList}
            />
          </Animated.View>

          {/* Selected Day Meals */}
          {selectedDayPlan && (
            <Animated.View entering={FadeInDown.delay(400)} style={styles.mealsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{selectedDay} Meals</Text>
                <TouchableOpacity style={styles.addMealButton}>
                  <Plus size={20} color="#4ADE80" strokeWidth={3} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.mealsList}>
                {Object.entries(selectedDayPlan.meals).map(([mealType, mealName]) => (
                  <Animated.View 
                    key={mealType} 
                    entering={FadeInRight.delay(500)}
                    style={styles.mealItem}
                  >
                    <LinearGradient
                      colors={['#374151', '#1F2937']}
                      style={styles.mealGradient}
                    >
                      <View style={styles.mealHeader}>
                        <View style={styles.mealIcon}>
                          <ChefHat size={20} color="#4ADE80" />
                        </View>
                        <View style={styles.mealInfo}>
                          <Text style={styles.mealType}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                          <Text style={styles.mealName}>{mealName}</Text>
                        </View>
                        <TouchableOpacity style={styles.mealAction}>
                          <CheckCircle size={20} color="#4ADE80" />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Challenges */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.challengesContainer}>
            <Text style={styles.sectionTitle}>Weekly Challenges</Text>
            <FlatList
              data={challenges}
              renderItem={renderChallenge}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </Animated.View>

          {/* Generate Plan Button */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.generateContainer}>
            <TouchableOpacity>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.generateGradient}
              >
                <Zap size={24} color="#FFFFFF" />
                <Text style={styles.generateText}>Generate AI Meal Plan</Text>
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
    borderColor: '#9333EA',
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
  targetIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  goalContainer: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  goalGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#0891B2',
  },
  goalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  goalSubtitle: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  goalStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  goalNumber: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 32,
    color: '#FFFFFF',
  },
  goalTotal: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  goalProgress: {
    height: 8,
  },
  goalProgressBackground: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  weekContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  weekList: {
    gap: 12,
  },
  dayCard: {
    width: 80,
  },
  dayCardSelected: {
    transform: [{ scale: 1.05 }],
  },
  dayGradient: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  dayText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  dateText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 20,
    color: '#4ADE80',
    marginVertical: 8,
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 2,
    width: '100%',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 10,
    color: '#9CA3AF',
  },
  progressTextSelected: {
    color: '#FFFFFF',
  },
  mealsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addMealButton: {
    backgroundColor: '#1F2937',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4ADE80',
  },
  mealsList: {
    gap: 8,
  },
  mealItem: {
    marginBottom: 8,
  },
  mealGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
    color: '#4ADE80',
    textTransform: 'uppercase',
  },
  mealName: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  mealAction: {
    padding: 4,
  },
  challengesContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  challengeCard: {
    marginBottom: 12,
  },
  challengeGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeIcon: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  challengeDescription: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  challengeReward: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rewardText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 10,
    color: '#FFD700',
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  challengeProgressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 3,
  },
  challengeProgressText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  generateContainer: {
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
    borderColor: '#DC2626',
    gap: 8,
  },
  generateText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});