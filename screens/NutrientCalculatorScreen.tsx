import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  AccessibilityInfo,
  StyleSheet,
  Platform,
  I18nManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Slider from 'react-native-slider';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { useNutrientCalculator } from '@/hooks/useNutrientCalculator';
import { 
  Crop, 
  CropStage, 
  NutrientRecipe, 
  UnitSystem,
  COMMON_NUTRIENTS,
  COMMON_CROP_STAGES 
} from '@/types/nutrient-calculator';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { text } from '@/theme/text';

// Mock data for demonstration - In production, this would come from API/database
const MOCK_CROPS: Crop[] = [
  {
    id: 'lettuce',
    name: 'Lettuce',
    category: 'Leafy Greens',
    description: 'Fast-growing leafy vegetable',
    stages: COMMON_CROP_STAGES,
    nameAr: 'خس',
    categoryAr: 'خضروات ورقية',
    descriptionAr: 'خضروات ورقية سريعة النمو'
  },
  {
    id: 'tomato',
    name: 'Tomato',
    category: 'Fruit Vegetables',
    description: 'Popular fruiting vegetable',
    stages: COMMON_CROP_STAGES,
    nameAr: 'طماطم',
    categoryAr: 'خضروات ثمرية',
    descriptionAr: 'خضروات ثمرية شائعة'
  },
  {
    id: 'basil',
    name: 'Basil',
    category: 'Herbs',
    description: 'Aromatic culinary herb',
    stages: COMMON_CROP_STAGES,
    nameAr: 'ريحان',
    categoryAr: 'أعشاب',
    descriptionAr: 'عشب طبخ عطري'
  }
];

const MOCK_RECIPES: { [key: string]: NutrientRecipe[] } = {
  'lettuce_seedling': [{
    id: 'lettuce_seedling_basic',
    name: 'Basic Lettuce Seedling',
    cropId: 'lettuce',
    stageId: 'seedling',
    description: 'Gentle nutrient mix for young lettuce plants',
    nutrients: COMMON_NUTRIENTS.slice(0, 6), // First 6 nutrients
    ph: { min: 5.5, max: 6.5, optimal: 6.0 },
    ec: { min: 0.8, max: 1.2, optimal: 1.0 },
    waterVolume: 10,
    isOfficial: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    nameAr: 'خس شتلة أساسي',
    descriptionAr: 'خليط غذائي لطيف لنباتات الخس الصغيرة'
  }],
  'tomato_vegetative': [{
    id: 'tomato_veg_complete',
    name: 'Complete Tomato Vegetative',
    cropId: 'tomato',
    stageId: 'vegetative',
    description: 'Full spectrum nutrients for vegetative growth',
    nutrients: COMMON_NUTRIENTS,
    ph: { min: 5.8, max: 6.8, optimal: 6.3 },
    ec: { min: 1.2, max: 1.8, optimal: 1.5 },
    waterVolume: 10,
    isOfficial: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    nameAr: 'طماطم خضري كامل',
    descriptionAr: 'عناصر غذائية شاملة للنمو الخضري'
  }]
};

