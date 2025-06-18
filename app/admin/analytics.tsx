import { subDays, format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { View, StyleSheet, ScrollView, Share, Text, useColorScheme } from 'react-native';

import { ChartPanel } from '../../src/components/admin/ChartPanel';
import { FilterControls } from '../../src/components/admin/FilterControls';
import { StatCard } from '../../src/components/admin/StatCard';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { useAuth } from '../../src/hooks/useAuth';

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
    grey3: colorScheme === 'dark' ? '#FFFFFF' : '#333333',
    error: '#F44336',
  },
});

export default function AnalyticsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const { user, isAdmin } = useAuth();
  const { loading, error, data, fetchAnalytics, exportToCSV } = useAnalytics();

  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
      return;
    }
    fetchAnalytics(startDate, endDate);
  }, [isAdmin, startDate, endDate]);

  const handleExport = async () => {
    const csvContent = await exportToCSV();
    if (csvContent) {
      await Share.share({
        message: csvContent,
        title: 'Analytics Export',
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.error }}>Error: {error}</Text>
      </View>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.colors.grey3 }]} accessibilityRole="header">
        Analytics Dashboard
      </Text>

      <FilterControls
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={() => fetchAnalytics(startDate, endDate)}
        onExport={handleExport}
      />

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={data.accessibility.total_users}
          accessibilityLabel={`Total users: ${data.accessibility.total_users}`}
        />
        <StatCard
          title="Voice Users"
          value={data.accessibility.voice_users}
          subtitle={`${Math.round((data.accessibility.voice_users / data.accessibility.total_users) * 100)}%`}
          accessibilityLabel={`Voice users: ${data.accessibility.voice_users}, ${Math.round((data.accessibility.voice_users / data.accessibility.total_users) * 100)}% of total`}
        />
        <StatCard
          title="Dark Mode Users"
          value={data.accessibility.dark_mode_users}
          subtitle={`${Math.round((data.accessibility.dark_mode_users / data.accessibility.total_users) * 100)}%`}
          accessibilityLabel={`Dark mode users: ${data.accessibility.dark_mode_users}, ${Math.round((data.accessibility.dark_mode_users / data.accessibility.total_users) * 100)}% of total`}
        />
      </View>

      <ChartPanel
        title="Weekly Journal Entries"
        type="line"
        data={data.weekly_journals.map(j => ({
          x: format(new Date(j.week), 'MMM d'),
          y: j.entry_count,
        }))}
        xKey="x"
        yKey="y"
        accessibilityLabel="Line chart showing weekly journal entries"
      />

      <ChartPanel
        title="Most Common Seed Types"
        type="bar"
        data={data.common_seeds.map(s => ({
          x: s.name,
          y: s.instance_count,
        }))}
        xKey="x"
        yKey="y"
        accessibilityLabel="Bar chart showing most common seed types"
      />

      <ChartPanel
        title="Reminder Triggers"
        type="pie"
        data={data.reminders.map(r => ({
          x: r.reminder_type,
          y: r.trigger_count,
        }))}
        xKey="x"
        yKey="y"
        accessibilityLabel="Pie chart showing reminder triggers by type"
      />

      <ChartPanel
        title="Daily Health Scans"
        type="line"
        data={data.health_scans.map(s => ({
          x: format(new Date(s.scan_date), 'MMM d'),
          y: s.scan_count,
        }))}
        xKey="x"
        yKey="y"
        accessibilityLabel="Line chart showing daily health scans"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
});
