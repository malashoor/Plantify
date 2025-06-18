import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '../../hooks/useColorScheme';
import { useTranslation } from '../../src/utils/i18n';
import OfflineNotice from '../../src/components/OfflineNotice';

type TaskItem = {
  id: string;
  title: string;
  dueDate: string;
  plantId?: string;
  plantName?: string;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
};

export default function TasksScreen() {
  const { t } = useTranslation();
  const { isDark } = useColorScheme();
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Sample data
      setTasks([
        {
          id: '1',
          title: 'Water Snake Plant',
          dueDate: '2023-05-15',
          plantName: 'Snake Plant',
          isCompleted: false,
          priority: 'high',
        },
        {
          id: '2',
          title: 'Fertilize Monstera',
          dueDate: '2023-05-16',
          plantName: 'Monstera',
          isCompleted: false,
          priority: 'medium',
        },
        {
          id: '3',
          title: 'Prune Basil',
          dueDate: '2023-05-17',
          plantName: 'Basil',
          isCompleted: true,
          priority: 'low',
        },
        {
          id: '4',
          title: 'Check soil moisture',
          dueDate: '2023-05-18',
          plantName: 'Fiddle Leaf Fig',
          isCompleted: false,
          priority: 'medium',
        },
        {
          id: '5',
          title: 'Repot Aloe Vera',
          dueDate: '2023-05-19',
          plantName: 'Aloe Vera',
          isCompleted: false,
          priority: 'high',
        },
        {
          id: '6',
          title: 'Mist Orchid',
          dueDate: '2023-05-20',
          plantName: 'Orchid',
          isCompleted: false,
          priority: 'low',
        },
        {
          id: '7',
          title: 'Rotate plants',
          dueDate: '2023-05-21',
          plantName: 'All Plants',
          isCompleted: false,
          priority: 'medium',
        },
        {
          id: '8',
          title: 'Check for pests',
          dueDate: '2023-05-22',
          plantName: 'All Plants',
          isCompleted: false,
          priority: 'high',
        },
        {
          id: '9',
          title: 'Take progress photos',
          dueDate: '2023-05-23',
          plantName: 'All Plants',
          isCompleted: false,
          priority: 'low',
        },
        {
          id: '10',
          title: 'Clean plant leaves',
          dueDate: '2023-05-24',
          plantName: 'Rubber Plant',
          isCompleted: false,
          priority: 'medium',
        },
      ]);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadTasks();
  }, [loadTasks]);

  const markTaskComplete = useCallback((taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  }, []);

  const handleAddTask = () => {
    router.push('/add-task');
  };

  const renderTaskItem = useCallback(
    ({ item }: { item: TaskItem }) => (
      <View
        style={[
          styles.taskItem,
          isDark && styles.taskItemDark,
          item.isCompleted && styles.taskCompleted,
        ]}
        testID={`task-item-${item.id}`}
      >
        <TouchableOpacity
          style={[
            styles.checkboxContainer,
            item.isCompleted && styles.checkboxChecked,
            !item.isCompleted && {
              borderColor:
                item.priority === 'high'
                  ? '#E53935'
                  : item.priority === 'medium'
                    ? '#FB8C00'
                    : '#7CB342',
            },
          ]}
          onPress={() => markTaskComplete(item.id)}
          accessibilityLabel={
            item.isCompleted
              ? t('accessibility.markTaskIncomplete', 'Mark task as incomplete')
              : t('accessibility.markTaskComplete', 'Mark task as complete')
          }
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.isCompleted }}
        >
          {item.isCompleted && <Check size={16} color="#fff" />}
        </TouchableOpacity>

        <View style={styles.taskContent}>
          <Text
            style={[
              styles.taskTitle,
              isDark && styles.textDark,
              item.isCompleted && styles.taskCompletedText,
            ]}
            numberOfLines={1}
            accessibilityLabel={item.title}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.taskSubtitle, isDark && styles.textLightDark]}
            accessibilityLabel={`For ${item.plantName}`}
          >
            {item.plantName}
          </Text>
        </View>

        <View style={styles.taskMeta}>
          <View style={styles.dueDateContainer}>
            <Clock size={14} color={isDark ? '#AAAAAA' : '#666666'} />
            <Text
              style={[styles.dueDate, isDark && styles.textLightDark]}
              accessibilityLabel={`Due on ${item.dueDate}`}
            >
              {item.dueDate}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.detailsButton, isDark && styles.detailsButtonDark]}
            onPress={() => router.push(`/tasks/${item.id}`)}
            accessibilityLabel={t('accessibility.viewTaskDetails', 'View task details')}
            accessibilityRole="button"
          >
            <ChevronRight size={16} color={isDark ? '#FFFFFF' : '#333333'} />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [isDark, markTaskComplete, router, t]
  );

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.containerDark]}
      edges={['top', 'left', 'right']}
    >
      <OfflineNotice />

      <View style={styles.header}>
        <View>
          <Text style={[styles.screenTitle, isDark && styles.textDark]} accessibilityRole="header">
            {t('tasks.title', 'My Tasks')}
          </Text>
          <Text
            style={[styles.taskCount, isDark && styles.textLightDark]}
            accessibilityLabel={t(
              'tasks.countDescription',
              `${tasks.filter(t => !t.isCompleted).length} tasks remaining`
            )}
          >
            {t('tasks.count', '{{count}} remaining', {
              count: tasks.filter(t => !t.isCompleted).length,
            })}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, isDark && styles.addButtonDark]}
          onPress={handleAddTask}
          accessibilityLabel={t('accessibility.addNewTask', 'Add new task')}
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>{t('tasks.addNew', 'Add Task')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, styles.activeFilter]}
          accessibilityRole="button"
          accessibilityState={{ selected: true }}
        >
          <Text style={styles.activeFilterText}>{t('tasks.filters.all', 'All')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          accessibilityRole="button"
          accessibilityState={{ selected: false }}
        >
          <Text style={[styles.filterText, isDark && styles.textLightDark]}>
            {t('tasks.filters.today', 'Today')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          accessibilityRole="button"
          accessibilityState={{ selected: false }}
        >
          <Text style={[styles.filterText, isDark && styles.textLightDark]}>
            {t('tasks.filters.upcoming', 'Upcoming')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          accessibilityRole="button"
          accessibilityState={{ selected: false }}
        >
          <Text style={[styles.filterText, isDark && styles.textLightDark]}>
            {t('tasks.filters.completed', 'Completed')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={tasks}
        renderItem={renderTaskItem}
        estimatedItemSize={88}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor={isDark ? '#4CAF50' : '#2E7D32'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar size={64} color={isDark ? '#4CAF50' : '#2E7D32'} />
            <Text style={[styles.emptyTitle, isDark && styles.textDark]}>
              {t('tasks.empty.title', 'No Tasks Yet')}
            </Text>
            <Text style={[styles.emptyDescription, isDark && styles.textLightDark]}>
              {t(
                'tasks.empty.description',
                'Add your first task to start tracking your plant care routine'
              )}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddTask}
              accessibilityLabel={t('accessibility.addFirstTask', 'Add your first task')}
              accessibilityRole="button"
            >
              <Text style={styles.emptyButtonText}>
                {t('tasks.empty.button', 'Add First Task')}
              </Text>
            </TouchableOpacity>
          </View>
        }
        onEndReachedThreshold={0.1}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  taskCount: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  addButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonDark: {
    backgroundColor: '#4CAF50',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 16,
  },
  activeFilter: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  activeFilterText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskItemDark: {
    backgroundColor: '#1E1E1E',
  },
  taskCompleted: {
    opacity: 0.7,
  },
  checkboxContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'Poppins-Medium',
  },
  taskSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  taskCompletedText: {
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    alignItems: 'flex-end',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  detailsButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonDark: {
    backgroundColor: '#333333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  emptyButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#AAAAAA',
  },
});