export default function NutrientCalculatorScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  
  const {
    selectedCrop,
    selectedStage,
    selectedRecipe,
    unitSystem,
    waterVolume,
    calculations,
    isLoading,
    error,
    isOffline,
    voiceEnabled,
    voiceRate,
    selectCrop,
    selectStage,
    selectRecipe,
    setWaterVolume,
    setUnitSystem,
    setVoiceEnabled,
    setVoiceRate,
    calculateRecipe,
    saveRecipe,
    speakInstructions,
    reset
  } = useNutrientCalculator();

  const [availableRecipes, setAvailableRecipes] = useState<NutrientRecipe[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update available recipes when crop/stage changes
  useEffect(() => {
    if (selectedCrop && selectedStage) {
      const key = `${selectedCrop.id}_${selectedStage.id}`;
      setAvailableRecipes(MOCK_RECIPES[key] || []);
    } else {
      setAvailableRecipes([]);
    }
  }, [selectedCrop, selectedStage]);

  // Accessibility announcements
  const announceChange = useCallback((message: string) => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, []);

  const handleCropSelect = useCallback((crop: Crop) => {
    selectCrop(crop);
    Haptics.selectionAsync();
    announceChange(t('nutrient.accessibility.crop_selected', { 
      crop: isRTL ? crop.nameAr : crop.name 
    }));
  }, [selectCrop, announceChange, t, isRTL]);

  const handleStageSelect = useCallback((stage: CropStage) => {
    selectStage(stage);
    Haptics.selectionAsync();
    announceChange(t('nutrient.accessibility.stage_selected', { 
      stage: isRTL ? stage.nameAr : stage.name 
    }));
  }, [selectStage, announceChange, t, isRTL]);

  const handleRecipeSelect = useCallback((recipe: NutrientRecipe) => {
    selectRecipe(recipe);
    Haptics.selectionAsync();
    announceChange(t('nutrient.accessibility.recipe_selected', { 
      recipe: isRTL ? recipe.nameAr : recipe.name 
    }));
  }, [selectRecipe, announceChange, t, isRTL]);

  const handleCalculate = useCallback(async () => {
    if (!selectedRecipe) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await calculateRecipe(selectedRecipe);
    
    if (calculations) {
      announceChange(t('nutrient.accessibility.calculation_complete', {
        count: calculations.calculations.length
      }));
    }
  }, [selectedRecipe, calculateRecipe, calculations, announceChange, t]);

  const handleSaveRecipe = useCallback(async () => {
    if (!selectedRecipe) return;
    
    try {
      await saveRecipe(selectedRecipe);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('nutrient.save.success_title'),
        t('nutrient.save.success_message'),
        [{ text: t('common.ok'), style: 'default' }]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('nutrient.save.error_title'),
        t('nutrient.save.error_message'),
        [{ text: t('common.ok'), style: 'default' }]
      );
    }
  }, [selectedRecipe, saveRecipe, t]);

  const handleVoiceInstructions = useCallback(async () => {
    if (!calculations) return;
    
    const instruction = calculations.calculations[0]?.voiceInstructions || 
                       calculations.calculations[0]?.voiceInstructionsAr;
    
    if (instruction) {
      await speakInstructions(instruction);
    }
  }, [calculations, speakInstructions]);

  const renderCropSelector = () => (
    <View style={styles.sectionContainer}>
      <Text 
        style={[styles.sectionTitle, isRTL && styles.rtlText]}
        accessibilityRole="header"
        accessibilityLevel={2}
      >
        {t('nutrient.select_crop')}
      </Text>
      
      <View style={styles.cropGrid}>
        {MOCK_CROPS.map((crop) => (
          <TouchableOpacity
            key={crop.id}
            style={[
              styles.cropCard,
              selectedCrop?.id === crop.id && styles.selectedCard
            ]}
            onPress={() => handleCropSelect(crop)}
            accessibilityRole="button"
            accessibilityLabel={t('nutrient.accessibility.select_crop', { 
              crop: isRTL ? crop.nameAr : crop.name 
            })}
            accessibilityHint={t('nutrient.accessibility.crop_hint')}
            accessibilityState={{ selected: selectedCrop?.id === crop.id }}
          >
            <View style={styles.cropIconContainer}>
              <Ionicons 
                name="leaf-outline" 
                size={24} 
                color={selectedCrop?.id === crop.id ? colors.primary : colors.text} 
              />
            </View>
            <Text style={[
              styles.cropName,
              isRTL && styles.rtlText,
              selectedCrop?.id === crop.id && styles.selectedText
            ]}>
              {isRTL ? crop.nameAr : crop.name}
            </Text>
            <Text style={[
              styles.cropCategory,
              isRTL && styles.rtlText
            ]}>
              {isRTL ? crop.categoryAr : crop.category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, isRTL && styles.rtlRow]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          accessibilityHint={t('nutrient.accessibility.back_hint')}
        >
          <Ionicons 
            name={isRTL ? "chevron-forward" : "chevron-back"} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>
            {t('nutrient.title')}
          </Text>
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
              <Text style={styles.offlineText}>{t('common.offline')}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setShowAdvanced(!showAdvanced)}
          style={styles.settingsButton}
          accessibilityRole="button"
          accessibilityLabel={t('nutrient.settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        accessibilityLabel={t('nutrient.accessibility.main_content')}
      >
        {/* Crop Selection */}
        {renderCropSelector()}

        {/* Stage Selection */}
        {selectedCrop && (
          <View style={styles.sectionContainer}>
            <Text 
              style={[styles.sectionTitle, isRTL && styles.rtlText]}
              accessibilityRole="header"
              accessibilityLevel={2}
            >
              {t('nutrient.select_stage')}
            </Text>
            
            <View style={styles.stageContainer}>
              {selectedCrop.stages.map((stage, index) => (
                <TouchableOpacity
                  key={stage.id}
                  style={[
                    styles.stageCard,
                    selectedStage?.id === stage.id && styles.selectedCard,
                    isRTL && styles.rtlCard
                  ]}
                  onPress={() => handleStageSelect(stage)}
                  accessibilityRole="button"
                  accessibilityLabel={t('nutrient.accessibility.select_stage', { 
                    stage: isRTL ? stage.nameAr : stage.name 
                  })}
                  accessibilityState={{ selected: selectedStage?.id === stage.id }}
                >
                  <View style={styles.stageHeader}>
                    <Text style={[
                      styles.stageNumber,
                      selectedStage?.id === stage.id && styles.selectedText
                    ]}>
                      {index + 1}
                    </Text>
                    <Text style={[
                      styles.stageName,
                      isRTL && styles.rtlText,
                      selectedStage?.id === stage.id && styles.selectedText
                    ]}>
                      {isRTL ? stage.nameAr : stage.name}
                    </Text>
                  </View>
                  <Text style={[
                    styles.stageDescription,
                    isRTL && styles.rtlText
                  ]}>
                    {isRTL ? stage.descriptionAr : stage.description}
                  </Text>
                  <Text style={styles.stageDuration}>
                    {t('nutrient.duration_days', { days: stage.durationDays })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recipe Selection */}
        {selectedStage && availableRecipes.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text 
              style={[styles.sectionTitle, isRTL && styles.rtlText]}
              accessibilityRole="header"
              accessibilityLevel={2}
            >
              {t('nutrient.select_recipe')}
            </Text>
            
            {availableRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={[
                  styles.recipeCard,
                  selectedRecipe?.id === recipe.id && styles.selectedCard
                ]}
                onPress={() => handleRecipeSelect(recipe)}
                accessibilityRole="button"
                accessibilityLabel={t('nutrient.accessibility.select_recipe', { 
                  recipe: isRTL ? recipe.nameAr : recipe.name 
                })}
                accessibilityState={{ selected: selectedRecipe?.id === recipe.id }}
              >
                <View style={[styles.recipeHeader, isRTL && styles.rtlRow]}>
                  <Text style={[
                    styles.recipeName,
                    isRTL && styles.rtlText,
                    selectedRecipe?.id === recipe.id && styles.selectedText
                  ]}>
                    {isRTL ? recipe.nameAr : recipe.name}
                  </Text>
                  {recipe.isOfficial && (
                    <View style={styles.officialBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.officialText}>{t('nutrient.official')}</Text>
                    </View>
                  )}
                </View>
                
                <Text style={[
                  styles.recipeDescription,
                  isRTL && styles.rtlText
                ]}>
                  {isRTL ? recipe.descriptionAr : recipe.description}
                </Text>
                
                <View style={[styles.recipeMetrics, isRTL && styles.rtlRow]}>
                  <Text style={styles.metricText}>
                    pH: {recipe.ph.optimal} ({recipe.ph.min}-{recipe.ph.max})
                  </Text>
                  <Text style={styles.metricText}>
                    EC: {recipe.ec.optimal} ({recipe.ec.min}-{recipe.ec.max})
                  </Text>
                  <Text style={styles.metricText}>
                    {t('nutrient.nutrients_count', { count: recipe.nutrients.length })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Water Volume Input */}
        {selectedRecipe && (
          <View style={styles.sectionContainer}>
            <Text 
              style={[styles.sectionTitle, isRTL && styles.rtlText]}
              accessibilityRole="header"
              accessibilityLevel={2}
            >
              {t('nutrient.water_volume')}
            </Text>
            
            <View style={styles.volumeContainer}>
              <TextInput
                style={[styles.volumeInput, isRTL && styles.rtlText]}
                value={waterVolume.toString()}
                onChangeText={(text) => {
                  const volume = parseFloat(text) || 0;
                  setWaterVolume(volume);
                }}
                keyboardType="numeric"
                accessibilityLabel={t('nutrient.accessibility.water_volume')}
                accessibilityHint={t('nutrient.accessibility.volume_hint')}
              />
              <Text style={[styles.volumeUnit, isRTL && styles.rtlText]}>
                {unitSystem.volume}
              </Text>
            </View>
            
            <Slider
              style={styles.volumeSlider}
              minimumValue={1}
              maximumValue={100}
              value={waterVolume}
              onValueChange={setWaterVolume}
              thumbStyle={styles.sliderThumb}
              trackStyle={styles.sliderTrack}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              accessibilityLabel={t('nutrient.accessibility.volume_slider')}
            />
          </View>
        )}

        {/* Calculate Button */}
        {selectedRecipe && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={[
                styles.calculateButton,
                isLoading && styles.disabledButton
              ]}
              onPress={handleCalculate}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={t('nutrient.calculate')}
              accessibilityHint={t('nutrient.accessibility.calculate_hint')}
              accessibilityState={{ disabled: isLoading }}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <Text style={styles.buttonText}>{t('common.loading')}</Text>
                ) : (
                  <>
                    <Ionicons name="calculator-outline" size={20} color="white" />
                    <Text style={[styles.buttonText, isRTL && styles.rtlText]}>
                      {t('nutrient.calculate')}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Results Section */}
        {calculations && (
          <View style={styles.sectionContainer}>
            <Text 
              style={[styles.sectionTitle, isRTL && styles.rtlText]}
              accessibilityRole="header"
              accessibilityLevel={2}
            >
              {t('nutrient.results')}
            </Text>
            
            {/* Recipe Summary */}
            <View style={styles.summaryCard}>
              <View style={[styles.summaryHeader, isRTL && styles.rtlRow]}>
                <Text style={[styles.summaryTitle, isRTL && styles.rtlText]}>
                  {isRTL ? calculations.recipe.nameAr : calculations.recipe.name}
                </Text>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>
                    {t(`nutrient.difficulty.${calculations.difficulty}`)}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.summaryDescription, isRTL && styles.rtlText]}>
                {isRTL ? calculations.recipe.descriptionAr : calculations.recipe.description}
              </Text>
              
              <View style={[styles.summaryMetrics, isRTL && styles.rtlRow]}>
                <Text style={styles.metricText}>
                  {t('nutrient.water_volume')}: {calculations.waterVolume} {calculations.unit}
                </Text>
                <Text style={styles.metricText}>
                  {t('nutrient.estimated_time')}: {calculations.estimatedTime} {t('common.minutes')}
                </Text>
              </View>
            </View>

            {/* Nutrient Instructions */}
            <View style={styles.instructionsContainer}>
              {calculations.calculations.map((calc, index) => (
                <View key={calc.element.id} style={styles.instructionCard}>
                  <View style={[styles.instructionHeader, isRTL && styles.rtlRow]}>
                    <View style={styles.nutrientInfo}>
                      <Text style={[styles.nutrientSymbol, isRTL && styles.rtlText]}>
                        {calc.element.symbol}
                      </Text>
                      <Text style={[styles.nutrientName, isRTL && styles.rtlText]}>
                        {calc.element.name}
                      </Text>
                    </View>
                    <View style={styles.amountContainer}>
                      <Text style={[styles.amount, isRTL && styles.rtlText]}>
                        {calc.actualAmount.toFixed(2)}
                      </Text>
                      <Text style={[styles.unit, isRTL && styles.rtlText]}>
                        {calc.unit}
                      </Text>
                    </View>
                  </View>
                  
                  <Text 
                    style={[styles.instructions, isRTL && styles.rtlText]}
                    accessibilityLabel={isRTL ? calc.instructionsAr : calc.instructions}
                  >
                    {isRTL ? calc.instructionsAr : calc.instructions}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.voiceButton}
                    onPress={() => speakInstructions(
                      isRTL ? calc.voiceInstructionsAr || calc.voiceInstructions : calc.voiceInstructions
                    )}
                    accessibilityRole="button"
                    accessibilityLabel={t('nutrient.accessibility.speak_instruction')}
                  >
                    <Ionicons name="volume-high-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Warnings */}
            {calculations.warnings.length > 0 && (
              <View style={styles.warningsContainer}>
                <Text style={[styles.warningsTitle, isRTL && styles.rtlText]}>
                  {t('nutrient.warnings')}
                </Text>
                {calculations.warnings.map((warning, index) => (
                  <View key={index} style={[styles.warningCard, isRTL && styles.rtlRow]}>
                    <Ionicons name="warning-outline" size={16} color={colors.warning} />
                    <Text style={[styles.warningText, isRTL && styles.rtlText]}>
                      {isRTL ? calculations.warningsAr?.[index] : warning}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            {calculations.tips.length > 0 && (
              <View style={styles.tipsContainer}>
                <Text style={[styles.tipsTitle, isRTL && styles.rtlText]}>
                  {t('nutrient.tips')}
                </Text>
                {calculations.tips.map((tip, index) => (
                  <View key={index} style={[styles.tipCard, isRTL && styles.rtlRow]}>
                    <Ionicons name="bulb-outline" size={16} color={colors.success} />
                    <Text style={[styles.tipText, isRTL && styles.rtlText]}>
                      {isRTL ? calculations.tipsAr?.[index] : tip}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={[styles.actionButtonsContainer, isRTL && styles.rtlRow]}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveRecipe}
                accessibilityRole="button"
                accessibilityLabel={t('nutrient.save_recipe')}
              >
                <Ionicons name="bookmark-outline" size={20} color={colors.primary} />
                <Text style={[styles.saveButtonText, isRTL && styles.rtlText]}>
                  {t('nutrient.save')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.voiceAllButton}
                onPress={handleVoiceInstructions}
                accessibilityRole="button"
                accessibilityLabel={t('nutrient.accessibility.speak_all')}
              >
                <Ionicons name="play-outline" size={20} color={colors.primary} />
                <Text style={[styles.voiceButtonText, isRTL && styles.rtlText]}>
                  {t('nutrient.speak_all')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
            <Text style={[styles.errorText, isRTL && styles.rtlText]}>
              {error}
            </Text>
          </View>
        )}

        {/* Advanced Settings */}
        {showAdvanced && (
          <View style={styles.sectionContainer}>
            <Text 
              style={[styles.sectionTitle, isRTL && styles.rtlText]}
              accessibilityRole="header"
              accessibilityLevel={2}
            >
              {t('nutrient.advanced_settings')}
            </Text>
            
            {/* Unit System */}
            <View style={styles.settingContainer}>
              <Text style={[styles.settingLabel, isRTL && styles.rtlText]}>
                {t('nutrient.unit_system')}
              </Text>
              <View style={styles.unitSystemButtons}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    unitSystem.type === 'metric' && styles.selectedUnitButton
                  ]}
                  onPress={() => setUnitSystem({
                    type: 'metric',
                    volume: 'L',
                    weight: 'g',
                    concentration: 'ppm'
                  })}
                  accessibilityRole="button"
                  accessibilityLabel={t('nutrient.metric')}
                  accessibilityState={{ selected: unitSystem.type === 'metric' }}
                >
                  <Text style={[
                    styles.unitButtonText,
                    unitSystem.type === 'metric' && styles.selectedUnitText
                  ]}>
                    {t('nutrient.metric')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    unitSystem.type === 'imperial' && styles.selectedUnitButton
                  ]}
                  onPress={() => setUnitSystem({
                    type: 'imperial',
                    volume: 'gal',
                    weight: 'oz',
                    concentration: 'oz/gal'
                  })}
                  accessibilityRole="button"
                  accessibilityLabel={t('nutrient.imperial')}
                  accessibilityState={{ selected: unitSystem.type === 'imperial' }}
                >
                  <Text style={[
                    styles.unitButtonText,
                    unitSystem.type === 'imperial' && styles.selectedUnitText
                  ]}>
                    {t('nutrient.imperial')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Voice Settings */}
            <View style={styles.settingContainer}>
              <Text style={[styles.settingLabel, isRTL && styles.rtlText]}>
                {t('nutrient.voice_feedback')}
              </Text>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setVoiceEnabled(!voiceEnabled)}
                accessibilityRole="switch"
                accessibilityLabel={t('nutrient.voice_feedback')}
                accessibilityState={{ checked: voiceEnabled }}
              >
                <Ionicons 
                  name={voiceEnabled ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={voiceEnabled ? colors.success : colors.border} 
                />
                <Text style={[styles.toggleText, isRTL && styles.rtlText]}>
                  {voiceEnabled ? t('common.enabled') : t('common.disabled')}
                </Text>
              </TouchableOpacity>
            </View>

            {voiceEnabled && (
              <View style={styles.settingContainer}>
                <Text style={[styles.settingLabel, isRTL && styles.rtlText]}>
                  {t('nutrient.voice_rate')}
                </Text>
                <Slider
                  style={styles.voiceRateSlider}
                  minimumValue={0.5}
                  maximumValue={2.0}
                  value={voiceRate}
                  onValueChange={setVoiceRate}
                  thumbStyle={styles.sliderThumb}
                  trackStyle={styles.sliderTrack}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  accessibilityLabel={t('nutrient.accessibility.voice_rate')}
                />
                <Text style={[styles.voiceRateText, isRTL && styles.rtlText]}>
                  {voiceRate.toFixed(1)}x
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...text.title,
    color: colors.text,
  },
  rtlText: {
    textAlign: I18nManager.isRTL ? 'left' : 'right',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  offlineText: {
    ...text.caption,
    color: colors.warning,
    marginLeft: spacing.xs,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...text.headline,
    color: colors.text,
    marginBottom: spacing.md,
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cropCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cropIconContainer: {
    marginBottom: spacing.sm,
  },
  cropName: {
    ...text.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cropCategory: {
    ...text.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  selectedText: {
    color: colors.primary,
  },
  stageContainer: {
    gap: spacing.sm,
  },
  stageCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rtlCard: {
    alignItems: 'flex-end',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stageNumber: {
    ...text.headline,
    color: colors.primary,
    marginRight: spacing.sm,
    width: 30,
    textAlign: 'center',
  },
  stageName: {
    ...text.body,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  stageDescription: {
    ...text.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  stageDuration: {
    ...text.caption,
    color: colors.textSecondary,
  },
  recipeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  recipeName: {
    ...text.body,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  officialText: {
    ...text.caption,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  recipeDescription: {
    ...text.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  recipeMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricText: {
    ...text.caption,
    color: colors.textSecondary,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  volumeInput: {
    ...text.title,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  volumeUnit: {
    ...text.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  volumeSlider: {
    height: 40,
  },
  sliderThumb: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  calculateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  buttonText: {
    ...text.body,
    fontWeight: '600',
    color: 'white',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    ...text.headline,
    color: colors.text,
    flex: 1,
  },
  difficultyBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  difficultyText: {
    ...text.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  summaryDescription: {
    ...text.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  summaryMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  instructionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  instructionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  nutrientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nutrientSymbol: {
    ...text.title,
    color: colors.primary,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  nutrientName: {
    ...text.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    ...text.title,
    color: colors.text,
    fontWeight: '600',
  },
  unit: {
    ...text.caption,
    color: colors.textSecondary,
  },
  instructions: {
    ...text.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  voiceButton: {
    alignSelf: 'flex-end',
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  warningsContainer: {
    marginBottom: spacing.md,
  },
  warningsTitle: {
    ...text.body,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  warningText: {
    ...text.body,
    color: colors.warning,
    marginLeft: spacing.sm,
    flex: 1,
  },
  tipsContainer: {
    marginBottom: spacing.md,
  },
  tipsTitle: {
    ...text.body,
    fontWeight: '600',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.successLight,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  tipText: {
    ...text.body,
    color: colors.success,
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  saveButtonText: {
    ...text.body,
    color: colors.primary,
    fontWeight: '600',
  },
  voiceAllButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  voiceButtonText: {
    ...text.body,
    color: 'white',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  errorText: {
    ...text.body,
    color: colors.error,
    flex: 1,
  },
  settingContainer: {
    marginBottom: spacing.md,
  },
  settingLabel: {
    ...text.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  unitSystemButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  unitButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedUnitButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  unitButtonText: {
    ...text.body,
    color: colors.text,
  },
  selectedUnitText: {
    color: colors.primary,
    fontWeight: '600',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleText: {
    ...text.body,
    color: colors.text,
  },
  voiceRateSlider: {
    height: 40,
    marginBottom: spacing.sm,
  },
  voiceRateText: {
    ...text.body,
    color: colors.text,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
}); 