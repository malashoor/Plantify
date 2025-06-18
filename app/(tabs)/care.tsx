import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '../../src/utils/i18n';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from 'react-native';

export default function CareScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const tasks = [
    {
      id: 1,
      plantName: 'Monstera Deliciosa',
      type: 'water',
      description:
        'Water thoroughly and allow soil to dry out between waterings',
      completed: false,
    },
    {
      id: 2,
      plantName: 'Snake Plant',
      type: 'sunlight',
      description: 'Rotate to ensure even light exposure',
      completed: true,
    },
    {
      id: 3,
      plantName: 'Basil',
      type: 'fertilize',
      description: 'Apply balanced fertilizer',
      completed: false,
    },
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedMonth === today.getMonth() &&
      selectedYear === today.getFullYear()
    );
  };

  const isSelectedDay = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      selectedMonth === selectedDate.getMonth() &&
      selectedYear === selectedDate.getFullYear()
    );
  };

  const selectDay = (day: number) => {
    if (day) {
      setSelectedDate(new Date(selectedYear, selectedMonth, day));
    }
  };

  const previousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getCareIcon = (type: string) => {
    switch (type) {
      case 'water':
        return <Ionicons name="water" size={20} color="#2E7D32" />;
      case 'sunlight':
        return <Ionicons name="sunny" size={20} color="#2E7D32" />;
      case 'fertilize':
        return <Ionicons name="leaf" size={20} color="#2E7D32" />;
      default:
        return <Ionicons name="water" size={20} color="#2E7D32" />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>
          {t('care.title')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.calendarContainer, isDark && styles.cardDark]}>
          <View style={styles.monthSelector}>
            <TouchableOpacity
              onPress={previousMonth}
              style={styles.monthButton}
            >
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#333333'} />
            </TouchableOpacity>
            <Text style={[styles.monthYear, isDark && styles.textDark]}>
              {monthNames[selectedMonth]} {selectedYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthButton}>
              <Ionicons name="chevron-forward" size={24} color={isDark ? '#FFFFFF' : '#333333'} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDays}>
            {daysOfWeek.map((day, index) => (
              <Text
                key={index}
                style={[styles.weekDay, isDark && styles.textLightDark]}
              >
                {t(`care.days.${day.toLowerCase()}`)}
              </Text>
            ))}
          </View>

          <View style={styles.calendarDays}>
            {generateCalendarDays().map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isToday(day as number) && styles.todayCell,
                  isSelectedDay(day as number) && styles.selectedCell,
                  !day && styles.emptyCell,
                ]}
                onPress={() => day && selectDay(day as number)}
                disabled={!day}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday(day as number) && styles.todayText,
                    isSelectedDay(day as number) && styles.selectedDayText,
                    isDark &&
                      !isSelectedDay(day as number) &&
                      !isToday(day as number) &&
                      styles.textDark,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <Ionicons name="calendar" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
            <Text style={[styles.tasksSectionTitle, isDark && styles.textDark]}>
              {selectedDate.getDate()} {monthNames[selectedMonth]}{' '}
              {t('care.tasks')}
            </Text>
          </View>

          {tasks.map((task, index) => (
            <View
              key={index}
              style={[styles.taskCard, isDark && styles.cardDark]}
            >
              <View style={styles.taskIconContainer}>
                {getCareIcon(task.type)}
              </View>
              <View style={styles.taskDetails}>
                <Text style={[styles.taskTitle, isDark && styles.textDark]}>
                  {t(`care.taskTypes.${task.type}`)} - {task.plantName}
                </Text>
                <Text
                  style={[
                    styles.taskDescription,
                    isDark && styles.textLightDark,
                  ]}
                >
                  {task.description}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.taskCheckbox,
                  task.completed && styles.taskCompleted,
                ]}
              >
                {task.completed && <View style={styles.taskCheckboxInner} />}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  calendarContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Medium',
  },
  calendarDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 20,
  },
  emptyCell: {
    width: 40,
    height: 40,
  },
  todayCell: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
  },
  selectedCell: {
    backgroundColor: '#2E7D32',
  },
  dayText: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Poppins-Regular',
  },
  todayText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  tasksSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tasksSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
    fontFamily: 'Poppins-Bold',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCompleted: {
    backgroundColor: '#2E7D32',
  },
  taskCheckboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#AAAAAA',
  },
});
