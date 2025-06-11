import { Tabs } from 'expo-router';
import { Package, ChefHat, Camera, Calendar, User, Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { AuthGuard } from '@/components/AuthGuard';

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#4ADE80',
          tabBarInactiveTintColor: '#6B7280',
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Pantry',
            tabBarIcon: ({ size, color }) => (
              <View style={styles.iconContainer}>
                <Package size={size} color={color} strokeWidth={2.5} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="recipes"
          options={{
            title: 'Recipes',
            tabBarIcon: ({ size, color }) => (
              <View style={styles.iconContainer}>
                <ChefHat size={size} color={color} strokeWidth={2.5} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="scanner"
          options={{
            title: 'Scan',
            tabBarIcon: ({ size, color }) => (
              <View style={[styles.iconContainer, styles.scannerIcon]}>
                <Camera size={size + 4} color="#FFFFFF" strokeWidth={2.5} />
                <Sparkles size={16} color="#FFD700" style={styles.sparkle} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="planner"
          options={{
            title: 'Planner',
            tabBarIcon: ({ size, color }) => (
              <View style={styles.iconContainer}>
                <Calendar size={size} color={color} strokeWidth={2.5} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <View style={styles.iconContainer}>
                <User size={size} color={color} strokeWidth={2.5} />
              </View>
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1F2937',
    borderTopWidth: 3,
    borderTopColor: '#4ADE80',
    paddingTop: 8,
    paddingBottom: 8,
    height: 80,
  },
  tabBarLabel: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scannerIcon: {
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  sparkle: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
});