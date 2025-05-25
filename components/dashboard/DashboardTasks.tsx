import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Colors } from '@/theme/colors';
import { Spacing } from '@/theme/spacing';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { useTasks } from '@/hooks/useTasks';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';

type Task = {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  dueDate?: string;
};

type DashboardTasksProps = {
  onTaskPress?: (taskId: string) => void;
  onViewAllPress?: () => void;
  testID?: string;
};

export const DashboardTasks = ({
  onTaskPress,
  onViewAllPress,
  testID,
}: DashboardTasksProps) => {
  const { t } = useTranslation();
  const { data: tasks, isLoading, error, refetch } = useTasks();

  if (isLoading) {
    return <LoadingState message={t('tasks.loading')} />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (!tasks?.length) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          {t('tasks.empty')}
        </Text>
        <Button
          variant="primary"
          onPress={onViewAllPress}
          accessibilityLabel={t('tasks.addFirstTask')}
          accessibilityHint={t('tasks.addFirstTaskHint')}
        >
          {t('tasks.addFirstTask')}
        </Button>
      </Card>
    );
  }

  const renderTask = ({ item }: { item: Task }) => (
    <Card
      style={styles.taskCard}
      onPress={() => onTaskPress?.(item.id)}
      accessibilityLabel={`${item.title}, ${item.status}`}
      accessibilityHint={t('tasks.pressToViewDetails')}
      testID={`task-${item.id}`}
    >
      <View style={styles.taskContent}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>
            {item.title}
          </Text>
          {item.dueDate && (
            <Text style={styles.taskDueDate}>
              {item.dueDate}
            </Text>
          )}
        </View>
        <View style={styles.taskStatus}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: item.status === 'completed' ? Colors.Indicator.Success : Colors.Indicator.Warning }
            ]}
          />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('tasks.title')}
        </Text>
        <Button
          variant="text"
          onPress={onViewAllPress}
          accessibilityLabel={t('tasks.viewAll')}
          accessibilityHint={t('tasks.viewAllHint')}
        >
          <View style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>
              {t('tasks.viewAll')}
            </Text>
            <ChevronRight size={16} color={Colors.Text.Primary} />
          </View>
        </Button>
      </View>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  list: {
    paddingBottom: Spacing.MD,
  },
  taskCard: {
    marginBottom: Spacing.SM,
    minHeight: 44, // Ensure minimum touch target size
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: Colors.Text.Primary,
    marginBottom: Spacing.XS,
  },
  taskDueDate: {
    fontSize: 14,
    color: Colors.Text.Secondary,
  },
  taskStatus: {
    marginLeft: Spacing.MD,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyCard: {
    padding: Spacing.LG,
    alignItems: 'center',
  },
  emptyText: {
    marginBottom: Spacing.MD,
    textAlign: 'center',
    color: Colors.Text.Secondary,
  },
}); 