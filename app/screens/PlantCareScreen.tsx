import React from 'react';
import {
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useWateringGuides } from '@/hooks/useWateringGuides';
import { useTreatmentGuides } from '@/hooks/useTreatmentGuides';
import { useFertilizationGuides } from '@/hooks/useFertilizationGuides';
import { useGrowthData } from '@/hooks/useGrowthData';
import { useReminders } from '@/hooks/useReminders';
import { Section } from '@/components/Section';
import { GuideCard } from '@/components/GuideCard';
import { GrowthChart } from '@/components/GrowthChart';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/theme';

export function PlantCareScreen() {
  const watering = useWateringGuides();
  const treatment = useTreatmentGuides();
  const fertilization = useFertilizationGuides();
  const { data: growthData, isLoading: isGrowthLoading } = useGrowthData('plant-123');
  const { scheduleFertilization } = useReminders();

  const handleScheduleFertilization = async () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    await scheduleFertilization('plant-123', nextWeek);
  };

  return (
    <ScrollView style={styles.container}>
      <Section title="Growth History">
        {!isGrowthLoading && growthData.length > 0 && (
          <GrowthChart data={growthData} />
        )}
      </Section>

      <Section title="Watering Guides">
        {watering.isLoading ? (
          <Text>Loading watering guides...</Text>
        ) : (
          watering.guides.map(guide => (
            <GuideCard key={guide.id} guide={guide} />
          ))
        )}
      </Section>

      <Section title="Treatment Plans">
        {treatment.isLoading ? (
          <Text>Loading treatment guides...</Text>
        ) : (
          treatment.guides.map(guide => (
            <GuideCard key={guide.id} guide={guide} />
          ))
        )}
      </Section>

      <Section title="Fertilization & Minerals">
        {fertilization.isLoading ? (
          <Text>Loading fertilization guides...</Text>
        ) : (
          <>
            {fertilization.guides.map(guide => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
            <Button
              onPress={handleScheduleFertilization}
              style={styles.button}
            >
              Remind me to fertilize next week
            </Button>
          </>
        )}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  button: {
    marginTop: Spacing.M,
  } as ViewStyle,
}); 