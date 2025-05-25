import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useTranslation } from 'react-i18next';
import { ChevronRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react-native';

type HealthItem = {
  id: string;
  title: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: string;
};

type DashboardHealthProps = {
  onItemPress?: (itemId: string) => void;
  onViewAllPress?: () => void;
  testID?: string;
};

export const DashboardHealth = ({
  onItemPress,
  onViewAllPress,
  testID,
}: DashboardHealthProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: healthItems, isLoading, error, refetch } = useSystemHealth();

  if (isLoading) {
    return <LoadingState message={t('health.loading', { defaultValue: 'Loading health data...' })} />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (!healthItems?.length) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          {t('health.noData', { defaultValue: 'No health data available' })}
        </Text>
      </Card>
    );
  }

  const getStatusIcon = (status: HealthItem['status']): JSX.Element => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 size={20} color={Colors.Indicator.Success} />;
      case 'warning':
        return <AlertCircle size={20} color={Colors.Indicator.Warning} />;
      case 'error':
        return <XCircle size={20} color={Colors.Indicator.Error} />;
    }
  };

  const renderHealthItem = (item: HealthItem): JSX.Element => (
    <Card
      key={item.id}
      style={styles.healthCard}
      onPress={() => onItemPress?.(item.id)}
      accessibilityLabel={`${item.title}, ${item.status}`}
      accessibilityHint={t('health.pressToViewDetails', { defaultValue: 'Press to view details' })}
      testID={`health-${item.id}`}
    >
      <View style={styles.healthContent}>
        <View style={styles.healthInfo}>
          <Text style={styles.healthTitle}>
            {item.title}
          </Text>
          <Text style={styles.healthMessage}>
            {item.message}
          </Text>
          <Text style={styles.healthLastChecked}>
            {t('health.lastChecked', { time: item.lastChecked, defaultValue: 'Last checked: {{time}}' })}
          </Text>
        </View>
        <View style={styles.healthStatus}>
          {getStatusIcon(item.status)}
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('health.title', { defaultValue: 'Plant Health' })}
        </Text>
        <Button
          variant="text"
          onPress={onViewAllPress}
          accessibilityLabel={t('health.viewAll', { defaultValue: 'View all health data' })}
          accessibilityHint={t('health.viewAllHint', { defaultValue: 'View all plant health data' })}
        >
          <View style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>
              {t('health.viewAll', { defaultValue: 'View All' })}
            </Text>
            <ChevronRight size={16} color={Colors.Text.Primary} />
          </View>
        </Button>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {healthItems.map(renderHealthItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.MD,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.Text.Primary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: Colors.Text.Primary,
    marginRight: Spacing.XS,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.MD,
  },
  healthCard: {
    marginBottom: Spacing.SM,
    minHeight: 44, // Ensure minimum touch target size
  },
  healthContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  healthInfo: {
    flex: 1,
    marginRight: Spacing.MD,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Text.Primary,
    marginBottom: Spacing.XS,
  },
  healthMessage: {
    fontSize: 14,
    color: Colors.Text.Secondary,
    marginBottom: Spacing.XS,
  },
  healthLastChecked: {
    fontSize: 12,
    color: Colors.Text.Secondary,
  },
  healthStatus: {
    paddingTop: Spacing.XS,
  },
  emptyCard: {
    padding: Spacing.LG,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.Text.Secondary,
  },
}); 