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
  I18nManager,
  Dimensions
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
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import { useLightingCalculator } from '@/hooks/useLightingCalculator';
import { useNutrientCalculator } from '@/hooks/useNutrientCalculator';
import { 
  LEDSpecification, 
  PhotoperiodSchedule,
  SpectrumRatio,
  COMMON_CROP_STAGES 
} from '@/types/lighting-calculator';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { text } from '@/theme/text';

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

export default function LightingConfigurationScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  
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
  
  // Get crop data from nutrient calculator for consistency
  const { commonNutrients, commonStages } = useNutrientCalculator();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [setupName, setSetupName] = useState('');

  // Mock crops for now - in production this would come from shared state
  const MOCK_CROPS = [
    { id: 'lettuce', name: 'Lettuce', nameAr: 'خس' },
    { id: 'tomato', name: 'Tomato', nameAr: 'طماطم' },
    { id: 'basil', name: 'Basil', nameAr: 'ريحان' }
  ];

  // Accessibility announcements
  const announceChange = useCallback((message: string) => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, []);

  const handleCropSelect = useCallback((crop: any) => {
    selectCrop(crop);
    Haptics.selectionAsync();
    announceChange(t('lighting.accessibility.crop_selected', { 
      crop: isRTL ? crop.nameAr : crop.name 
    }));
  }, [selectCrop, announceChange, t, isRTL]);

  const handleStageSelect = useCallback((stage: any) => {
    selectStage(stage);
    Haptics.selectionAsync();
    announceChange(t('lighting.accessibility.stage_selected', { 
      stage: isRTL ? stage.nameAr : stage.name 
    }));
  }, [selectStage, announceChange, t, isRTL]);

  const handleLEDSelect = useCallback((led: LEDSpecification) => {
    selectLED(led);
    Haptics.selectionAsync();
    announceChange(t('lighting.accessibility.led_selected', { 
      brand: isRTL ? led.brandAr : led.brand,
      model: isRTL ? led.modelAr : led.model
    }));
  }, [selectLED, announceChange, t, isRTL]);

  const handlePhotoperiodSelect = useCallback((schedule: PhotoperiodSchedule) => {
    setPhotoperiod(schedule);
    Haptics.selectionAsync();
    announceChange(t('lighting.accessibility.photoperiod_selected', { 
      schedule: isRTL ? schedule.nameAr : schedule.name 
    }));
  }, [setPhotoperiod, announceChange, t, isRTL]);

  const handleCalculate = useCallback(async () => {
    if (!selectedLED || !photoperiod || !selectedCrop || !selectedStage) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await calculateLighting(selectedLED, distance, photoperiod, selectedCrop.id, selectedStage.id);
    
    if (calculations) {
      announceChange(t('lighting.accessibility.calculation_complete', {
        ppfd: Math.round(calculations.ppfd),
        dli: calculations.dli.toFixed(1)
      }));
    }
  }, [selectedLED, photoperiod, selectedCrop, selectedStage, distance, calculateLighting, calculations, announceChange, t]);

  const handleSaveSetup = useCallback(async () => {
    if (!calculations || !photoperiod || !selectedCrop || !selectedStage) return;
    
    try {
      await saveLightingSetup(
        setupName || `${selectedCrop.name} ${selectedStage.name} Setup`,
        calculations,
        photoperiod,
        selectedCrop.id,
        selectedStage.id
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('lighting.save.success_title'),
        t('lighting.save.success_message'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      setSetupName('');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('lighting.save.error_title'),
        t('lighting.save.error_message'),
        [{ text: t('common.ok'), style: 'default' }]
      );
    }
  }, [calculations, photoperiod, selectedCrop, selectedStage, setupName, saveLightingSetup, t]);

  const renderCropSelector = () => (
    <View style={styles.sectionContainer}>
      <Text 
        style={[styles.sectionTitle, isRTL && styles.rtlText]}
        accessibilityRole="header"
        accessibilityLevel={2}
      >
        {t('lighting.select_crop')}
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
            accessibilityLabel={t('lighting.accessibility.select_crop', { 
              crop: isRTL ? crop.nameAr : crop.name 
            })}
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
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLEDSelector = () => (
    <View style={styles.sectionContainer}>
      <Text 
        style={[styles.sectionTitle, isRTL && styles.rtlText]}
        accessibilityRole="header"
        accessibilityLevel={2}
      >
        {t('lighting.select_led')}
      </Text>
      
      {commonLEDs.map((led) => (
        <TouchableOpacity
          key={led.id}
          style={[
            styles.ledCard,
            selectedLED?.id === led.id && styles.selectedCard
          ]}
          onPress={() => handleLEDSelect(led)}
          accessibilityRole="button"
          accessibilityLabel={t('lighting.accessibility.select_led', { 
            brand: isRTL ? led.brandAr : led.brand,
            model: isRTL ? led.modelAr : led.model
          })}
          accessibilityState={{ selected: selectedLED?.id === led.id }}
        >
          <View style={[styles.ledHeader, isRTL && styles.rtlRow]}>
            <View style={styles.ledInfo}>
              <Text style={[
                styles.ledBrand,
                isRTL && styles.rtlText,
                selectedLED?.id === led.id && styles.selectedText
              ]}>
                {isRTL ? led.brandAr : led.brand}
              </Text>
              <Text style={[
                styles.ledModel,
                isRTL && styles.rtlText
              ]}>
                {isRTL ? led.modelAr : led.model}
              </Text>
            </View>
            
            <View style={styles.ledSpecs}>
              <Text style={styles.specText}>{led.wattage}W</Text>
              <Text style={styles.specText}>{led.ppfdAt12Inches} PPFD</Text>
              {led.price && (
                <Text style={styles.priceText}>${led.price}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.ledDetails}>
            <Text style={[styles.ledDescription, isRTL && styles.rtlText]}>
              {t('lighting.coverage')}: {led.coverage.footprint} @ {led.coverage.recommendedHeight}"
            </Text>
            <Text style={[styles.ledDescription, isRTL && styles.rtlText]}>
              {t('lighting.efficiency')}: {led.efficiency} μmol/J
            </Text>
          </View>
          
          {selectedLED?.id === led.id && (
            <SpectrumChart spectrum={led.spectrum} isRTL={isRTL} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDistanceControl = () => (
    <View style={styles.sectionContainer}>
      <Text 
        style={[styles.sectionTitle, isRTL && styles.rtlText]}
        accessibilityRole="header"
        accessibilityLevel={2}
      >
        {t('lighting.distance_from_canopy')}
      </Text>
      
      <View style={styles.distanceContainer}>
        <View style={styles.distanceDisplay}>
          <Text style={[styles.distanceValue, isRTL && styles.rtlText]}>
            {distance}
          </Text>
          <Text style={[styles.distanceUnit, isRTL && styles.rtlText]}>
            {units.distance}
          </Text>
        </View>
        
        <Slider
          style={styles.distanceSlider}
          minimumValue={6}
          maximumValue={36}
          value={distance}
          onValueChange={setDistance}
          step={1}
          thumbStyle={styles.sliderThumb}
          trackStyle={styles.sliderTrack}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          accessibilityLabel={t('lighting.accessibility.distance_slider')}
        />
        
        <View style={[styles.distanceRange, isRTL && styles.rtlRow]}>
          <Text style={styles.rangeText}>6{units.distance}</Text>
          <Text style={styles.rangeText}>36{units.distance}</Text>
        </View>
      </View>
      
      {selectedLED && (
        <View style={styles.ppfdPreview}>
          <Text style={[styles.ppfdText, isRTL && styles.rtlText]}>
            {t('lighting.estimated_ppfd')}: ~{Math.round(selectedLED.ppfdAt12Inches * Math.pow(12/distance, 2))} μmol/m²/s
          </Text>
        </View>
      )}
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
        >
          <Ionicons 
            name={isRTL ? "chevron-forward" : "chevron-back"} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, isRTL && styles.rtlText]}>
            {t('lighting.title')}
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
          accessibilityLabel={t('lighting.settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        accessibilityLabel={t('lighting.accessibility.main_content')}
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
              {t('lighting.select_stage')}
            </Text>
            
            <View style={styles.stageContainer}>
              {COMMON_CROP_STAGES.map((stage, index) => (
                <TouchableOpacity
                  key={stage.id}
                  style={[
                    styles.stageCard,
                    selectedStage?.id === stage.id && styles.selectedCard
                  ]}
                  onPress={() => handleStageSelect(stage)}
                  accessibilityRole="button"
                  accessibilityLabel={t('lighting.accessibility.select_stage', { 
                    stage: isRTL ? stage.nameAr : stage.name 
                  })}
                  accessibilityState={{ selected: selectedStage?.id === stage.id }}
                >
                  <Text style={[
                    styles.stageName,
                    isRTL && styles.rtlText,
                    selectedStage?.id === stage.id && styles.selectedText
                  ]}>
                    {isRTL ? stage.nameAr : stage.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* LED Selection */}
        {selectedStage && renderLEDSelector()}

        {/* Distance Control */}
        {selectedLED && renderDistanceControl()}

        {/* Photoperiod Selection */}
        {selectedLED && (
          <View style={styles.sectionContainer}>
            <Text 
              style={[styles.sectionTitle, isRTL && styles.rtlText]}
              accessibilityRole="header"
              accessibilityLevel={2}
            >
              {t('lighting.select_photoperiod')}
            </Text>
            
            {commonPhotoperiods.map((schedule) => (
              <TouchableOpacity
                key={schedule.id}
                style={[
                  styles.photoperiodCard,
                  photoperiod?.id === schedule.id && styles.selectedCard
                ]}
                onPress={() => handlePhotoperiodSelect(schedule)}
                accessibilityRole="button"
                accessibilityLabel={t('lighting.accessibility.select_photoperiod', { 
                  schedule: isRTL ? schedule.nameAr : schedule.name 
                })}
                accessibilityState={{ selected: photoperiod?.id === schedule.id }}
              >
                <View style={[styles.photoperiodHeader, isRTL && styles.rtlRow]}>
                  <Text style={[
                    styles.photoperiodName,
                    isRTL && styles.rtlText,
                    photoperiod?.id === schedule.id && styles.selectedText
                  ]}>
                    {isRTL ? schedule.nameAr : schedule.name}
                  </Text>
                  <Text style={styles.photoperiodHours}>
                    {schedule.lightHours}/{schedule.darkHours}
                  </Text>
                </View>
                
                {photoperiod?.id === schedule.id && (
                  <PhotoperiodTimeline photoperiod={schedule} isRTL={isRTL} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Calculate Button */}
        {selectedLED && photoperiod && selectedCrop && selectedStage && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={[
                styles.calculateButton,
                isLoading && styles.disabledButton
              ]}
              onPress={handleCalculate}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={t('lighting.calculate')}
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
                    <Ionicons name="flash-outline" size={20} color="white" />
                    <Text style={[styles.buttonText, isRTL && styles.rtlText]}>
                      {t('lighting.calculate')}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Results Section - Will continue in next part */}
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
    width: '30%',
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
  },
  selectedText: {
    color: colors.primary,
  },
  stageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stageCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  stageName: {
    ...text.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  ledCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ledHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  ledInfo: {
    flex: 1,
  },
  ledBrand: {
    ...text.body,
    fontWeight: '600',
    color: colors.text,
  },
  ledModel: {
    ...text.caption,
    color: colors.textSecondary,
  },
  ledSpecs: {
    alignItems: 'flex-end',
  },
  specText: {
    ...text.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  priceText: {
    ...text.body,
    fontWeight: '600',
    color: colors.success,
  },
  ledDetails: {
    marginBottom: spacing.sm,
  },
  ledDescription: {
    ...text.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  spectrumChart: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  distanceContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  distanceDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  distanceValue: {
    ...text.title,
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  distanceUnit: {
    ...text.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  distanceSlider: {
    height: 40,
    marginBottom: spacing.sm,
  },
  sliderThumb: {
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
  },
  distanceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    ...text.caption,
    color: colors.textSecondary,
  },
  ppfdPreview: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  ppfdText: {
    ...text.body,
    color: colors.text,
    textAlign: 'center',
  },
  photoperiodCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoperiodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  photoperiodName: {
    ...text.body,
    fontWeight: '600',
    color: colors.text,
  },
  photoperiodHours: {
    ...text.caption,
    color: colors.textSecondary,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  photoperiodTimeline: {
    marginTop: spacing.sm,
  },
  timelineContainer: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  timelineSegment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineText: {
    ...text.caption,
    fontWeight: '600',
    color: colors.text,
  },
  timeMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeMarker: {
    ...text.caption,
    color: colors.textSecondary,
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
  bottomSpacing: {
    height: spacing.xl,
  },
}); 