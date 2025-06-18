import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Speech from 'expo-speech';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import {
  NutrientCalculatorState,
  Crop,
  CropStage,
  NutrientRecipe,
  NutrientCalculation,
  CalculationResult,
  UnitSystem,
  SavedRecipe,
  VoiceFeedback,
  COMMON_NUTRIENTS,
  COMMON_CROP_STAGES,
} from '@/types/nutrient-calculator';

const STORAGE_KEYS = {
  SAVED_RECIPES: 'nutrient_saved_recipes',
  UNIT_SYSTEM: 'nutrient_unit_system',
  VOICE_SETTINGS: 'nutrient_voice_settings',
  OFFLINE_DATA: 'nutrient_offline_data',
};

export const useNutrientCalculator = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [state, setState] = useState<NutrientCalculatorState>({
    selectedCrop: null,
    selectedStage: null,
    selectedRecipe: null,
    unitSystem: {
      type: 'metric',
      volume: 'L',
      weight: 'g',
      concentration: 'ppm',
    },
    waterVolume: 10, // Default 10 liters
    calculations: null,
    isLoading: false,
    error: null,
    isOffline: false,
    savedRecipes: [],
    voiceEnabled: true,
    voiceLanguage: i18n.language as 'en' | 'ar',
    voiceRate: 1.0,
  });

  // Network status monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(netState => {
      setState(prev => ({
        ...prev,
        isOffline: !netState.isConnected,
      }));
    });

    return unsubscribe;
  }, []);

  // Load saved data on init
  useEffect(() => {
    loadSavedData();
  }, []);

  // Update voice language when i18n changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      voiceLanguage: i18n.language as 'en' | 'ar',
    }));
  }, [i18n.language]);

  const loadSavedData = async () => {
    try {
      const [savedRecipes, unitSystem, voiceSettings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_RECIPES),
        AsyncStorage.getItem(STORAGE_KEYS.UNIT_SYSTEM),
        AsyncStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS),
      ]);

      setState(prev => ({
        ...prev,
        savedRecipes: savedRecipes ? JSON.parse(savedRecipes) : [],
        unitSystem: unitSystem ? JSON.parse(unitSystem) : prev.unitSystem,
        ...(voiceSettings ? JSON.parse(voiceSettings) : {}),
      }));
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  // Formula conversions (ppm to g)
  const convertPpmToGrams = useCallback((ppm: number, waterVolume: number): number => {
    // PPM = (grams of solute / grams of solution) × 1,000,000
    // For dilute solutions, 1L water ≈ 1000g
    // grams = (ppm × volume_in_liters × 1000) / 1,000,000
    return (ppm * waterVolume * 1000) / 1_000_000;
  }, []);

  const convertGramsToPpm = useCallback((grams: number, waterVolume: number): number => {
    return (grams * 1_000_000) / (waterVolume * 1000);
  }, []);

  // Unit conversions (metric/imperial)
  const convertVolume = useCallback((value: number, from: string, to: string): number => {
    const conversions: { [key: string]: number } = {
      L_to_gal: 0.264172,
      gal_to_L: 3.78541,
      'L_to_fl oz': 33.814,
      'fl oz_to_L': 0.0295735,
    };

    const conversionKey = `${from}_to_${to}`;
    return conversions[conversionKey] ? value * conversions[conversionKey] : value;
  }, []);

  const convertWeight = useCallback((value: number, from: string, to: string): number => {
    const conversions: { [key: string]: number } = {
      g_to_oz: 0.035274,
      oz_to_g: 28.3495,
      kg_to_lb: 2.20462,
      lb_to_kg: 0.453592,
    };

    const conversionKey = `${from}_to_${to}`;
    return conversions[conversionKey] ? value * conversions[conversionKey] : value;
  }, []);

  // Voice feedback functionality
  const speakInstructions = useCallback(
    async (text: string, options?: Partial<VoiceFeedback>) => {
      if (!state.voiceEnabled) return;

      const voiceOptions = {
        language: state.voiceLanguage === 'ar' ? 'ar-SA' : 'en-US',
        rate: options?.rate || state.voiceRate,
        pitch: options?.pitch || 1.0,
        volume: options?.volume || 1.0,
      };

      try {
        await Speech.speak(text, voiceOptions);
      } catch (error) {
        console.error('Voice synthesis error:', error);
      }
    },
    [state.voiceEnabled, state.voiceLanguage, state.voiceRate]
  );

  // Calculate nutrient amounts
  const calculateNutrients = useCallback(
    (recipe: NutrientRecipe, waterVolume: number): NutrientCalculation[] => {
      return recipe.nutrients.map(nutrient => {
        const targetPpm = nutrient.optimalValue;
        const actualAmount = convertPpmToGrams(targetPpm, waterVolume);

        // Convert to selected unit system
        let displayAmount = actualAmount;
        let displayUnit = state.unitSystem.weight;

        if (state.unitSystem.type === 'imperial') {
          if (displayUnit === 'oz') {
            displayAmount = convertWeight(actualAmount, 'g', 'oz');
          }
        }

        // Generate instructions
        const instructions = t('nutrient.instructions.add', {
          amount: displayAmount.toFixed(2),
          unit: displayUnit,
          nutrient: nutrient.name,
          volume: waterVolume,
          volumeUnit: state.unitSystem.volume,
        });

        const voiceInstructions = t('nutrient.voice.add', {
          amount: Math.round(displayAmount * 100) / 100,
          unit: displayUnit,
          nutrient: nutrient.name,
        });

        return {
          element: nutrient,
          targetPpm,
          actualAmount: displayAmount,
          unit: displayUnit,
          instructions,
          voiceInstructions,
          instructionsAr: isRTL
            ? instructions
            : t(
                'nutrient.instructions.add',
                {
                  amount: displayAmount.toFixed(2),
                  unit: displayUnit,
                  nutrient: nutrient.name,
                  volume: waterVolume,
                  volumeUnit: state.unitSystem.volume,
                },
                { lng: 'ar' }
              ),
          voiceInstructionsAr: isRTL
            ? voiceInstructions
            : t(
                'nutrient.voice.add',
                {
                  amount: Math.round(displayAmount * 100) / 100,
                  unit: displayUnit,
                  nutrient: nutrient.name,
                },
                { lng: 'ar' }
              ),
        };
      });
    },
    [state.unitSystem, convertPpmToGrams, convertWeight, t, isRTL]
  );

  // Generate calculation result
  const generateCalculationResult = useCallback(
    (recipe: NutrientRecipe, calculations: NutrientCalculation[]): CalculationResult => {
      const totalNutrients = calculations.length;
      const macroNutrients = calculations.filter(c => c.element.category === 'macro').length;

      // Estimate difficulty based on number of nutrients
      let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
      if (totalNutrients > 8) difficulty = 'advanced';
      else if (totalNutrients > 5) difficulty = 'intermediate';

      // Estimate time (2 minutes per nutrient + 5 minutes prep)
      const estimatedTime = totalNutrients * 2 + 5;

      // Generate warnings and tips
      const warnings: string[] = [];
      const tips: string[] = [];

      if (recipe.ph.optimal < 5.5 || recipe.ph.optimal > 7.5) {
        warnings.push(t('nutrient.warnings.ph_extreme'));
      }

      if (macroNutrients < 3) {
        warnings.push(t('nutrient.warnings.incomplete_macro'));
      }

      tips.push(t('nutrient.tips.mix_order'));
      tips.push(t('nutrient.tips.ph_last'));
      if (difficulty === 'beginner') {
        tips.push(t('nutrient.tips.beginner'));
      }

      return {
        recipe,
        calculations,
        waterVolume: state.waterVolume,
        unit: state.unitSystem.volume,
        estimatedTime,
        difficulty,
        warnings,
        tips,
        warningsAr: warnings.map(w => t(w, { lng: 'ar' })),
        tipsAr: tips.map(tip => t(tip, { lng: 'ar' })),
      };
    },
    [state.waterVolume, state.unitSystem.volume, t]
  );

  // Main calculation function
  const calculateRecipe = useCallback(
    async (recipe: NutrientRecipe) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const calculations = calculateNutrients(recipe, state.waterVolume);
        const result = generateCalculationResult(recipe, calculations);

        setState(prev => ({
          ...prev,
          calculations: result,
          isLoading: false,
        }));

        // Speak summary if voice enabled
        if (state.voiceEnabled) {
          const summary = t('nutrient.voice.calculation_complete', {
            nutrientCount: calculations.length,
            time: result.estimatedTime,
          });
          await speakInstructions(summary);
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Calculation failed',
          isLoading: false,
        }));
      }
    },
    [
      calculateNutrients,
      generateCalculationResult,
      state.waterVolume,
      state.voiceEnabled,
      speakInstructions,
      t,
    ]
  );

  // Save recipe functionality
  const saveRecipe = useCallback(
    async (recipe: NutrientRecipe, customName?: string) => {
      try {
        const savedRecipe: SavedRecipe = {
          id: `saved_${Date.now()}`,
          recipeId: recipe.id,
          userId: 'current_user', // Should come from auth context
          customName,
          isFavorite: false,
          lastUsed: new Date(),
          useCount: 1,
          isOffline: state.isOffline,
          syncStatus: state.isOffline ? 'pending' : 'synced',
        };

        // Save locally
        const updatedRecipes = [...state.savedRecipes, savedRecipe];
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(updatedRecipes));

        // Sync to Supabase if online
        if (!state.isOffline) {
          await supabase.from('saved_nutrient_recipes').insert([savedRecipe]);
        }

        setState(prev => ({
          ...prev,
          savedRecipes: updatedRecipes,
        }));

        return savedRecipe;
      } catch (error) {
        console.error('Error saving recipe:', error);
        throw error;
      }
    },
    [state.savedRecipes, state.isOffline]
  );

  // Sync offline data
  const syncOfflineData = useCallback(async () => {
    if (state.isOffline) return;

    try {
      const pendingRecipes = state.savedRecipes.filter(r => r.syncStatus === 'pending');

      for (const recipe of pendingRecipes) {
        await supabase.from('saved_nutrient_recipes').upsert([{ ...recipe, syncStatus: 'synced' }]);
      }

      // Update local storage
      const syncedRecipes = state.savedRecipes.map(r =>
        r.syncStatus === 'pending' ? { ...r, syncStatus: 'synced' as const } : r
      );

      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(syncedRecipes));

      setState(prev => ({
        ...prev,
        savedRecipes: syncedRecipes,
      }));
    } catch (error) {
      console.error('Sync error:', error);
    }
  }, [state.isOffline, state.savedRecipes]);

  // Auto-sync when coming online
  useEffect(() => {
    if (!state.isOffline) {
      syncOfflineData();
    }
  }, [state.isOffline, syncOfflineData]);

  // Public API
  const api = useMemo(
    () => ({
      // State
      ...state,

      // Actions
      selectCrop: (crop: Crop) =>
        setState(prev => ({
          ...prev,
          selectedCrop: crop,
          selectedStage: null,
          selectedRecipe: null,
        })),

      selectStage: (stage: CropStage) =>
        setState(prev => ({
          ...prev,
          selectedStage: stage,
          selectedRecipe: null,
        })),

      selectRecipe: (recipe: NutrientRecipe) =>
        setState(prev => ({
          ...prev,
          selectedRecipe: recipe,
        })),

      setWaterVolume: (volume: number) =>
        setState(prev => ({
          ...prev,
          waterVolume: volume,
        })),

      setUnitSystem: async (unitSystem: UnitSystem) => {
        await AsyncStorage.setItem(STORAGE_KEYS.UNIT_SYSTEM, JSON.stringify(unitSystem));
        setState(prev => ({ ...prev, unitSystem }));
      },

      setVoiceEnabled: async (enabled: boolean) => {
        const voiceSettings = { voiceEnabled: enabled };
        await AsyncStorage.setItem(STORAGE_KEYS.VOICE_SETTINGS, JSON.stringify(voiceSettings));
        setState(prev => ({ ...prev, voiceEnabled: enabled }));
      },

      setVoiceRate: async (rate: number) => {
        const voiceSettings = { voiceRate: rate };
        await AsyncStorage.setItem(STORAGE_KEYS.VOICE_SETTINGS, JSON.stringify(voiceSettings));
        setState(prev => ({ ...prev, voiceRate: rate }));
      },

      // Calculations
      calculateRecipe,
      saveRecipe,
      speakInstructions,

      // Utility functions
      convertPpmToGrams,
      convertGramsToPpm,
      convertVolume,
      convertWeight,

      // Data
      commonNutrients: COMMON_NUTRIENTS,
      commonStages: COMMON_CROP_STAGES,

      // Sync
      syncOfflineData,

      // Clear state
      reset: () =>
        setState(prev => ({
          ...prev,
          selectedCrop: null,
          selectedStage: null,
          selectedRecipe: null,
          calculations: null,
          error: null,
        })),
    }),
    [
      state,
      calculateRecipe,
      saveRecipe,
      speakInstructions,
      convertPpmToGrams,
      convertGramsToPpm,
      convertVolume,
      convertWeight,
      syncOfflineData,
    ]
  );

  return api;
};
