import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useWateringGuides } from '../hooks/useWateringGuides';
import { useTreatmentGuides } from '../hooks/useTreatmentGuides';
import { useFertilizationGuides } from '../hooks/useFertilizationGuides';
import { useGrowthData } from '../hooks/useGrowthData';
import { useReminders } from '../hooks/useReminders';
import { Section } from '../components/Section';
import { GuideCard } from '../components/GuideCard';
import { GrowthChart } from '../components/GrowthChart';

// Simple theme helper
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    background: colorScheme === 'dark' ? '#1E1E1E' : '#F5F5F5',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
  }
});

// Custom Button Component
const Button = ({ 
  onPress, 
  children, 
  style 
}: { 
  onPress: () => void; 
  children: React.ReactNode;
  style?: any;
}) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.primary }, style]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </TouchableOpacity>
  );
};

export function PlantCareScreen() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const watering = useWateringGuides();
  const treatment = useTreatmentGuides();
  const fertilization = useFertilizationGuides();
  const { growthData, isLoading: isGrowthLoading } = useGrowthData('plant-123');
  const { addReminder } = useReminders();

  const handleScheduleFertilization = async () => {
    try {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      await addReminder({
        title: 'Fertilize Plants',
        description: 'Time to fertilize your plants for healthy growth',
        time: nextWeek,
        frequency: 'once',
        isCompleted: false,
        category: 'fertilizing',
        isActive: true,
      });
    } catch (error) {
      console.error('Failed to schedule fertilization reminder:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <Section title="Growth History" theme={theme}>
          {!isGrowthLoading && growthData.length > 0 && (
            <GrowthChart data={growthData[0].data} theme={theme} />
          )}
        </Section>

        <Section title="Watering Guides" theme={theme}>
          {watering.isLoading ? (
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading watering guides...</Text>
          ) : (
            watering.guides.map((guide, index) => (
              <GuideCard 
                key={`watering-${guide.plantId}-${index}`} 
                guide={{
                  id: `watering-${guide.plantId}`,
                  title: guide.plantName || `Plant ${guide.plantId}`,
                  description: `Schedule: ${guide.schedule}`,
                  severity: 'low' as const,
                  category: 'watering' as const
                }} 
                theme={theme} 
              />
            ))
          )}
        </Section>

        <Section title="Treatment Plans" theme={theme}>
          {treatment.isLoading ? (
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading treatment guides...</Text>
          ) : (
            treatment.guides.map((guide, index) => (
              <GuideCard 
                key={`treatment-${guide.id || index}`} 
                guide={guide} 
                theme={theme} 
              />
            ))
          )}
        </Section>

        <Section title="Fertilization & Minerals" theme={theme}>
          {fertilization.isLoading ? (
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading fertilization guides...</Text>
          ) : (
            <>
              {fertilization.guides.map((guide, index) => (
                <GuideCard 
                  key={`fertilization-${guide.id || index}`} 
                  guide={guide} 
                  theme={theme} 
                />
              ))}
              <Button
                onPress={handleScheduleFertilization}
                style={styles.scheduleButton}
              >
                Remind me to fertilize next week
              </Button>
            </>
          )}
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleButton: {
    marginHorizontal: 16,
  },
});

// Add default export for React Navigation
export default PlantCareScreen;