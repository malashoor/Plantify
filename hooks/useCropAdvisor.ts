import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase/supabase';
import {
  CropAdvisorState,
  SensorSnapshot,
  GrowthTrend,
  StressIndicator,
  Recommendation,
  PlantProfile,
  AIAnalysisResult,
  ConversationalRequest,
  ConversationalResponse,
  PlantHealthStatus,
  UserFeedback,
  AutomationTask,
  AIPersonality,
  UserPreferences,
  AI_RESPONSES,
  STRESS_PATTERNS,
  ConfidenceLevel,
  AITone,
  StressType,
} from '../types/crop-advisor';
import { useI18n } from './useI18n';
import { router } from 'expo-router';

const STORAGE_KEYS = {
  PLANT_PROFILES: '@crop_advisor_profiles',
  AI_PERSONALITY: '@crop_advisor_personality',
  USER_PREFERENCES: '@crop_advisor_preferences',
  SENSOR_DATA: '@crop_advisor_sensors',
  RECOMMENDATIONS: '@crop_advisor_recommendations',
};

export const useCropAdvisor = () => {
  const { t, locale } = useI18n();
  const [state, setState] = useState<CropAdvisorState>({
    currentAnalysis: null,
    activeRecommendations: [],
    plantProfiles: [],
    selectedPlantId: null,
    conversationHistory: [],
    isThinking: false,
    latestSensorData: null,
    monitoringActive: false,
    alertsEnabled: true,
    userFeedback: [],
    modelAccuracy: 85,
    improvementSuggestions: [],
    moduleConnections: [],
    automationQueue: [],
    aiPersonality: {
      communicationStyle: 'encouraging',
      proactiveness: 'balanced',
      riskTolerance: 'moderate',
      learningAggressiveness: 'moderate',
      voicePersonality: 'caring',
    },
    userPreferences: {
      automationLevel: 'assisted',
      notificationFrequency: 'important',
      riskAppetite: 'moderate',
      learningOriented: true,
      voiceEnabled: true,
      hapticFeedback: true,
      preferredUnits: 'metric',
      language: locale as 'en' | 'ar',
    },
    isLoading: false,
    error: null,
    lastUpdate: new Date(),
    syncStatus: 'synced',
  });

  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Initialize crop advisor
  useEffect(() => {
    if (!isInitialized.current) {
      initializeCropAdvisor();
      startMonitoring();
      isInitialized.current = true;
    }

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, []);

  // Initialize crop advisor system
  const initializeCropAdvisor = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Load stored data
      const [profiles, personality, preferences] = await Promise.all([
        loadPlantProfiles(),
        loadAIPersonality(),
        loadUserPreferences(),
      ]);

      setState(prev => ({
        ...prev,
        plantProfiles: profiles,
        aiPersonality: { ...prev.aiPersonality, ...personality },
        userPreferences: { ...prev.userPreferences, ...preferences },
        isLoading: false,
      }));

      // Start with sample plant if none exist
      if (profiles.length === 0) {
        await createSamplePlant();
      }
    } catch (error) {
      console.error('Failed to initialize crop advisor:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize AI advisor',
        isLoading: false,
      }));
    }
  }, []);

  // AI Analysis Engine - Core Intelligence
  const analyzeCurrentConditions = useCallback(
    async (sensorData: SensorSnapshot): Promise<AIAnalysisResult> => {
      const plantProfile = state.plantProfiles.find(p => p.id === state.selectedPlantId);
      if (!plantProfile) {
        throw new Error('No plant profile selected');
      }

      // 1. Analyze Growth Trends
      const trends = await analyzeGrowthTrends(plantProfile, sensorData);

      // 2. Detect Stress Indicators
      const stressIndicators = await detectStressPatterns(sensorData, plantProfile);

      // 3. Calculate Plant Health
      const plantHealth = calculatePlantHealth(sensorData, trends, stressIndicators, plantProfile);

      // 4. Generate Recommendations
      const recommendations = await generateRecommendations(stressIndicators, trends, plantProfile);

      // 5. Make Predictions
      const predictions = generatePredictions(trends, plantHealth, plantProfile);

      // 6. Determine Confidence
      const confidence = calculateOverallConfidence(sensorData, trends, stressIndicators);

      return {
        plantHealth,
        trends,
        stressIndicators,
        recommendations,
        predictions,
        confidence,
        analysisDate: new Date(),
        dataQuality: assessDataQuality(sensorData),
        nextAnalysisDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      };
    },
    [state.plantProfiles, state.selectedPlantId]
  );

  // Advanced Stress Detection Engine
  const detectStressPatterns = useCallback(
    async (sensorData: SensorSnapshot, plantProfile: PlantProfile): Promise<StressIndicator[]> => {
      const stressors: StressIndicator[] = [];
      const { optimalRanges } = plantProfile;

      // Light Stress Detection
      if (sensorData.ppfd > optimalRanges.ppfd.max * 1.2) {
        stressors.push({
          id: `light_stress_${Date.now()}`,
          type: 'light_stress',
          severity: sensorData.ppfd > optimalRanges.ppfd.max * 1.5 ? 'severe' : 'moderate',
          confidence: 'high',
          symptoms: ['leaf_curling', 'bleaching', 'heat_stress'],
          likelyCauses: ['excessive_ppfd', 'light_too_close', 'poor_heat_management'],
          detectedAt: new Date(),
          isActive: true,
          affectedParameters: ['light_response', 'photosynthesis_efficiency'],
          timeToAction:
            sensorData.ppfd > optimalRanges.ppfd.max * 1.5 ? 'immediate' : 'within_hours',
        });
      }

      // pH Lockout Detection
      if (sensorData.ph < optimalRanges.ph.min || sensorData.ph > optimalRanges.ph.max) {
        const severity =
          Math.abs(sensorData.ph - optimalRanges.ph.optimal) > 1.5 ? 'severe' : 'moderate';
        stressors.push({
          id: `ph_lockout_${Date.now()}`,
          type: 'ph_lockout',
          severity,
          confidence: 'very_high',
          symptoms: ['nutrient_deficiency', 'yellowing', 'stunted_growth'],
          likelyCauses: ['improper_ph_management', 'buffer_depletion', 'contamination'],
          detectedAt: new Date(),
          isActive: true,
          affectedParameters: ['nutrient_uptake', 'root_development'],
          timeToAction: severity === 'severe' ? 'immediate' : 'within_day',
        });
      }

      // Heat Stress Detection
      if (sensorData.temperature > optimalRanges.temperature.max) {
        stressors.push({
          id: `heat_stress_${Date.now()}`,
          type: 'heat_stress',
          severity:
            sensorData.temperature > optimalRanges.temperature.max + 5 ? 'severe' : 'moderate',
          confidence: 'high',
          symptoms: ['wilting', 'increased_transpiration', 'leaf_edge_burn'],
          likelyCauses: ['poor_ventilation', 'excessive_lighting', 'ambient_heat'],
          detectedAt: new Date(),
          isActive: true,
          affectedParameters: ['temperature_tolerance', 'stress_recovery'],
          timeToAction: 'within_hours',
        });
      }

      // EC Imbalance Detection
      if (sensorData.ec > optimalRanges.ec.max * 1.3) {
        stressors.push({
          id: `ec_imbalance_${Date.now()}`,
          type: 'ec_imbalance',
          severity: 'moderate',
          confidence: 'high',
          symptoms: ['nutrient_burn', 'salt_buildup', 'root_damage'],
          likelyCauses: ['over_fertilization', 'water_evaporation', 'poor_mixing'],
          detectedAt: new Date(),
          isActive: true,
          affectedParameters: ['nutrient_uptake', 'root_development'],
          timeToAction: 'within_day',
        });
      }

      return stressors;
    },
    []
  );

  // Intelligent Recommendation Engine
  const generateRecommendations = useCallback(
    async (
      stressIndicators: StressIndicator[],
      trends: GrowthTrend[],
      plantProfile: PlantProfile
    ): Promise<Recommendation[]> => {
      const recommendations: Recommendation[] = [];

      // Process each stress indicator
      for (const stress of stressIndicators) {
        switch (stress.type) {
          case 'light_stress':
            recommendations.push({
              id: `rec_light_${Date.now()}`,
              type: 'lighting_adjustment',
              priority: stress.severity === 'severe' ? 'critical' : 'high',
              confidence: 'high',
              title: t('advisor.recommendations.reduceLighting'),
              description: t('advisor.recommendations.lightStressDescription'),
              reasoning: t('advisor.recommendations.lightStressReasoning'),
              adjustments: [
                {
                  parameter: 'PPFD',
                  currentValue: state.latestSensorData?.ppfd || 0,
                  recommendedValue: plantProfile.optimalRanges.ppfd.optimal,
                  unit: 'μmol/m²/s',
                  changeType: 'decrease',
                  urgency: 'immediate',
                },
              ],
              moduleIntegration: [
                {
                  moduleType: 'lighting_calculator',
                  action: 'auto_adjust',
                  parameters: { ppfd: plantProfile.optimalRanges.ppfd.optimal },
                  autoExecute: state.userPreferences.automationLevel === 'full_auto',
                },
              ],
              expectedResults: ['reduced_heat_stress', 'improved_leaf_health', 'better_growth'],
              timeframe: 'within 2-4 hours',
              successMetrics: ['temperature_decrease', 'ppfd_normalization'],
              tone: 'concerned',
              voiceScript: t('advisor.voice.lightStressAction'),
              userApprovalRequired: state.userPreferences.automationLevel !== 'full_auto',
              automationPossible: true,
              alternativeOptions: ['increase_distance', 'reduce_photoperiod'],
              createdAt: new Date(),
            });
            break;

          case 'ph_lockout':
            recommendations.push({
              id: `rec_ph_${Date.now()}`,
              type: 'nutrient_adjustment',
              priority: 'critical',
              confidence: 'very_high',
              title: t('advisor.recommendations.adjustPH'),
              description: t('advisor.recommendations.phLockoutDescription'),
              reasoning: t('advisor.recommendations.phLockoutReasoning'),
              adjustments: [
                {
                  parameter: 'pH',
                  currentValue: state.latestSensorData?.ph || 0,
                  recommendedValue: plantProfile.optimalRanges.ph.optimal,
                  unit: 'pH',
                  changeType:
                    state.latestSensorData?.ph! > plantProfile.optimalRanges.ph.optimal
                      ? 'decrease'
                      : 'increase',
                  urgency: 'immediate',
                },
              ],
              moduleIntegration: [
                {
                  moduleType: 'nutrient_calculator',
                  action: 'auto_adjust',
                  parameters: {
                    targetPH: plantProfile.optimalRanges.ph.optimal,
                    currentPH: state.latestSensorData?.ph,
                  },
                  autoExecute: false, // pH adjustment always requires approval
                },
              ],
              expectedResults: ['restored_nutrient_uptake', 'improved_growth', 'healthier_roots'],
              timeframe: 'within 30 minutes',
              successMetrics: ['ph_normalization', 'nutrient_uptake_improvement'],
              tone: 'urgent',
              voiceScript: t('advisor.voice.phAdjustmentNeeded'),
              userApprovalRequired: true, // pH changes always need approval
              automationPossible: false,
              alternativeOptions: ['flush_system', 'adjust_gradually'],
              createdAt: new Date(),
            });
            break;
        }
      }

      // Optimization recommendations based on trends
      const decliningTrends = trends.filter(
        t => t.direction === 'declining' && t.significance !== 'minor'
      );
      for (const trend of decliningTrends) {
        if (trend.parameter === 'growth_rate') {
          recommendations.push({
            id: `rec_growth_${Date.now()}`,
            type: 'schedule_optimization',
            priority: 'medium',
            confidence: 'medium',
            title: t('advisor.recommendations.optimizeGrowth'),
            description: t('advisor.recommendations.growthOptimizationDescription'),
            reasoning: t('advisor.recommendations.growthOptimizationReasoning'),
            adjustments: [],
            moduleIntegration: [
              {
                moduleType: 'learning_center',
                action: 'suggest_lesson',
                parameters: { topic: 'growth_optimization' },
                autoExecute: false,
              },
            ],
            expectedResults: ['improved_growth_rate', 'better_nutrient_efficiency'],
            timeframe: '3-7 days',
            successMetrics: ['growth_rate_increase'],
            tone: 'encouraging',
            voiceScript: t('advisor.voice.growthOptimization'),
            userApprovalRequired: false,
            automationPossible: false,
            alternativeOptions: ['adjust_lighting', 'modify_nutrients'],
            createdAt: new Date(),
          });
        }
      }

      return recommendations;
    },
    [state.latestSensorData, state.userPreferences, t]
  );

  // Conversational AI Interface
  const askAI = useCallback(
    async (question: string): Promise<ConversationalResponse> => {
      setState(prev => ({ ...prev, isThinking: true }));

      try {
        // Simulate AI thinking delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        const response = await processConversationalQuery(question);

        setState(prev => ({
          ...prev,
          conversationHistory: [...prev.conversationHistory, response],
          isThinking: false,
        }));

        // Voice response if enabled
        if (state.userPreferences.voiceEnabled && Platform.OS !== 'web') {
          Speech.speak(response.voiceScript, {
            language: locale,
            rate: 1.0,
          });
        }

        // Haptic feedback for important responses
        if (state.userPreferences.hapticFeedback && response.tone === 'urgent') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        return response;
      } catch (error) {
        setState(prev => ({ ...prev, isThinking: false }));
        throw error;
      }
    },
    [state.userPreferences, locale]
  );

  // Process natural language queries
  const processConversationalQuery = useCallback(
    async (question: string): Promise<ConversationalResponse> => {
      const lowerQuestion = question.toLowerCase();

      // Detect question type and generate appropriate response
      if (lowerQuestion.includes('yellow') || lowerQuestion.includes('صفر')) {
        return generateDiagnosisResponse('yellowing', question);
      } else if (lowerQuestion.includes('grow') || lowerQuestion.includes('نمو')) {
        return generateGrowthResponse(question);
      } else if (lowerQuestion.includes('light') || lowerQuestion.includes('إضاءة')) {
        return generateLightingResponse(question);
      } else if (lowerQuestion.includes('nutrient') || lowerQuestion.includes('مغذيات')) {
        return generateNutrientResponse(question);
      } else {
        return generateGeneralResponse(question);
      }
    },
    []
  );

  // Generate diagnosis response for plant issues
  const generateDiagnosisResponse = useCallback(
    async (symptom: string, originalQuestion: string): Promise<ConversationalResponse> => {
      const currentData = state.latestSensorData;
      const plantProfile = state.plantProfiles.find(p => p.id === state.selectedPlantId);

      let answer = '';
      let tone: AITone = 'informative';
      let recommendations: Recommendation[] = [];

      if (symptom === 'yellowing' && currentData && plantProfile) {
        // Intelligent diagnosis based on sensor data
        if (
          currentData.ph < plantProfile.optimalRanges.ph.min ||
          currentData.ph > plantProfile.optimalRanges.ph.max
        ) {
          answer = t('advisor.diagnosis.yellowingPH');
          tone = 'concerned';
          recommendations = await generateRecommendations(
            [
              {
                id: 'ph_issue',
                type: 'ph_lockout',
                severity: 'moderate',
                confidence: 'high',
                symptoms: ['yellowing'],
                likelyCauses: ['ph_imbalance'],
                detectedAt: new Date(),
                isActive: true,
                affectedParameters: ['nutrient_uptake'],
                timeToAction: 'within_day',
              },
            ],
            [],
            plantProfile
          );
        } else if (currentData.ec < plantProfile.optimalRanges.ec.min) {
          answer = t('advisor.diagnosis.yellowingNutrients');
          tone = 'encouraging';
        } else {
          answer = t('advisor.diagnosis.yellowingGeneral');
          tone = 'informative';
        }
      }

      return {
        id: `response_${Date.now()}`,
        requestId: `request_${Date.now()}`,
        answer,
        confidence: 'high',
        tone,
        reasoning: t('advisor.reasoning.basedOnSensorData'),
        dataPoints: currentData
          ? [
              `pH: ${currentData.ph.toFixed(1)}`,
              `EC: ${currentData.ec.toFixed(1)} mS/cm`,
              `PPFD: ${currentData.ppfd} μmol/m²/s`,
            ]
          : [],
        recommendations,
        followUpQuestions: [
          t('advisor.followUp.whenDidYouNotice'),
          t('advisor.followUp.anyRecentChanges'),
          t('advisor.followUp.wantOptimization'),
        ],
        actionButtons: [
          {
            id: 'open_nutrients',
            label: t('advisor.actions.adjustNutrients'),
            type: 'open_module',
            route: '/nutrient-calculator',
            icon: 'leaf',
            priority: 1,
          },
          {
            id: 'learn_more',
            label: t('advisor.actions.learnMore'),
            type: 'learn_more',
            route: '/learn',
            parameters: { topic: 'nutrient_deficiencies' },
            icon: 'school',
            priority: 2,
          },
        ],
        visualAids: [],
        voiceScript: answer,
        voiceEmotion: 'concerned',
        relatedLessons: ['nutrient_deficiencies', 'ph_management'],
        practiceActivities: ['nutrient_calculator'],
        timestamp: new Date(),
      };
    },
    [state.latestSensorData, state.plantProfiles, state.selectedPlantId, t]
  );

  // Apply AI recommendation with integration
  const applyRecommendation = useCallback(
    async (recommendation: Recommendation) => {
      try {
        setState(prev => ({
          ...prev,
          automationQueue: [
            ...prev.automationQueue,
            {
              id: `auto_${Date.now()}`,
              type: 'apply_recommendation',
              status: 'pending',
              scheduledFor: new Date(),
              parameters: { recommendationId: recommendation.id },
              retryCount: 0,
              maxRetries: 3,
            },
          ],
        }));

        // Execute module integrations
        for (const integration of recommendation.moduleIntegration) {
          if (integration.autoExecute || state.userPreferences.automationLevel === 'full_auto') {
            await executeModuleIntegration(integration);
          }
        }

        // Voice confirmation
        if (state.userPreferences.voiceEnabled && Platform.OS !== 'web') {
          Speech.speak(t('advisor.voice.recommendationApplied'), { language: locale });
        }

        // Haptic feedback
        if (state.userPreferences.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Update recommendation status
        setState(prev => ({
          ...prev,
          activeRecommendations: prev.activeRecommendations.map(rec =>
            rec.id === recommendation.id
              ? { ...rec, appliedAt: new Date(), userResponse: 'accepted' }
              : rec
          ),
        }));
      } catch (error) {
        console.error('Failed to apply recommendation:', error);
        Alert.alert(
          t('advisor.error.applicationFailed'),
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    },
    [state.userPreferences, locale, t]
  );

  // Execute module integration
  const executeModuleIntegration = useCallback(async (integration: any) => {
    switch (integration.moduleType) {
      case 'lighting_calculator':
        router.push({
          pathname: '/lighting-calculator',
          params: integration.parameters,
        });
        break;
      case 'nutrient_calculator':
        router.push({
          pathname: '/nutrient-calculator',
          params: integration.parameters,
        });
        break;
      case 'learning_center':
        router.push({
          pathname: '/learn',
          params: integration.parameters,
        });
        break;
    }
  }, []);

  // Start real-time monitoring
  const startMonitoring = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    // Run analysis every 15 minutes
    analysisIntervalRef.current = setInterval(
      async () => {
        if (state.monitoringActive && state.latestSensorData) {
          try {
            const analysis = await analyzeCurrentConditions(state.latestSensorData);
            setState(prev => ({ ...prev, currentAnalysis: analysis }));
          } catch (error) {
            console.error('Analysis failed:', error);
          }
        }
      },
      15 * 60 * 1000
    );
  }, [state.monitoringActive, state.latestSensorData, analyzeCurrentConditions]);

  // Helper functions
  const loadPlantProfiles = async (): Promise<PlantProfile[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLANT_PROFILES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const loadAIPersonality = async (): Promise<Partial<AIPersonality>> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AI_PERSONALITY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const loadUserPreferences = async (): Promise<Partial<UserPreferences>> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const createSamplePlant = async () => {
    const samplePlant: PlantProfile = {
      id: 'sample_lettuce',
      userId: 'current_user',
      name: 'Buttercrunch Lettuce',
      cropType: 'lettuce',
      variety: 'buttercrunch',
      plantedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      expectedHarvestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      currentStage: 'vegetative',
      optimalRanges: {
        temperature: { min: 18, max: 24, optimal: 21 },
        humidity: { min: 60, max: 70, optimal: 65 },
        ph: { min: 5.5, max: 6.5, optimal: 6.0 },
        ec: { min: 1.2, max: 1.8, optimal: 1.5 },
        ppfd: { min: 200, max: 400, optimal: 300 },
        dli: { min: 12, max: 18, optimal: 15 },
        photoperiod: { min: 12, max: 16, optimal: 14 },
        co2: { min: 400, max: 800, optimal: 600 },
      },
      characteristics: {
        lightSensitivity: 'medium',
        nutrientHunger: 'moderate_feeder',
        temperatureTolerance: 'cold_sensitive',
        phTolerance: 'moderate',
        growthRate: 'fast',
        yieldPotential: 'medium',
        diseaseSusceptibility: [],
      },
      growthHistory: [],
      stressHistory: [],
      harvestHistory: [],
      aiPersonality: state.aiPersonality,
      userPreferences: state.userPreferences,
      health: {
        overall: 'good',
        components: {
          growth: 85,
          nutrition: 90,
          environment: 80,
          lighting: 85,
          water: 88,
          roots: 82,
        },
        activeStressors: [],
        riskFactors: [],
        strengths: ['good_nutrition', 'optimal_lighting'],
        improvementAreas: ['temperature_stability'],
      },
      lastAssessment: new Date(),
      nextAssessment: new Date(Date.now() + 4 * 60 * 60 * 1000),
      linkedNutrientRecipes: [],
      linkedLightingSetups: [],
      linkedBuildJournal: undefined,
    };

    setState(prev => ({
      ...prev,
      plantProfiles: [samplePlant],
      selectedPlantId: samplePlant.id,
    }));

    await AsyncStorage.setItem(STORAGE_KEYS.PLANT_PROFILES, JSON.stringify([samplePlant]));
  };

  // Placeholder implementations for helper functions
  const analyzeGrowthTrends = async (
    profile: PlantProfile,
    data: SensorSnapshot
  ): Promise<GrowthTrend[]> => [];
  const calculatePlantHealth = (
    data: SensorSnapshot,
    trends: GrowthTrend[],
    stress: StressIndicator[],
    profile: PlantProfile
  ): PlantHealthStatus => profile.health;
  const generatePredictions = (
    trends: GrowthTrend[],
    health: PlantHealthStatus,
    profile: PlantProfile
  ) => [];
  const calculateOverallConfidence = (
    data: SensorSnapshot,
    trends: GrowthTrend[],
    stress: StressIndicator[]
  ): ConfidenceLevel => 'high';
  const assessDataQuality = (data: SensorSnapshot) => 'good' as const;
  const generateGrowthResponse = async (question: string): Promise<ConversationalResponse> =>
    ({}) as ConversationalResponse;
  const generateLightingResponse = async (question: string): Promise<ConversationalResponse> =>
    ({}) as ConversationalResponse;
  const generateNutrientResponse = async (question: string): Promise<ConversationalResponse> =>
    ({}) as ConversationalResponse;
  const generateGeneralResponse = async (question: string): Promise<ConversationalResponse> =>
    ({}) as ConversationalResponse;

  return {
    // State
    ...state,

    // Core AI functions
    analyzeCurrentConditions,
    askAI,
    applyRecommendation,

    // Monitoring
    startMonitoring: () => setState(prev => ({ ...prev, monitoringActive: true })),
    stopMonitoring: () => setState(prev => ({ ...prev, monitoringActive: false })),

    // Plant management
    selectPlant: (plantId: string) => setState(prev => ({ ...prev, selectedPlantId: plantId })),

    // Utility
    isInitialized: isInitialized.current,
  };
};
