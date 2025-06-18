import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { withPremiumAccess } from '../premium/withPremiumAccess';
import { useProtectedFeature } from '../../hooks/useProtectedFeature';

interface CalculationResult {
  ppfd: number;
  dli: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

function AdvancedCalculatorBase() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [results, setResults] = useState<CalculationResult | null>(null);

  const { protectedAction } = useProtectedFeature({
    featureId: 'advancedCalculator',
  });

  const handleCalculate = protectedAction(async () => {
    // Advanced calculation logic here
    const calculatedResults: CalculationResult = {
      ppfd: 450,
      dli: 25.9,
      nutrients: {
        nitrogen: 150,
        phosphorus: 50,
        potassium: 150,
      },
    };
    setResults(calculatedResults);
  });

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          {t('tools.calculator.ppfd')}
        </Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder={t('tools.calculator.height')}
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder={t('tools.calculator.watts')}
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
          {t('tools.calculator.nutrients')}
        </Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder={t('tools.calculator.plantType')}
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
          <TextInput
            style={[styles.input, isDark && styles.inputDark]}
            placeholder={t('tools.calculator.growthStage')}
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.calculateButton, isDark && styles.calculateButtonDark]}
        onPress={handleCalculate}
      >
        <Ionicons 
          name="calculator-outline" 
          size={20} 
          color="#FFFFFF" 
        />
        <Text style={styles.calculateButtonText}>
          {t('tools.calculator.calculate')}
        </Text>
      </TouchableOpacity>

      {results && (
        <View style={[styles.results, isDark && styles.resultsDark]}>
          <Text style={[styles.resultsTitle, isDark && styles.textDark]}>
            {t('tools.calculator.results')}
          </Text>
          
          <View style={styles.resultItem}>
            <Text style={[styles.resultLabel, isDark && styles.textLightDark]}>PPFD:</Text>
            <Text style={[styles.resultValue, isDark && styles.textDark]}>
              {results.ppfd} μmol/m²/s
            </Text>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={[styles.resultLabel, isDark && styles.textLightDark]}>DLI:</Text>
            <Text style={[styles.resultValue, isDark && styles.textDark]}>
              {results.dli} mol/m²/day
            </Text>
          </View>

          <View style={styles.nutrientResults}>
            <Text style={[styles.resultLabel, isDark && styles.textLightDark]}>
              {t('tools.calculator.recommendedNutrients')}:
            </Text>
            <View style={styles.nutrientItem}>
              <Text style={[styles.nutrientLabel, isDark && styles.textLightDark]}>N:</Text>
              <Text style={[styles.nutrientValue, isDark && styles.textDark]}>
                {results.nutrients.nitrogen} ppm
              </Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={[styles.nutrientLabel, isDark && styles.textLightDark]}>P:</Text>
              <Text style={[styles.nutrientValue, isDark && styles.textDark]}>
                {results.nutrients.phosphorus} ppm
              </Text>
            </View>
            <View style={styles.nutrientItem}>
              <Text style={[styles.nutrientLabel, isDark && styles.textLightDark]}>K:</Text>
              <Text style={[styles.nutrientValue, isDark && styles.textDark]}>
                {results.nutrients.potassium} ppm
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#1F2937',
    color: '#F3F4F6',
  },
  calculateButton: {
    backgroundColor: '#45B36B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  calculateButtonDark: {
    backgroundColor: '#A3E635',
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsDark: {
    backgroundColor: '#1F2937',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  nutrientResults: {
    marginTop: 16,
    gap: 8,
  },
  nutrientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nutrientLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 24,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  textDark: {
    color: '#F3F4F6',
  },
  textLightDark: {
    color: '#9CA3AF',
  },
});

// Wrap with premium access protection
export const AdvancedCalculator = withPremiumAccess(AdvancedCalculatorBase, {
  featureId: 'advancedCalculator',
  variant: 'overlay',
}); 