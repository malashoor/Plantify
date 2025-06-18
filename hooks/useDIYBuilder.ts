import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/';
import * as Speech from 'expo-speech';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { supabase } from '../lib/supabase/supabase';
import {
  SystemType,
  SystemTemplate,
  UserBuild,
  DIYBuilderState,
  CalculationInput,
  CalculationResult,
  MaterialCalculation,
  MaterialsList,
  BuildStep,
  PumpCalculation,
  PumpRecommendation,
  BuildModification,
  UserBuildImage,
  SYSTEM_TYPES,
  COMMON_TOOLS,
  COMMON_MATERIALS,
  CALCULATION_FORMULAS,
} from '../types/diy-builder';
import { useI18n } from './useI18n';

const STORAGE_KEYS = {
  SAVED_BUILDS: '@diy_builder_saved_builds',
  CURRENT_BUILD: '@diy_builder_current_build',
  USER_SETTINGS: '@diy_builder_settings',
  OFFLINE_CHANGES: '@diy_builder_offline_changes',
};

export const useDIYBuilder = () => {
  const { t, locale } = useI18n();
  const [state, setState] = useState<DIYBuilderState>({
    selectedSystemType: null,
    selectedTemplate: null,
    currentBuild: null,
    calculationInputs: null,
    calculationResults: null,
    materialsList: null,
    currentStep: null,
    isLoading: false,
    error: null,
    units: {
      length: 'ft',
      volume: 'gal',
      weight: 'lb',
      currency: 'USD',
    },
    isOffline: false,
    savedBuilds: [],
    totalProgress: 0,
    stepProgress: {},
  });

  const isInitialized = useRef(false);

  // Initialize hook
  useEffect(() => {
    if (!isInitialized.current) {
      initializeBuilder();
      setupNetworkListener();
      isInitialized.current = true;
    }
  }, []);

  // Initialize builder with saved data
  const initializeBuilder = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Load saved builds
      const savedBuilds = await loadSavedBuilds();

      // Load current build
      const currentBuild = await loadCurrentBuild();

      // Load user settings
      const settings = await loadUserSettings();

      setState(prev => ({
        ...prev,
        savedBuilds,
        currentBuild,
        units: settings?.units || prev.units,
        isLoading: false,
      }));

      // Sync with Supabase if online
      const networkState = await NetInfo.fetch();
      if (networkState.isConnected) {
        await syncWithSupabase();
      }
    } catch (error) {
      console.error('Failed to initialize DIY builder:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load saved data',
        isLoading: false,
      }));
    }
  }, []);

  // Setup network listener
  const setupNetworkListener = useCallback(() => {
    const unsubscribe = NetInfo.addEventListener(networkState => {
      setState(prev => ({
        ...prev,
        isOffline: !networkState.isConnected,
      }));

      // Auto-sync when coming back online
      if (networkState.isConnected && prev.isOffline) {
        syncWithSupabase();
      }
    });

    return unsubscribe;
  }, []);

  // Load saved builds from AsyncStorage
  const loadSavedBuilds = useCallback(async (): Promise<UserBuild[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_BUILDS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load saved builds:', error);
      return [];
    }
  }, []);

  // Load current build from AsyncStorage
  const loadCurrentBuild = useCallback(async (): Promise<UserBuild | null> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_BUILD);
      if (data) {
        const build = JSON.parse(data);
        // Convert date strings back to Date objects
        build.startDate = new Date(build.startDate);
        if (build.targetCompletionDate) {
          build.targetCompletionDate = new Date(build.targetCompletionDate);
        }
        if (build.actualCompletionDate) {
          build.actualCompletionDate = new Date(build.actualCompletionDate);
        }
        build.lastModified = new Date(build.lastModified);
        return build;
      }
      return null;
    } catch (error) {
      console.error('Failed to load current build:', error);
      return null;
    }
  }, []);

  // Load user settings
  const loadUserSettings = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load user settings:', error);
      return null;
    }
  }, []);

  // Save builds to AsyncStorage
  const saveBuilds = useCallback(async (builds: UserBuild[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_BUILDS, JSON.stringify(builds));
    } catch (error) {
      console.error('Failed to save builds:', error);
    }
  }, []);

  // Save current build
  const saveCurrentBuild = useCallback(async (build: UserBuild | null) => {
    try {
      if (build) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_BUILD, JSON.stringify(build));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_BUILD);
      }
    } catch (error) {
      console.error('Failed to save current build:', error);
    }
  }, []);

  // Sync with Supabase
  const syncWithSupabase = useCallback(async () => {
    try {
      // Sync saved builds
      if (state.currentBuild && state.currentBuild.syncStatus === 'pending') {
        await saveBuildToSupabase(state.currentBuild);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, [state.currentBuild]);

  // Save build to Supabase
  const saveBuildToSupabase = useCallback(async (build: UserBuild) => {
    try {
      const { error } = await supabase.from('user_builds').upsert({
        id: build.id,
        user_id: build.userId,
        template_id: build.templateId,
        name: build.name,
        status: build.status,
        start_date: build.startDate.toISOString(),
        target_completion_date: build.targetCompletionDate?.toISOString(),
        actual_completion_date: build.actualCompletionDate?.toISOString(),
        current_step_id: build.currentStepId,
        completed_steps: build.completedSteps,
        modifications: build.modifications,
        notes: build.notes,
        estimated_cost: build.estimatedCost,
        actual_cost: build.actualCost,
        linked_nutrient_recipe: build.linkedNutrientRecipe,
        linked_lighting_setup: build.linkedLightingSetup,
        linked_sensors: build.linkedSensors,
        last_modified: build.lastModified.toISOString(),
      });

      if (error) throw error;

      // Update sync status
      setState(prev => ({
        ...prev,
        currentBuild: prev.currentBuild
          ? {
              ...prev.currentBuild,
              syncStatus: 'synced',
            }
          : null,
      }));
    } catch (error) {
      console.error('Failed to save build to Supabase:', error);
    }
  }, []);

  // Select system type
  const selectSystemType = useCallback(
    (systemType: SystemType) => {
      setState(prev => ({
        ...prev,
        selectedSystemType: systemType,
        selectedTemplate: null,
        calculationInputs: null,
        calculationResults: null,
      }));

      // Announce selection
      if (Platform.OS !== 'web') {
        Speech.speak(t('diy.voice.systemSelected', { system: systemType.name }), {
          language: locale,
        });
      }
    },
    [t, locale]
  );

  // Calculate materials based on inputs
  const calculateMaterials = useCallback(
    (inputs: CalculationInput): CalculationResult => {
      if (!state.selectedSystemType) {
        throw new Error('No system type selected');
      }

      const systemId = state.selectedSystemType.id as keyof typeof CALCULATION_FORMULAS;
      const formulas = CALCULATION_FORMULAS[systemId];
      const materials: MaterialCalculation[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];
      let totalCost = 0;

      try {
        // Calculate based on system type
        switch (systemId) {
          case 'nft':
            // NFT calculations
            const pipeLength = inputs.systemLength;
            const netPotCount = Math.ceil(inputs.systemLength / inputs.plantSpacing);
            const pumpGPH = Math.max(200, netPotCount * 15);
            const reservoirGallons = netPotCount * 0.5;

            materials.push({
              materialId: 'pvc_pipe_4in',
              calculatedQuantity: Math.ceil(pipeLength / 10) * 10, // Round up to nearest 10ft piece
              formula: 'Math.ceil(systemLength / 10) * 10',
              explanation: `${pipeLength}ft of 4" PVC pipe needed, rounded up to ${Math.ceil(pipeLength / 10) * 10}ft`,
              explanationAr: `${pipeLength} قدم من أنبوب PVC مقاس 4 بوصة مطلوب، مقرب إلى ${Math.ceil(pipeLength / 10) * 10} قدم`,
            });

            materials.push({
              materialId: 'net_pots_3in',
              calculatedQuantity: netPotCount,
              formula: 'Math.ceil(systemLength / plantSpacing)',
              explanation: `${netPotCount} net pots for ${inputs.plantSpacing}" plant spacing`,
              explanationAr: `${netPotCount} أواني شبكية لمسافة ${inputs.plantSpacing} بوصة بين النباتات`,
            });

            if (pumpGPH > 500) {
              warnings.push('High flow rate pump needed - consider multiple smaller pumps');
            }

            if (reservoirGallons < 5) {
              recommendations.push('Consider a larger reservoir for more stable nutrient levels');
            }
            break;

          case 'dwc':
            // DWC calculations
            const containerGallons = inputs.plantCount * 2;
            const airStoneCount = Math.ceil(containerGallons / 5);

            materials.push({
              materialId: 'container_5gal',
              calculatedQuantity: Math.ceil(containerGallons / 5),
              formula: 'Math.ceil((plantCount * 2) / 5)',
              explanation: `${Math.ceil(containerGallons / 5)} containers for ${inputs.plantCount} plants`,
              explanationAr: `${Math.ceil(containerGallons / 5)} حاويات لـ ${inputs.plantCount} نباتات`,
            });

            materials.push({
              materialId: 'air_stone',
              calculatedQuantity: airStoneCount,
              formula: 'Math.ceil(containerGallons / 5)',
              explanation: `${airStoneCount} air stones for proper oxygenation`,
              explanationAr: `${airStoneCount} أحجار هواء للأكسجة المناسبة`,
            });
            break;

          case 'dutch_bucket':
            // Dutch bucket calculations
            const bucketCount = inputs.plantCount;
            const drainPipeLength = inputs.plantCount * 2;

            materials.push({
              materialId: 'bucket_5gal',
              calculatedQuantity: bucketCount,
              formula: 'plantCount',
              explanation: `${bucketCount} buckets, one per plant`,
              explanationAr: `${bucketCount} دلو، واحد لكل نبات`,
            });

            materials.push({
              materialId: 'pvc_pipe_2in',
              calculatedQuantity: Math.ceil(drainPipeLength / 10) * 10,
              formula: 'Math.ceil((plantCount * 2) / 10) * 10',
              explanation: `${drainPipeLength}ft of 2" drain pipe needed`,
              explanationAr: `${drainPipeLength} قدم من أنبوب الصرف 2 بوصة مطلوب`,
            });
            break;
        }

        // Calculate total cost
        totalCost = materials.reduce((sum, material) => {
          const baseMaterial = COMMON_MATERIALS.find(m => m.id === material.materialId);
          return (
            sum + (baseMaterial ? baseMaterial.estimatedCost * material.calculatedQuantity : 0)
          );
        }, 0);

        // Add system-specific recommendations
        if (inputs.systemLength > 8) {
          recommendations.push('Consider multiple shorter channels for better distribution');
        }

        if (inputs.plantCount > 20) {
          recommendations.push('Large system - consider automation for monitoring');
        }

        return {
          materials,
          totalCost,
          warnings,
          recommendations,
        };
      } catch (error) {
        console.error('Calculation error:', error);
        throw new Error('Failed to calculate materials');
      }
    },
    [state.selectedSystemType]
  );

  // Generate materials list
  const generateMaterialsList = useCallback(
    async (
      results: CalculationResult,
      format: 'pdf' | 'csv' | 'json' = 'pdf'
    ): Promise<MaterialsList> => {
      const materialsListItems = results.materials.map(calc => {
        const baseMaterial = COMMON_MATERIALS.find(m => m.id === calc.materialId);
        if (!baseMaterial) throw new Error(`Material ${calc.materialId} not found`);

        return {
          material: baseMaterial,
          quantity: calc.calculatedQuantity,
          estimatedCost: baseMaterial.estimatedCost * calc.calculatedQuantity,
          priority: 'essential' as const,
          category: baseMaterial.category,
          suppliers: baseMaterial.suppliers,
        };
      });

      const materialsList: MaterialsList = {
        id: `materials_${Date.now()}`,
        buildId: state.currentBuild?.id || 'temp',
        materials: materialsListItems,
        totalCost: results.totalCost,
        currency: state.units.currency,
        generatedDate: new Date(),
        exportFormat: format,
        includeSuppliers: true,
        includeAlternatives: true,
      };

      setState(prev => ({ ...prev, materialsList }));
      return materialsList;
    },
    [state.currentBuild, state.units.currency]
  );

  // Export materials list
  const exportMaterialsList = useCallback(
    async (materialsList: MaterialsList, format: 'pdf' | 'csv' | 'json' = 'pdf') => {
      try {
        let content = '';
        let filename = '';
        let mimeType = '';

        switch (format) {
          case 'csv':
            content = generateCSV(materialsList);
            filename = `materials_list_${Date.now()}.csv`;
            mimeType = 'text/csv';
            break;
          case 'json':
            content = JSON.stringify(materialsList, null, 2);
            filename = `materials_list_${Date.now()}.json`;
            mimeType = 'application/json';
            break;
          case 'pdf':
            // For PDF, we'd need to use a PDF generation library
            // For now, export as formatted text
            content = generateFormattedText(materialsList);
            filename = `materials_list_${Date.now()}.txt`;
            mimeType = 'text/plain';
            break;
        }

        // Write to temporary file
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, content);

        // Share the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle: t('diy.export.shareTitle'),
          });
        }

        // Announce completion
        if (Platform.OS !== 'web') {
          Speech.speak(t('diy.voice.exportComplete', { format: format.toUpperCase() }), {
            language: locale,
          });
        }
      } catch (error) {
        console.error('Export failed:', error);
        Alert.alert(t('diy.export.error'), t('diy.export.errorMessage'));
      }
    },
    [t, locale]
  );

  // Generate CSV content
  const generateCSV = useCallback((materialsList: MaterialsList): string => {
    const headers = ['Item', 'Quantity', 'Unit', 'Cost Each', 'Total Cost', 'Category', 'Supplier'];
    const rows = materialsList.materials.map(item => [
      item.material.name,
      item.quantity.toString(),
      item.material.unit,
      `$${item.material.estimatedCost.toFixed(2)}`,
      `$${item.estimatedCost.toFixed(2)}`,
      item.category,
      item.suppliers[0]?.name || 'N/A',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }, []);

  // Generate formatted text
  const generateFormattedText = useCallback((materialsList: MaterialsList): string => {
    let content = `HYDROPONIC SYSTEM - MATERIALS LIST\n`;
    content += `Generated: ${materialsList.generatedDate.toLocaleDateString()}\n`;
    content += `Total Estimated Cost: $${materialsList.totalCost.toFixed(2)}\n\n`;

    materialsList.materials.forEach((item, index) => {
      content += `${index + 1}. ${item.material.name}\n`;
      content += `   Quantity: ${item.quantity} ${item.material.unit}\n`;
      content += `   Cost: $${item.material.estimatedCost.toFixed(2)} each = $${item.estimatedCost.toFixed(2)} total\n`;
      content += `   Category: ${item.category}\n`;
      if (item.suppliers.length > 0) {
        content += `   Supplier: ${item.suppliers[0].name} (${item.suppliers[0].website})\n`;
      }
      content += `\n`;
    });

    return content;
  }, []);

  // Start new build
  const startNewBuild = useCallback(
    async (templateId: string, buildName: string, calculationInputs: CalculationInput) => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));

        const results = calculateMaterials(calculationInputs);

        const newBuild: UserBuild = {
          id: `build_${Date.now()}`,
          userId: 'current_user', // TODO: Get from auth context
          templateId,
          name: buildName,
          status: 'planning',
          startDate: new Date(),
          currentStepId: undefined,
          completedSteps: [],
          modifications: [],
          notes: '',
          images: [],
          estimatedCost: results.totalCost,
          isOffline: state.isOffline,
          syncStatus: state.isOffline ? 'pending' : 'synced',
          lastModified: new Date(),
        };

        setState(prev => ({
          ...prev,
          currentBuild: newBuild,
          calculationInputs,
          calculationResults: results,
          isLoading: false,
        }));

        // Save locally
        await saveCurrentBuild(newBuild);

        // Save to Supabase if online
        if (!state.isOffline) {
          await saveBuildToSupabase(newBuild);
        }

        // Generate materials list
        await generateMaterialsList(results);

        // Announce start
        if (Platform.OS !== 'web') {
          Speech.speak(t('diy.voice.buildStarted', { name: buildName }), { language: locale });
        }
      } catch (error) {
        console.error('Failed to start build:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to start build',
          isLoading: false,
        }));
      }
    },
    [
      calculateMaterials,
      state.isOffline,
      saveCurrentBuild,
      saveBuildToSupabase,
      generateMaterialsList,
      t,
      locale,
    ]
  );

  // Complete build step
  const completeStep = useCallback(
    async (stepId: string, notes?: string, images?: UserBuildImage[]) => {
      if (!state.currentBuild) return;

      const updatedBuild: UserBuild = {
        ...state.currentBuild,
        completedSteps: [...state.currentBuild.completedSteps, stepId],
        notes: notes ? `${state.currentBuild.notes}\n${notes}` : state.currentBuild.notes,
        images: images ? [...state.currentBuild.images, ...images] : state.currentBuild.images,
        lastModified: new Date(),
        syncStatus: state.isOffline ? 'pending' : 'synced',
      };

      setState(prev => ({
        ...prev,
        currentBuild: updatedBuild,
        stepProgress: {
          ...prev.stepProgress,
          [stepId]: 100,
        },
      }));

      await saveCurrentBuild(updatedBuild);

      if (!state.isOffline) {
        await saveBuildToSupabase(updatedBuild);
      }

      // Announce completion
      if (Platform.OS !== 'web') {
        Speech.speak(t('diy.voice.stepCompleted'), { language: locale });
      }
    },
    [state.currentBuild, state.isOffline, saveCurrentBuild, saveBuildToSupabase, t, locale]
  );

  // Calculate pump requirements
  const calculatePumpRequirements = useCallback(
    (systemLength: number, systemHeight: number, plantCount: number): PumpCalculation => {
      // Basic pump sizing formula
      const flowRate = Math.max(200, plantCount * 15); // GPH
      const headHeight = systemHeight + 2; // Add 2ft for fittings and resistance
      const powerConsumption = (flowRate / 100) * 10; // Rough estimate

      const recommendations: PumpRecommendation[] = [
        {
          model: 'VIVOSUN 400GPH',
          brand: 'VIVOSUN',
          flowRate: 400,
          maxHead: 8,
          powerConsumption: 25,
          estimatedCost: 35,
          features: ['Submersible', 'Adjustable flow', 'Quiet operation'],
          suitable: flowRate <= 400 && headHeight <= 8,
          reason:
            flowRate > 400
              ? 'Flow rate too high'
              : headHeight > 8
                ? 'Head height too high'
                : undefined,
        },
        {
          model: 'EcoPlus 728450',
          brand: 'EcoPlus',
          flowRate: 633,
          maxHead: 10,
          powerConsumption: 35,
          estimatedCost: 45,
          features: ['High efficiency', 'Durable', 'Easy maintenance'],
          suitable: flowRate <= 633 && headHeight <= 10,
          reason:
            flowRate > 633
              ? 'Flow rate too high'
              : headHeight > 10
                ? 'Head height too high'
                : undefined,
        },
      ];

      return {
        flowRate,
        headHeight,
        recommendedPumps: recommendations,
        powerConsumption,
      };
    },
    []
  );

  // Voice feedback
  const announceProgress = useCallback(
    (message: string) => {
      if (Platform.OS !== 'web') {
        Speech.speak(message, {
          language: locale,
          rate: 0.9,
        });
      }
    },
    [locale]
  );

  // Get system types with current locale
  const getSystemTypes = useCallback((): SystemType[] => {
    return SYSTEM_TYPES.map(system => ({
      ...system,
      name: locale === 'ar' && system.nameAr ? system.nameAr : system.name,
      description:
        locale === 'ar' && system.descriptionAr ? system.descriptionAr : system.description,
      advantages: locale === 'ar' && system.advantagesAr ? system.advantagesAr : system.advantages,
      disadvantages:
        locale === 'ar' && system.disadvantagesAr ? system.disadvantagesAr : system.disadvantages,
      bestFor: locale === 'ar' && system.bestForAr ? system.bestForAr : system.bestFor,
    }));
  }, [locale]);

  return {
    // State
    ...state,

    // System management
    systemTypes: getSystemTypes(),
    selectSystemType,

    // Calculations
    calculateMaterials,
    calculatePumpRequirements,

    // Materials and export
    generateMaterialsList,
    exportMaterialsList,

    // Build management
    startNewBuild,
    completeStep,

    // Voice and accessibility
    announceProgress,

    // Utility
    isInitialized: isInitialized.current,
  };
};
