import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { 
  LightingCalculatorState,
  LightingProfile,
  LEDSpecification,
  PhotoperiodSchedule,
  LightingCalculation,
  LightingSetup,
  LightingRecommendation,
  SpectrumRatio,
  PowerCost,
  AmbientLightReading,
  LightingTimer,
  COMMON_PHOTOPERIODS,
  COMMON_LED_SPECIFICATIONS,
  COMMON_SPECTRUM_RATIOS,
  DLI_RECOMMENDATIONS,
  PPFD_RECOMMENDATIONS
} from '@/types/lighting-calculator';
import { Crop, CropStage } from '@/types/nutrient-calculator';

const STORAGE_KEYS = {
  SAVED_SETUPS: 'lighting_saved_setups',
  POWER_COST: 'lighting_power_cost',
  UNITS: 'lighting_units',
  VOICE_SETTINGS: 'lighting_voice_settings',
  TIMERS: 'lighting_timers',
  OFFLINE_DATA: 'lighting_offline_data'
};

export const useLightingCalculator = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [state, setState] = useState<LightingCalculatorState>({
    selectedCrop: null,
    selectedStage: null,
    selectedProfile: null,
    selectedLED: null,
    distance: 12, // Default 12 inches
    photoperiod: null,
    calculations: null,
    setup: null,
    isLoading: false,
    error: null,
    units: {
      distance: 'inches',
      area: 'sqft',
      temperature: 'F'
    },
    isOffline: false,
    savedSetups: [],
    voiceEnabled: true,
    voiceLanguage: i18n.language as 'en' | 'ar',
    voiceRate: 1.0,
    timers: [],
    ambientLight: null,
    autoAdjust: false
  });

  const [powerCost, setPowerCost] = useState<PowerCost>({
    kwhRate: 0.12, // Default $0.12 per kWh
    currency: 'USD'
  });

  // Network status monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(netState => {
      setState(prev => ({
        ...prev,
        isOffline: !netState.isConnected
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
      voiceLanguage: i18n.language as 'en' | 'ar'
    }));
  }, [i18n.language]);

  const loadSavedData = async () => {
    try {
      const [savedSetups, powerCostData, units, voiceSettings, timers] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_SETUPS),
        AsyncStorage.getItem(STORAGE_KEYS.POWER_COST),
        AsyncStorage.getItem(STORAGE_KEYS.UNITS),
        AsyncStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.TIMERS)
      ]);

      setState(prev => ({
        ...prev,
        savedSetups: savedSetups ? JSON.parse(savedSetups) : [],
        units: units ? JSON.parse(units) : prev.units,
        timers: timers ? JSON.parse(timers) : [],
        ...(voiceSettings ? JSON.parse(voiceSettings) : {})
      }));

      if (powerCostData) {
        setPowerCost(JSON.parse(powerCostData));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  // PPFD Calculations using inverse square law
  const calculatePPFD = useCallback((
    ledSpec: LEDSpecification, 
    distance: number, 
    dimming: number = 100
  ): number => {
    // Convert distance to inches if needed
    const distanceInches = state.units.distance === 'cm' ? distance / 2.54 : distance;
    
    // Inverse square law: PPFD = (PPFD_reference × (distance_reference)²) / (distance_actual)²
    const referenceDistance = 12; // inches
    const referencePPFD = ledSpec.ppfdAt12Inches;
    
    const calculatedPPFD = (referencePPFD * Math.pow(referenceDistance, 2)) / Math.pow(distanceInches, 2);
    
    // Apply dimming factor
    return calculatedPPFD * (dimming / 100);
  }, [state.units.distance]);

  // DLI Calculation: PPFD × photoperiod hours × 0.0036
  const calculateDLI = useCallback((ppfd: number, lightHours: number): number => {
    return ppfd * lightHours * 0.0036;
  }, []);

  // Power consumption and cost calculations
  const calculatePowerCost = useCallback((
    wattage: number, 
    hoursPerDay: number, 
    days: number = 30
  ) => {
    const dailyKWh = (wattage * hoursPerDay) / 1000;
    const monthlyKWh = dailyKWh * days;
    
    const dailyCost = dailyKWh * powerCost.kwhRate;
    const monthlyCost = monthlyKWh * powerCost.kwhRate;
    
    return {
      dailyKWh,
      monthlyKWh,
      dailyCost,
      monthlyCost
    };
  }, [powerCost]);

  // Coverage area calculation
  const calculateCoverage = useCallback((ledSpec: LEDSpecification, distance: number): number => {
    // Simple approximation: coverage increases with distance but with diminishing returns
    const baseFootprint = parseFloat(ledSpec.coverage.footprint.split('x')[0]) || 2;
    const distanceInches = state.units.distance === 'cm' ? distance / 2.54 : distance;
    const recommendedHeight = ledSpec.coverage.recommendedHeight;
    
    // Coverage ratio based on distance vs recommended height
    const coverageRatio = Math.max(1, distanceInches / recommendedHeight);
    const coverageArea = Math.pow(baseFootprint * coverageRatio, 2);
    
    // Convert to selected units
    if (state.units.area === 'sqm') {
      return coverageArea * 0.092903; // sq ft to sq m
    }
    return coverageArea;
  }, [state.units]);

  // Generate lighting recommendations
  const generateRecommendations = useCallback((
    ledSpec: LEDSpecification,
    distance: number,
    ppfd: number,
    dli: number,
    cropId: string,
    stageId: string
  ): LightingRecommendation[] => {
    const recommendations: LightingRecommendation[] = [];
    
    // Get optimal ranges for this crop/stage
    const optimalPPFD = PPFD_RECOMMENDATIONS[cropId]?.[stageId];
    const optimalDLI = DLI_RECOMMENDATIONS[cropId]?.[stageId];
    
    if (!optimalPPFD || !optimalDLI) return recommendations;

    // PPFD recommendations
    if (ppfd < optimalPPFD.min) {
      recommendations.push({
        id: 'ppfd_low',
        type: 'distance',
        title: t('lighting.recommendations.ppfd_low_title'),
        description: t('lighting.recommendations.ppfd_low_desc', { 
          current: Math.round(ppfd), 
          optimal: optimalPPFD.optimal 
        }),
        value: Math.max(6, distance * 0.8),
        unit: state.units.distance,
        priority: 'high',
        voiceInstructions: t('lighting.voice.move_closer'),
        titleAr: t('lighting.recommendations.ppfd_low_title', { lng: 'ar' }),
        descriptionAr: t('lighting.recommendations.ppfd_low_desc', { 
          current: Math.round(ppfd), 
          optimal: optimalPPFD.optimal 
        }, { lng: 'ar' }),
        voiceInstructionsAr: t('lighting.voice.move_closer', { lng: 'ar' })
      });
    } else if (ppfd > optimalPPFD.max) {
      recommendations.push({
        id: 'ppfd_high',
        type: 'distance',
        title: t('lighting.recommendations.ppfd_high_title'),
        description: t('lighting.recommendations.ppfd_high_desc', { 
          current: Math.round(ppfd), 
          optimal: optimalPPFD.optimal 
        }),
        value: Math.min(36, distance * 1.3),
        unit: state.units.distance,
        priority: 'high',
        voiceInstructions: t('lighting.voice.move_further'),
        titleAr: t('lighting.recommendations.ppfd_high_title', { lng: 'ar' }),
        descriptionAr: t('lighting.recommendations.ppfd_high_desc', { 
          current: Math.round(ppfd), 
          optimal: optimalPPFD.optimal 
        }, { lng: 'ar' }),
        voiceInstructionsAr: t('lighting.voice.move_further', { lng: 'ar' })
      });
    }

    // DLI recommendations
    if (dli < optimalDLI.min) {
      recommendations.push({
        id: 'dli_low',
        type: 'schedule',
        title: t('lighting.recommendations.dli_low_title'),
        description: t('lighting.recommendations.dli_low_desc', { 
          current: dli.toFixed(1), 
          optimal: optimalDLI.optimal 
        }),
        priority: 'medium',
        voiceInstructions: t('lighting.voice.increase_photoperiod'),
        titleAr: t('lighting.recommendations.dli_low_title', { lng: 'ar' }),
        descriptionAr: t('lighting.recommendations.dli_low_desc', { 
          current: dli.toFixed(1), 
          optimal: optimalDLI.optimal 
        }, { lng: 'ar' }),
        voiceInstructionsAr: t('lighting.voice.increase_photoperiod', { lng: 'ar' })
      });
    }

    // Spectrum recommendations
    const stageSpectrum = COMMON_SPECTRUM_RATIOS[stageId];
    if (stageSpectrum) {
      const currentSpectrum = ledSpec.spectrum;
      if (Math.abs(currentSpectrum.red - stageSpectrum.red) > 10) {
        recommendations.push({
          id: 'spectrum_red',
          type: 'spectrum',
          title: t('lighting.recommendations.spectrum_title'),
          description: t('lighting.recommendations.spectrum_red_desc', { 
            stage: stageId,
            recommended: stageSpectrum.red 
          }),
          priority: 'low',
          voiceInstructions: t('lighting.voice.adjust_spectrum'),
          titleAr: t('lighting.recommendations.spectrum_title', { lng: 'ar' }),
          descriptionAr: t('lighting.recommendations.spectrum_red_desc', { 
            stage: stageId,
            recommended: stageSpectrum.red 
          }, { lng: 'ar' }),
          voiceInstructionsAr: t('lighting.voice.adjust_spectrum', { lng: 'ar' })
        });
      }
    }

    return recommendations;
  }, [state.units, t]);

  // Main calculation function
  const calculateLighting = useCallback(async (
    ledSpec: LEDSpecification,
    distance: number,
    photoperiod: PhotoperiodSchedule,
    cropId: string,
    stageId: string
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const ppfd = calculatePPFD(ledSpec, distance);
      const dli = calculateDLI(ppfd, photoperiod.lightHours);
      const coverage = calculateCoverage(ledSpec, distance);
      const powerCosts = calculatePowerCost(ledSpec.wattage, photoperiod.lightHours);
      
      const recommendations = generateRecommendations(
        ledSpec, distance, ppfd, dli, cropId, stageId
      );

      const calculation: LightingCalculation = {
        ledSpec,
        distance,
        ppfd,
        dli,
        coverage,
        powerConsumption: ledSpec.wattage,
        dailyCost: powerCosts.dailyCost,
        monthlyCost: powerCosts.monthlyCost,
        recommendations
      };

      setState(prev => ({
        ...prev,
        calculations: calculation,
        isLoading: false
      }));

      // Voice feedback if enabled
      if (state.voiceEnabled) {
        const summary = t('lighting.voice.calculation_complete', {
          ppfd: Math.round(ppfd),
          dli: dli.toFixed(1),
          cost: powerCosts.monthlyCost.toFixed(2),
          currency: powerCost.currency
        });
        await speakInstructions(summary);
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Calculation failed',
        isLoading: false
      }));
    }
  }, [
    calculatePPFD, 
    calculateDLI, 
    calculateCoverage, 
    calculatePowerCost, 
    generateRecommendations,
    state.voiceEnabled,
    powerCost,
    t
  ]);

  // Voice feedback functionality
  const speakInstructions = useCallback(async (text: string, options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  }) => {
    if (!state.voiceEnabled) return;

    const voiceOptions = {
      language: state.voiceLanguage === 'ar' ? 'ar-SA' : 'en-US',
      rate: options?.rate || state.voiceRate,
      pitch: options?.pitch || 1.0,
      volume: options?.volume || 1.0
    };

    try {
      await Speech.speak(text, voiceOptions);
    } catch (error) {
      console.error('Voice synthesis error:', error);
    }
  }, [state.voiceEnabled, state.voiceLanguage, state.voiceRate]);

  // Timer management
  const createTimer = useCallback(async (
    setupId: string,
    photoperiod: PhotoperiodSchedule
  ): Promise<LightingTimer> => {
    const timer: LightingTimer = {
      id: `timer_${Date.now()}`,
      setupId,
      photoperiod,
      isEnabled: true,
      nextStateChange: calculateNextStateChange(photoperiod),
      currentState: getCurrentLightState(photoperiod),
      notifications: {
        enabled: true,
        beforeMinutes: 5
      }
    };

    // Schedule notifications
    if (timer.notifications.enabled) {
      await scheduleTimerNotifications(timer);
    }

    const updatedTimers = [...state.timers, timer];
    await AsyncStorage.setItem(STORAGE_KEYS.TIMERS, JSON.stringify(updatedTimers));
    
    setState(prev => ({
      ...prev,
      timers: updatedTimers
    }));

    return timer;
  }, [state.timers]);

  // Helper functions for timer management
  const calculateNextStateChange = (photoperiod: PhotoperiodSchedule): Date => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [sunriseHour, sunriseMinute] = photoperiod.sunriseTime.split(':').map(Number);
    const [sunsetHour, sunsetMinute] = photoperiod.sunsetTime.split(':').map(Number);
    
    const sunrise = new Date(today.getTime() + sunriseHour * 60 * 60 * 1000 + sunriseMinute * 60 * 1000);
    let sunset = new Date(today.getTime() + sunsetHour * 60 * 60 * 1000 + sunsetMinute * 60 * 1000);
    
    // Handle midnight crossing
    if (sunset <= sunrise) {
      sunset = new Date(sunset.getTime() + 24 * 60 * 60 * 1000);
    }

    // Find next state change
    if (now < sunrise) {
      return sunrise;
    } else if (now < sunset) {
      return sunset;
    } else {
      // Next sunrise tomorrow
      return new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  const getCurrentLightState = (photoperiod: PhotoperiodSchedule): 'on' | 'off' | 'transitioning' => {
    const now = new Date();
    const timeOfDay = now.getHours() * 60 + now.getMinutes();
    
    const [sunriseHour, sunriseMinute] = photoperiod.sunriseTime.split(':').map(Number);
    const [sunsetHour, sunsetMinute] = photoperiod.sunsetTime.split(':').map(Number);
    
    const sunriseMinutes = sunriseHour * 60 + sunriseMinute;
    let sunsetMinutes = sunsetHour * 60 + sunsetMinute;
    
    // Handle midnight crossing
    if (sunsetMinutes <= sunriseMinutes) {
      sunsetMinutes += 24 * 60;
    }

    if (timeOfDay >= sunriseMinutes && timeOfDay < sunsetMinutes) {
      return 'on';
    } else {
      return 'off';
    }
  };

  const scheduleTimerNotifications = async (timer: LightingTimer) => {
    // Schedule notification for next state change
    const trigger = timer.nextStateChange;
    const beforeTrigger = new Date(trigger.getTime() - timer.notifications.beforeMinutes * 60 * 1000);

    if (beforeTrigger > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('lighting.notifications.state_change_title'),
          body: t('lighting.notifications.state_change_body', {
            action: timer.currentState === 'on' ? t('common.turn_off') : t('common.turn_on'),
            minutes: timer.notifications.beforeMinutes
          }),
          data: { timerId: timer.id }
        },
        trigger: { date: beforeTrigger }
      });
    }
  };

  // Save setup functionality
  const saveLightingSetup = useCallback(async (
    name: string,
    calculation: LightingCalculation,
    photoperiod: PhotoperiodSchedule,
    cropId: string,
    stageId: string
  ) => {
    try {
      const setup: LightingSetup = {
        id: `setup_${Date.now()}`,
        name,
        userId: 'current_user', // Should come from auth context
        cropId,
        stageId,
        ledConfigs: [{
          id: 'main_led',
          ledSpec: calculation.ledSpec,
          quantity: 1,
          distance: calculation.distance,
          dimming: 100,
          position: { x: 0, y: 0 }
        }],
        photoperiod,
        totalPowerConsumption: calculation.powerConsumption,
        totalCoverage: calculation.coverage,
        averagePPFD: calculation.ppfd,
        averageDLI: calculation.dli,
        estimatedMonthlyCost: calculation.monthlyCost,
        isActive: false,
        isOffline: state.isOffline,
        syncStatus: state.isOffline ? 'pending' : 'synced',
        lastUsed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save locally
      const updatedSetups = [...state.savedSetups, setup];
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_SETUPS, JSON.stringify(updatedSetups));

      // Sync to Supabase if online
      if (!state.isOffline) {
        await supabase
          .from('lighting_setups')
          .insert([setup]);
      }

      setState(prev => ({
        ...prev,
        savedSetups: updatedSetups,
        setup
      }));

      return setup;
    } catch (error) {
      console.error('Error saving setup:', error);
      throw error;
    }
  }, [state.savedSetups, state.isOffline]);

  // Sync offline data
  const syncOfflineData = useCallback(async () => {
    if (state.isOffline) return;

    try {
      const pendingSetups = state.savedSetups.filter(s => s.syncStatus === 'pending');
      
      for (const setup of pendingSetups) {
        await supabase
          .from('lighting_setups')
          .upsert([{ ...setup, syncStatus: 'synced' }]);
      }

      // Update local storage
      const syncedSetups = state.savedSetups.map(s => 
        s.syncStatus === 'pending' ? { ...s, syncStatus: 'synced' as const } : s
      );

      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_SETUPS, JSON.stringify(syncedSetups));
      
      setState(prev => ({
        ...prev,
        savedSetups: syncedSetups
      }));

    } catch (error) {
      console.error('Sync error:', error);
    }
  }, [state.isOffline, state.savedSetups]);

  // Auto-sync when coming online
  useEffect(() => {
    if (!state.isOffline) {
      syncOfflineData();
    }
  }, [state.isOffline, syncOfflineData]);

  // Public API
  const api = useMemo(() => ({
    // State
    ...state,
    powerCost,
    
    // Actions
    selectCrop: (crop: Crop) => setState(prev => ({ 
      ...prev, 
      selectedCrop: crop, 
      selectedStage: null, 
      selectedProfile: null 
    })),
    
    selectStage: (stage: CropStage) => setState(prev => ({ 
      ...prev, 
      selectedStage: stage, 
      selectedProfile: null 
    })),
    
    selectLED: (led: LEDSpecification) => setState(prev => ({ 
      ...prev, 
      selectedLED: led 
    })),
    
    setDistance: (distance: number) => setState(prev => ({ 
      ...prev, 
      distance 
    })),
    
    setPhotoperiod: (photoperiod: PhotoperiodSchedule) => setState(prev => ({ 
      ...prev, 
      photoperiod 
    })),
    
    setPowerCost: async (cost: PowerCost) => {
      await AsyncStorage.setItem(STORAGE_KEYS.POWER_COST, JSON.stringify(cost));
      setPowerCost(cost);
    },
    
    setUnits: async (units: typeof state.units) => {
      await AsyncStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
      setState(prev => ({ ...prev, units }));
    },
    
    setVoiceEnabled: async (enabled: boolean) => {
      const voiceSettings = { voiceEnabled: enabled };
      await AsyncStorage.setItem(STORAGE_KEYS.VOICE_SETTINGS, JSON.stringify(voiceSettings));
      setState(prev => ({ ...prev, voiceEnabled: enabled }));
    },
    
    setAutoAdjust: (autoAdjust: boolean) => setState(prev => ({ 
      ...prev, 
      autoAdjust 
    })),
    
    // Calculations
    calculateLighting,
    calculatePPFD,
    calculateDLI,
    calculateCoverage,
    calculatePowerCost,
    saveLightingSetup,
    speakInstructions,
    
    // Timer management
    createTimer,
    
    // Data
    commonPhotoperiods: COMMON_PHOTOPERIODS,
    commonLEDs: COMMON_LED_SPECIFICATIONS,
    commonSpectrums: COMMON_SPECTRUM_RATIOS,
    dliRecommendations: DLI_RECOMMENDATIONS,
    ppfdRecommendations: PPFD_RECOMMENDATIONS,
    
    // Sync
    syncOfflineData,
    
    // Clear state
    reset: () => setState(prev => ({
      ...prev,
      selectedCrop: null,
      selectedStage: null,
      selectedProfile: null,
      selectedLED: null,
      calculations: null,
      setup: null,
      error: null
    }))
  }), [
    state, 
    powerCost,
    calculateLighting, 
    calculatePPFD, 
    calculateDLI, 
    calculateCoverage, 
    calculatePowerCost,
    saveLightingSetup,
    speakInstructions,
    createTimer,
    syncOfflineData
  ]);

  return api;
}; 