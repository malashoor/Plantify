import { Tabs } from 'expo-router';
import {
  Camera,
  Leaf,
  Home,
  Calendar,
  Settings,
  BarChart as Insights
} from 'lucide-react-native';
import { I18nManager } from 'react-native';

import { useTranslation } from '@/utils/i18n';
import { useColorScheme, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { withRoleGuard } from '@/components/auth/withRoleGuard';

// Create role-protected screens
const PlantsScreen = withRoleGuard(Tabs.Screen, {
  allowedRoles: ['admin', 'grower', 'child'],
  showReadOnlyBanner: true
});

const TasksScreen = withRoleGuard(Tabs.Screen, {
  allowedRoles: ['admin', 'grower'],
  redirectTo: '/'
});

const InsightsScreen = withRoleGuard(Tabs.Screen, {
  allowedRoles: ['admin', 'grower', 'child'],
  showReadOnlyBanner: true
});

const SettingsScreen = withRoleGuard(Tabs.Screen, {
  allowedRoles: ['admin', 'grower'],
  redirectTo: '/'
});

const SensorRulesScreen = withRoleGuard(Tabs.Screen, {
  allowedRoles: ['admin', 'grower'],
  redirectTo: '/'
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const { userRole, loading } = useAuth();

  // Hide tabs completely based on role
  const showTasks = !loading && userRole !== 'child';
  const showSettings = !loading && userRole !== 'child';
  const showSensorRules = !loading && userRole !== 'child';

  if (loading) {
    // Return a minimal layout while loading user data
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: isDark ? '#888888' : '#666666',
          tabBarStyle: {
            backgroundColor: isDark ? '#121212' : '#FFFFFF',
            borderTopColor: isDark ? '#333333' : '#EEEEEE',
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home'),
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
            tabBarAccessibilityLabel: t('accessibility.homeTab'),
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: isDark ? '#888888' : '#666666',
        tabBarStyle: {
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          borderTopColor: isDark ? '#333333' : '#EEEEEE',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarAccessibilityLabel: t('accessibility.homeTab'),
        }}
      />
      <PlantsScreen
        name="plants"
        options={{
          title: t('tabs.plants'),
          tabBarIcon: ({ color, size }) => <Leaf size={size} color={color} />,
          tabBarAccessibilityLabel: t('accessibility.plantsTab'),
        }}
      />
      {showTasks && (
        <TasksScreen
          name="tasks"
          options={{
            title: t('tabs.tasks'),
            tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
            tabBarAccessibilityLabel: t('accessibility.tasksTab'),
          }}
        />
      )}
      <InsightsScreen
        name="insights"
        options={{
          title: t('tabs.insights'),
          tabBarIcon: ({ color, size }) => <Insights size={size} color={color} />,
          tabBarAccessibilityLabel: t('accessibility.insightsTab'),
        }}
      />
      {showSettings && (
        <SettingsScreen
          name="settings"
          options={{
            title: t('tabs.settings'),
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
            tabBarAccessibilityLabel: t('accessibility.settingsTab'),
          }}
        />
      )}
      {showSensorRules && (
        <SensorRulesScreen
          name="sensor-rules"
          options={{
            title: t('tabs.sensorRules'),
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
            tabBarAccessibilityLabel: t('accessibility.sensorRulesTab'),
          }}
        />
      )}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
    // Handle RTL layout for tab labels
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  }
});
