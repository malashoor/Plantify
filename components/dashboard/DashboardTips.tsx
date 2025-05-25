import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { usePlantTips } from '@/hooks/usePlantTips';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Lightbulb } from 'lucide-react-native';

type PlantTip = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
};

type DashboardTipsProps = {
  onTipPress?: (tipId: string) => void;
  onViewAllPress?: () => void;
  testID?: string;
};

export const DashboardTips = ({
  onTipPress,
  onViewAllPress,
  testID,
}: DashboardTipsProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: tips, isLoading, error, refetch } = usePlantTips();

  if (isLoading) {
    return <LoadingState message={t('tips.loading', { defaultValue: 'Loading tips...' })} />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (!tips?.length) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          {t('tips.noTips', { defaultValue: 'No tips available' })}
        </Text>
      </Card>
    );
  }

  const renderTip = (tip: PlantTip): JSX.Element => (
    <Card
      key={tip.id}
      style={styles.tipCard}
      onPress={() => onTipPress?.(tip.id)}
      accessibilityLabel={t('tips.viewTip', { title: tip.title, defaultValue: 'View tip: {{title}}' })}
      accessibilityHint={t('tips.viewTipHint', { defaultValue: 'Press to view tip details' })}
      testID={`tip-${tip.id}`}
    >
      <View style={styles.tipContent}>
        <View style={styles.tipIcon}>
          <Lightbulb size={24} color={Colors.Primary} />
        </View>
        <View style={styles.tipInfo}>
          <Text style={styles.tipTitle}>
            {tip.title}
          </Text>
          <Text style={styles.tipCategory}>
            {tip.category}
          </Text>
          <Text style={styles.tipDescription} numberOfLines={2}>
            {tip.content}
          </Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('tips.title', { defaultValue: 'Plant Tips' })}
        </Text>
        <Button
          variant="text"
          onPress={onViewAllPress}
          accessibilityLabel={t('tips.viewAll', { defaultValue: 'View all tips' })}
          accessibilityHint={t('tips.viewAllHint', { defaultValue: 'View all plant care tips' })}
        >
          <View style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>
              {t('tips.viewAll', { defaultValue: 'View All' })}
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
        {tips.map(renderTip)}
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
  tipCard: {
    marginBottom: Spacing.SM,
    minHeight: 44, // Ensure minimum touch target size
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: Spacing.MD,
    paddingTop: Spacing.XS,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.Text.Primary,
    marginBottom: Spacing.XS,
  },
  tipCategory: {
    fontSize: 14,
    color: Colors.Primary,
    marginBottom: Spacing.XS,
  },
  tipDescription: {
    fontSize: 14,
    color: Colors.Text.Secondary,
    lineHeight: 20,
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