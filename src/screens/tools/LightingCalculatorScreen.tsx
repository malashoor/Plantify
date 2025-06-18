import React, { useCallback, useEffect, useState, useRef } from 'react';
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
  I18nManager,
  Dimensions,
  type ViewStyle,
  type TextStyle,
  type StyleProp
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Slider from 'react-native-slider';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import { useLightingCalculator } from '@hooks/useLightingCalculator';
import { useNutrientCalculator } from '@hooks/useNutrientCalculator';
import { 
  LEDSpecification, 
  PhotoperiodSchedule,
  SpectrumRatio,
  COMMON_CROP_STAGES 
} from '@types/lighting-calculator';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { text } from '@theme/text';
import BackHeader from '@components/layout/BackHeader';
import { KeyboardDismissView } from '@components/utils/KeyboardDismissView';
import { VoiceAnnouncement } from '@components/utils/VoiceAnnouncement';
import { useFocusManagement } from '@hooks/useFocusManagement';
import { useAccessibility } from '@contexts/AccessibilityContext';
import { withAccessibility } from '@components/utils/withAccessibility';

const { width: screenWidth } = Dimensions.get('window');

interface SpectrumChartProps {
  spectrum: SpectrumRatio;
  isRTL: boolean;
}

const SpectrumChart: React.FC<SpectrumChartProps> = ({ spectrum, isRTL }) => {
  const chartWidth = screenWidth - (spacing.md * 4);
  const chartHeight = 100;
  const barWidth = chartWidth / 6; // 6 spectrum bands
  
  const spectrumData = [
    { name: 'UV', value: spectrum.uv || 0, color: '#8B5CF6' },
    { name: 'Blue', value: spectrum.blue, color: '#3B82F6' },
    { name: 'Green', value: spectrum.green || 0, color: '#10B981' },
    { name: 'White', value: spectrum.white, color: '#F3F4F6' },
    { name: 'Red', value: spectrum.red, color: '#EF4444' },
    { name: 'Far Red', value: spectrum.farRed || 0, color: '#7C2D12' }
  ];

  return (
    <View style={styles.spectrumChart}>
      <Svg width={chartWidth} height={chartHeight}>
        {spectrumData.map((band, index) => {
          const x = isRTL ? chartWidth - ((index + 1) * barWidth) : index * barWidth;
          const barHeight = (band.value / 100) * (chartHeight - 20);
          const y = chartHeight - barHeight - 10;
          
          return (
            <React.Fragment key={band.name}>
              <Rect
                x={x + 5}
                y={y}
                width={barWidth - 10}
                height={barHeight}
                fill={band.color}
                rx={4}
                opacity={0.8}
              />
              <SvgText
                x={x + barWidth / 2}
                y={chartHeight - 2}
                fontSize="10"
                fill={colors.text}
                textAnchor="middle"
              >
                {band.name}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={y - 5}
                fontSize="12"
                fill={colors.text}
                textAnchor="middle"
                fontWeight="bold"
              >
                {band.value}%
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

interface PhotoperiodTimelineProps {
  photoperiod: PhotoperiodSchedule;
  isRTL: boolean;
}

const PhotoperiodTimeline: React.FC<PhotoperiodTimelineProps> = ({ photoperiod, isRTL }) => {
  const timelineWidth = screenWidth - (spacing.md * 4);
  const timelineHeight = 60;
  
  const lightHours = photoperiod.lightHours;
  const darkHours = photoperiod.darkHours;
  const totalHours = lightHours + darkHours;
  
  const lightWidth = (lightHours / totalHours) * timelineWidth;
  const darkWidth = (darkHours / totalHours) * timelineWidth;
  
  return (
    <View style={styles.photoperiodTimeline}>
      <View style={styles.timelineContainer}>
        <View style={[styles.timelineSegment, { 
          width: lightWidth, 
          backgroundColor: colors.warning,
          borderTopLeftRadius: isRTL ? 0 : 8,
          borderBottomLeftRadius: isRTL ? 0 : 8,
          borderTopRightRadius: isRTL ? 8 : 0,
          borderBottomRightRadius: isRTL ? 8 : 0
        }]}>
          <Text style={styles.timelineText}>{lightHours}h Light</Text>
        </View>
        <View style={[styles.timelineSegment, { 
          width: darkWidth, 
          backgroundColor: colors.textSecondary,
          borderTopLeftRadius: isRTL ? 8 : 0,
          borderBottomLeftRadius: isRTL ? 8 : 0,
          borderTopRightRadius: isRTL ? 0 : 8,
          borderBottomRightRadius: isRTL ? 0 : 8
        }]}>
          <Text style={[styles.timelineText, { color: 'white' }]}>{darkHours}h Dark</Text>
        </View>
      </View>
      
      <View style={styles.timeMarkers}>
        <Text style={styles.timeMarker}>{photoperiod.sunriseTime}</Text>
        <Text style={styles.timeMarker}>{photoperiod.sunsetTime}</Text>
      </View>
    </View>
  );
};

const AccessibleSlider = withAccessibility(Slider, {
  accessibilityRole: 'adjustable',
});

const AccessibleTextInput = withAccessibility(TextInput, {
  accessibilityRole: 'textbox',
});

export default function LightingCalculatorScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const isRTL = i18n.language === 'ar';
  const { elementRef, setFocus, moveFocusToNext } = useFocusManagement();
  const { isScreenReaderEnabled, voiceOverSpeedRate } = useAccessibility();
  
  const cropListRef = useRef(null);
  const stageListRef = useRef(null);
  const ledListRef = useRef(null);
  const distanceSliderRef = useRef(null);
  const photoperiodListRef = useRef(null);
  const calculateButtonRef = useRef(null);
  
  const {
    selectedCrop,
    selectedStage,
    selectedLED,
    distance,
    photoperiod,
    calculations,
    isLoading,
    error,
    isOffline,
    voiceEnabled,
    units,
    powerCost,
    selectCrop,
    selectStage,
    selectLED,
    setDistance,
    setPhotoperiod,
    setUnits,
    setPowerCost,
    setVoiceEnabled,
    calculateLighting,
    saveLightingSetup,
    speakInstructions,
    commonPhotoperiods,
    commonLEDs,
    reset
  } = useLightingCalculator();
  
  const { commonNutrients, commonStages } = useNutrientCalculator();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [setupName, setSetupName] = useState('');
  const [lastAnnouncement, setLastAnnouncement] = useState('');

  const MOCK_CROPS = [
    { id: 'lettuce', name: 'Lettuce', nameAr: 'خس' },
    { id: 'tomato', name: 'Tomato', nameAr: 'طماطم' },
    { id: 'basil', name: 'Basil', nameAr: 'ريحان' }
  ];

  const announceChange = useCallback((message: string) => {
    if (!isScreenReaderEnabled) return;
    setLastAnnouncement(message);
  }, [isScreenReaderEnabled]);

  const handleCropSelect = useCallback((crop: any) => {
    selectCrop(crop);
    Haptics.selectionAsync();
    announceChange(t('lighting.accessibility.crop_selected', { 
      crop: isRTL ? crop.nameAr : crop.name 
    }));
    moveFocusToNext(stageListRef);
  }, [selectCrop, announceChange, t, isRTL, moveFocusToNext]);

  const handleStageSelect = useCallback((stage: any) => {
    selectStage(stage);
    Haptics.selectionAsync();
    announceChange(t('lighting.accessibility.stage_selected', { 
      stage: isRTL ? stage.nameAr : stage.name 
    }));
    moveFocusToNext(ledListRef);
  }, [selectStage, announceChange, t, isRTL, moveFocusToNext]);

  const handleLEDSelect = useCallback((led: LEDSpecification) => {
    selectLED(led);
    Haptics.selectionAsync();
    announceChange(t('lighting.accessibility.led_selected', { 
      led: led.name,
      ppfd: led.ppfd,
      coverage: led.coverage
    }));
    moveFocusToNext(distanceSliderRef);
  }, [selectLED, announceChange, t, moveFocusToNext]);

  const handleDistanceChange = useCallback((value: number) => {
    setDistance(value);
    if (isScreenReaderEnabled) {
      announceChange(t('lighting.accessibility.distance_changed', {
        distance: value,
        unit: units === 'metric' ? 'centimeters' : 'inches'
      }));
    }
  }, [setDistance, isScreenReaderEnabled, announceChange, t, units]);

  const handlePhotoperiodSelect = useCallback((period: PhotoperiodSchedule) => {
    setPhotoperiod(period);
    Haptics.selectionAsync();
    announceChange(t('lighting.accessibility.photoperiod_selected', {
      light: period.lightHours,
      dark: period.darkHours
    }));
    moveFocusToNext(calculateButtonRef);
  }, [setPhotoperiod, announceChange, t, moveFocusToNext]);

  const handleCalculate = useCallback(async () => {
    if (!selectedLED) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await calculateLighting();
    
    if (calculations) {
      const message = t('lighting.accessibility.calculation_complete', {
        dli: calculations.dli.toFixed(1),
        power: calculations.powerConsumption.toFixed(1),
        cost: calculations.estimatedCost.toFixed(2)
      });
      announceChange(message);
    }
  }, [selectedLED, calculateLighting, calculations, announceChange, t]);

  const handleSaveSetup = useCallback(async () => {
    if (!selectedLED || !setupName) return;
    
    try {
      await saveLightingSetup(setupName);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      announceChange(t('lighting.accessibility.setup_saved', {
        name: setupName
      }));
      setSetupName('');
    } catch (err) {
      console.error('Error saving setup:', err);
      announceChange(t('lighting.accessibility.setup_save_error'));
    }
  }, [selectedLED, setupName, saveLightingSetup, announceChange, t]);

  // Voice announcement for screen reader
  useEffect(() => {
    if (lastAnnouncement) {
      const timer = setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(lastAnnouncement);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [lastAnnouncement]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <BackHeader 
        title={t('lighting.title')}
        accessibilityLabel={t('lighting.accessibility.screen_title')}
      />
      
      <KeyboardDismissView>
        <ScrollView 
          style={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          accessibilityRole="scrollview"
          accessibilityLabel={t('lighting.accessibility.main_content')}
        >
          {/* Voice Announcement */}
          <VoiceAnnouncement
            message={lastAnnouncement}
            shouldSpeak={isScreenReaderEnabled}
            rate={voiceOverSpeedRate}
          />

          {/* Crop Selection */}
          <View 
            ref={cropListRef}
            style={styles.section}
            accessibilityRole="radiogroup"
            accessibilityLabel={t('lighting.accessibility.crop_section')}
          >
            <Text style={styles.sectionTitle}>{t('lighting.crop_selection')}</Text>
            <View style={styles.cropList}>
              {MOCK_CROPS.map((crop) => (
                <TouchableOpacity
                  key={crop.id}
                  style={[
                    styles.cropButton,
                    selectedCrop?.id === crop.id && styles.cropButtonSelected
                  ]}
                  onPress={() => handleCropSelect(crop)}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel={isRTL ? crop.nameAr : crop.name}
                  accessibilityState={{ 
                    selected: selectedCrop?.id === crop.id,
                    checked: selectedCrop?.id === crop.id
                  }}
                  accessibilityHint={t('lighting.accessibility.crop_hint')}
                >
                  <Text style={[
                    styles.cropButtonText,
                    selectedCrop?.id === crop.id && styles.cropButtonTextSelected
                  ]}>
                    {isRTL ? crop.nameAr : crop.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Growth Stage Selection */}
          {selectedCrop && (
            <View 
              ref={stageListRef}
              style={styles.section}
              accessibilityRole="radiogroup"
              accessibilityLabel={t('lighting.accessibility.stage_section')}
            >
              <Text style={styles.sectionTitle}>{t('lighting.stage_selection')}</Text>
              <View style={styles.stageList}>
                {COMMON_CROP_STAGES.map((stage) => (
                  <TouchableOpacity
                    key={stage.id}
                    style={[
                      styles.stageButton,
                      selectedStage?.id === stage.id && styles.stageButtonSelected
                    ]}
                    onPress={() => handleStageSelect(stage)}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityLabel={isRTL ? stage.nameAr : stage.name}
                    accessibilityState={{ 
                      selected: selectedStage?.id === stage.id,
                      checked: selectedStage?.id === stage.id
                    }}
                    accessibilityHint={t('lighting.accessibility.stage_hint')}
                  >
                    <Text style={[
                      styles.stageButtonText,
                      selectedStage?.id === stage.id && styles.stageButtonTextSelected
                    ]}>
                      {isRTL ? stage.nameAr : stage.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* LED Selection */}
          {selectedCrop && selectedStage && (
            <View 
              ref={ledListRef}
              style={styles.section}
              accessibilityRole="radiogroup"
              accessibilityLabel={t('lighting.accessibility.led_section')}
            >
              <Text style={styles.sectionTitle}>{t('lighting.led_selection')}</Text>
              {commonLEDs.map((led) => (
                <TouchableOpacity
                  key={led.id}
                  style={[
                    styles.ledCard,
                    selectedLED?.id === led.id && styles.ledCardSelected
                  ]}
                  onPress={() => handleLEDSelect(led)}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel={t('lighting.accessibility.led_option', {
                    name: led.name,
                    wattage: led.wattage,
                    ppfd: led.ppfd,
                    coverage: led.coverage
                  })}
                  accessibilityState={{ 
                    selected: selectedLED?.id === led.id,
                    checked: selectedLED?.id === led.id
                  }}
                  accessibilityHint={t('lighting.accessibility.led_hint')}
                >
                  <View style={styles.ledHeader}>
                    <Text style={styles.ledName}>{led.name}</Text>
                    <Text style={styles.ledPower}>{led.wattage}W</Text>
                  </View>
                  
                  <SpectrumChart spectrum={led.spectrum} isRTL={isRTL} />
                  
                  <View style={styles.ledMetrics}>
                    <Text style={styles.metricText}>
                      PPFD: {led.ppfd} μmol/m²/s
                    </Text>
                    <Text style={styles.metricText}>
                      Coverage: {led.coverage}m²
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Distance Control */}
          {selectedLED && (
            <View 
              ref={distanceSliderRef}
              style={styles.section}
              accessibilityLabel={t('lighting.accessibility.distance_section')}
            >
              <Text style={styles.sectionTitle}>{t('lighting.distance')}</Text>
              <View style={styles.distanceControl}>
                <AccessibleSlider
                  value={distance}
                  onValueChange={handleDistanceChange}
                  minimumValue={20}
                  maximumValue={200}
                  step={1}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                  style={styles.slider}
                  accessibilityLabel={t('lighting.accessibility.distance_slider')}
                  accessibilityHint={t('lighting.accessibility.distance_hint')}
                />
                <Text 
                  style={styles.distanceText}
                  accessibilityLabel={t('lighting.accessibility.current_distance', {
                    distance,
                    unit: units === 'metric' ? 'centimeters' : 'inches'
                  })}
                >
                  {distance} {units === 'metric' ? 'cm' : 'in'}
                </Text>
              </View>
            </View>
          )}

          {/* Photoperiod Selection */}
          {selectedLED && (
            <View 
              ref={photoperiodListRef}
              style={styles.section}
              accessibilityRole="radiogroup"
              accessibilityLabel={t('lighting.accessibility.photoperiod_section')}
            >
              <Text style={styles.sectionTitle}>{t('lighting.photoperiod')}</Text>
              <View style={styles.photoperiodList}>
                {commonPhotoperiods.map((period, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.photoperiodButton,
                      photoperiod?.lightHours === period.lightHours && 
                      styles.photoperiodButtonSelected
                    ]}
                    onPress={() => handlePhotoperiodSelect(period)}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityLabel={t('lighting.accessibility.photoperiod_option', {
                      light: period.lightHours,
                      dark: period.darkHours
                    })}
                    accessibilityState={{ 
                      selected: photoperiod?.lightHours === period.lightHours,
                      checked: photoperiod?.lightHours === period.lightHours
                    }}
                    accessibilityHint={t('lighting.accessibility.photoperiod_hint')}
                  >
                    <Text style={[
                      styles.photoperiodButtonText,
                      photoperiod?.lightHours === period.lightHours && 
                      styles.photoperiodButtonTextSelected
                    ]}>
                      {period.lightHours}/{period.darkHours}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Calculate Button */}
          {selectedLED && photoperiod && (
            <TouchableOpacity
              ref={calculateButtonRef}
              style={styles.calculateButton}
              onPress={handleCalculate}
              disabled={isLoading}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={t('lighting.accessibility.calculate_button')}
              accessibilityState={{ 
                disabled: isLoading,
                busy: isLoading
              }}
              accessibilityHint={t('lighting.accessibility.calculate_hint')}
            >
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <Text style={styles.calculateButtonText}>
                  {isLoading ? t('lighting.calculating') : t('lighting.calculate')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Results */}
          {calculations && (
            <View 
              style={styles.section}
              accessibilityLabel={t('lighting.accessibility.results_section')}
            >
              <Text style={styles.sectionTitle}>{t('lighting.results')}</Text>
              
              <View 
                style={styles.resultCard}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={t('lighting.accessibility.results_summary', {
                  dli: calculations.dli.toFixed(1),
                  power: calculations.powerConsumption.toFixed(1),
                  cost: calculations.estimatedCost.toFixed(2)
                })}
              >
                <Text style={styles.resultTitle}>
                  {t('lighting.daily_light_integral')}
                </Text>
                <Text style={styles.resultValue}>
                  {calculations.dli.toFixed(1)} mol/m²/day
                </Text>
                
                <Text style={styles.resultTitle}>
                  {t('lighting.power_consumption')}
                </Text>
                <Text style={styles.resultValue}>
                  {calculations.powerConsumption.toFixed(1)} kWh/day
                </Text>
                
                <Text style={styles.resultTitle}>
                  {t('lighting.estimated_cost')}
                </Text>
                <Text style={styles.resultValue}>
                  ${calculations.estimatedCost.toFixed(2)}/day
                </Text>
              </View>
              
              <View style={styles.saveSetup}>
                <AccessibleTextInput
                  style={styles.setupNameInput}
                  value={setupName}
                  onChangeText={setSetupName}
                  placeholder={t('lighting.setup_name_placeholder')}
                  accessibilityLabel={t('lighting.accessibility.setup_name_input')}
                  accessibilityHint={t('lighting.accessibility.setup_name_hint')}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveSetup}
                  disabled={!setupName}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={t('lighting.accessibility.save_button')}
                  accessibilityState={{ disabled: !setupName }}
                  accessibilityHint={t('lighting.accessibility.save_hint')}
                >
                  <Text style={styles.saveButtonText}>
                    {t('lighting.save_setup')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardDismissView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: text.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  cropList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cropButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cropButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cropButtonText: {
    color: colors.text,
    fontSize: text.md,
  },
  cropButtonTextSelected: {
    color: colors.white,
  },
  stageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stageButtonText: {
    color: colors.text,
    fontSize: text.md,
  },
  stageButtonTextSelected: {
    color: colors.white,
  },
  ledCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ledCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  ledHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ledName: {
    fontSize: text.lg,
    fontWeight: '600',
    color: colors.text,
  },
  ledPower: {
    fontSize: text.md,
    color: colors.textSecondary,
  },
  spectrumChart: {
    marginVertical: spacing.md,
  },
  ledMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metricText: {
    color: colors.textSecondary,
    fontSize: text.sm,
  },
  distanceControl: {
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  distanceText: {
    fontSize: text.md,
    color: colors.text,
    marginTop: spacing.xs,
  },
  photoperiodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  photoperiodButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoperiodButtonSelected: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  photoperiodButtonText: {
    color: colors.text,
    fontSize: text.md,
  },
  photoperiodButtonTextSelected: {
    color: colors.white,
  },
  photoperiodTimeline: {
    marginTop: spacing.md,
  },
  timelineContainer: {
    flexDirection: 'row',
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  timelineSegment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineText: {
    color: colors.white,
    fontSize: text.sm,
    fontWeight: '500',
  },
  timeMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  timeMarker: {
    color: colors.textSecondary,
    fontSize: text.sm,
  },
  calculateButton: {
    marginVertical: spacing.md,
  },
  gradientButton: {
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: colors.white,
    fontSize: text.lg,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
  },
  resultTitle: {
    fontSize: text.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultValue: {
    fontSize: text.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  saveSetup: {
    marginTop: spacing.md,
  },
  setupNameInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: text.md,
    fontWeight: '600',
  },
}); 