import { ThemeProvider, Text, Button, Card, Icon } from '@rneui/themed';
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Theme configuration
const theme = {
  light: {
    mode: 'light',
    colors: {
      primary: '#4CAF50',
      secondary: '#8BC34A',
      background: '#FFFFFF',
      text: '#212121',
      card: '#F5F5F5',
      border: '#E0E0E0',
    },
  },
  dark: {
    mode: 'dark',
    colors: {
      primary: '#81C784',
      secondary: '#AED581',
      background: '#121212',
      text: '#FFFFFF',
      card: '#1E1E1E',
      border: '#333333',
    },
  },
};

// Mockup Generator Component
const MockupGenerator: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Home Screen
  const HomeScreen = () => (
    <View style={[styles.screen, { backgroundColor: currentTheme.colors.background }]}>
      <Text h4 style={[styles.title, { color: currentTheme.colors.text }]}>
        Welcome to Plantify
      </Text>
      <Card containerStyle={[styles.card, { backgroundColor: currentTheme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: currentTheme.colors.text }]}>
          Your Garden Overview
        </Text>
        <View style={styles.statsContainer}>
          <StatItem icon="seed" label="Active Seeds" value="12" />
          <StatItem icon="leaf" label="Growing" value="8" />
          <StatItem icon="flower" label="Ready" value="4" />
        </View>
      </Card>
    </View>
  );

  // Growth Timeline Screen
  const GrowthTimelineScreen = () => (
    <View style={[styles.screen, { backgroundColor: currentTheme.colors.background }]}>
      <Text h4 style={[styles.title, { color: currentTheme.colors.text }]}>
        Growth Timeline
      </Text>
      <View style={styles.timeline}>
        <TimelineItem stage="Seed" progress={100} />
        <TimelineItem stage="Germination" progress={75} />
        <TimelineItem stage="Seedling" progress={50} />
        <TimelineItem stage="Vegetative" progress={25} />
        <TimelineItem stage="Flowering" progress={0} />
      </View>
    </View>
  );

  // Health Analyzer Screen
  const HealthAnalyzerScreen = () => (
    <View style={[styles.screen, { backgroundColor: currentTheme.colors.background }]}>
      <Text h4 style={[styles.title, { color: currentTheme.colors.text }]}>
        Health Analysis
      </Text>
      <Card containerStyle={[styles.card, { backgroundColor: currentTheme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: currentTheme.colors.text }]}>
          Plant Health Status
        </Text>
        <View style={styles.healthMetrics}>
          <HealthMetric label="Overall Health" value="Good" />
          <HealthMetric label="Water Level" value="Optimal" />
          <HealthMetric label="Nutrients" value="Balanced" />
        </View>
      </Card>
    </View>
  );

  // Journal Entry Screen
  const JournalEntryScreen = () => (
    <View style={[styles.screen, { backgroundColor: currentTheme.colors.background }]}>
      <Text h4 style={[styles.title, { color: currentTheme.colors.text }]}>
        New Journal Entry
      </Text>
      <Card containerStyle={[styles.card, { backgroundColor: currentTheme.colors.card }]}>
        <View style={styles.journalTools}>
          <Icon name="camera" type="material" size={24} color={currentTheme.colors.primary} />
          <Icon name="mic" type="material" size={24} color={currentTheme.colors.primary} />
          <Icon name="mood" type="material" size={24} color={currentTheme.colors.primary} />
        </View>
        <Text style={[styles.placeholder, { color: currentTheme.colors.text }]}>
          Write your notes here...
        </Text>
      </Card>
    </View>
  );

  // Reminders Dashboard Screen
  const RemindersDashboardScreen = () => (
    <View style={[styles.screen, { backgroundColor: currentTheme.colors.background }]}>
      <Text h4 style={[styles.title, { color: currentTheme.colors.text }]}>
        Care Reminders
      </Text>
      <View style={styles.reminderList}>
        <ReminderItem task="Water Tomatoes" time="2:00 PM" />
        <ReminderItem task="Fertilize Basil" time="3:30 PM" />
        <ReminderItem task="Check pH Levels" time="5:00 PM" />
      </View>
    </View>
  );

  // Admin Analytics Screen
  const AdminAnalyticsScreen = () => (
    <View style={[styles.screen, { backgroundColor: currentTheme.colors.background }]}>
      <Text h4 style={[styles.title, { color: currentTheme.colors.text }]}>
        Analytics Dashboard
      </Text>
      <View style={styles.analyticsGrid}>
        <AnalyticsCard title="Active Users" value="1,234" />
        <AnalyticsCard title="Total Plants" value="5,678" />
        <AnalyticsCard title="Health Scans" value="9,012" />
        <AnalyticsCard title="Journal Entries" value="3,456" />
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={currentTheme}>
        <View style={styles.container}>
          <Button
            title="Toggle Theme"
            onPress={() => setIsDarkMode(!isDarkMode)}
            containerStyle={styles.themeToggle}
          />
          <HomeScreen />
          <GrowthTimelineScreen />
          <HealthAnalyzerScreen />
          <JournalEntryScreen />
          <RemindersDashboardScreen />
          <AdminAnalyticsScreen />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

// Helper Components
const StatItem = ({ icon, label, value }) => (
  <View style={styles.statItem}>
    <Icon name={icon} type="material-community" size={24} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const TimelineItem = ({ stage, progress }) => (
  <View style={styles.timelineItem}>
    <View style={[styles.progressBar, { width: `${progress}%` }]} />
    <Text style={styles.timelineStage}>{stage}</Text>
  </View>
);

const HealthMetric = ({ label, value }) => (
  <View style={styles.healthMetric}>
    <Text style={styles.healthLabel}>{label}</Text>
    <Text style={styles.healthValue}>{value}</Text>
  </View>
);

const ReminderItem = ({ task, time }) => (
  <View style={styles.reminderItem}>
    <Text style={styles.reminderTask}>{task}</Text>
    <Text style={styles.reminderTime}>{time}</Text>
  </View>
);

const AnalyticsCard = ({ title, value }) => (
  <Card containerStyle={styles.analyticsCard}>
    <Text style={styles.analyticsTitle}>{title}</Text>
    <Text style={styles.analyticsValue}>{value}</Text>
  </Card>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  timeline: {
    marginTop: 20,
  },
  timelineItem: {
    height: 40,
    marginBottom: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  timelineStage: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
  healthMetrics: {
    marginTop: 10,
  },
  healthMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  healthLabel: {
    fontSize: 16,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  journalTools: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  reminderList: {
    marginTop: 20,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reminderTask: {
    fontSize: 16,
  },
  reminderTime: {
    fontSize: 16,
    color: '#666',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: '48%',
    marginBottom: 10,
  },
  analyticsTitle: {
    fontSize: 14,
    color: '#666',
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeToggle: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
});

export default MockupGenerator; 