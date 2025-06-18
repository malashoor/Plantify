import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RoleSelector } from '@components/onboarding/RoleSelector';
import { EnvironmentSelector, type Environment } from '@components/onboarding/EnvironmentSelector';
import { PlantInterestSelector } from '@components/onboarding/PlantInterestSelector';
import { ProgressIndicator } from '@components/onboarding/ProgressIndicator';
import type { UserRole } from '@hooks/useAuth';

interface OnboardingState {
  role: UserRole;
  environment: Environment;
  interests: string[];
  locationPermission: boolean;
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<OnboardingState>({
    role: 'grower',
    environment: 'indoor',
    interests: [],
    locationPermission: false,
  });

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setState(prev => ({
        ...prev,
        locationPermission: status === 'granted'
      }));
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const newState = { ...state, locationPermission: status === 'granted' };
      setState(newState);

      if (status === 'denied') {
        Alert.alert(
          t('onboarding.location.denied'),
          t('onboarding.location.denied_message'),
          [
            {
              text: t('onboarding.location.skip'),
              onPress: () => handleNext(),
              style: 'default',
            },
          ],
          { cancelable: false }
        );
      } else if (status === 'granted') {
        handleNext();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert(t('common.error'), t('onboarding.errors.saveFailed'));
    }
  };

  const handleNext = async () => {
    // Validate current step
    let isValid = true;
    let errorMessage = '';

    switch (currentStep) {
      case 0: // Role selection
        if (!state.role) {
          isValid = false;
          errorMessage = t('onboarding.errors.roleRequired');
        }
        break;
      case 1: // Environment selection
        if (!state.environment) {
          isValid = false;
          errorMessage = t('onboarding.errors.environmentRequired');
        }
        break;
      case 2: // Plant interests
        if (state.interests.length === 0) {
          isValid = false;
          errorMessage = t('onboarding.errors.interestsRequired');
        }
        break;
    }

    if (!isValid) {
      Alert.alert(t('common.error'), errorMessage);
      return;
    }

    // Handle location permission step
    if (currentStep === 3) {
      await requestLocationPermission();
      return;
    }

    if (currentStep === steps.length - 1) {
      // Save onboarding state
      try {
        await AsyncStorage.setItem('onboardingComplete', 'true');
        await AsyncStorage.setItem('userPreferences', JSON.stringify(state));
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Error saving onboarding state:', error);
        Alert.alert(t('common.error'), t('onboarding.errors.saveFailed'));
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      title: t('onboarding.role.title'),
      subtitle: t('onboarding.role.subtitle'),
      component: (
        <RoleSelector
          value={state.role}
          onChange={(role) => setState(prev => ({ ...prev, role }))}
        />
      ),
    },
    {
      title: t('onboarding.environment.title'),
      subtitle: t('onboarding.environment.subtitle'),
      component: (
        <EnvironmentSelector
          value={state.environment}
          onChange={(environment) => setState(prev => ({ ...prev, environment }))}
        />
      ),
    },
    {
      title: t('onboarding.interests.title'),
      subtitle: t('onboarding.interests.subtitle'),
      component: (
        <PlantInterestSelector
          selectedInterests={state.interests}
          onInterestsChange={(interests) => setState(prev => ({ ...prev, interests }))}
        />
      ),
    },
    {
      title: t('onboarding.location.title'),
      subtitle: t('onboarding.location.subtitle'),
      component: (
        <View style={styles.locationContainer}>
          <View style={[
            styles.locationIconContainer,
            isDark && styles.locationIconContainerDark,
            state.locationPermission && styles.locationIconContainerSuccess,
          ]}>
            <Ionicons
              name={state.locationPermission ? "checkmark" : "location"}
              size={48}
              color={state.locationPermission ? "#16A34A" : (isDark ? "#9CA3AF" : "#6B7280")}
            />
          </View>
          <Text style={[styles.locationText, isDark && styles.locationTextDark]}>
            {state.locationPermission
              ? t('onboarding.location.granted')
              : t('onboarding.location.request')}
          </Text>
          {!state.locationPermission && (
            <TouchableOpacity
              style={[styles.locationButton, isDark && styles.locationButtonDark]}
              onPress={requestLocationPermission}
            >
              <Text style={[styles.locationButtonText, isDark && styles.locationButtonTextDark]}>
                {t('onboarding.location.allow')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    },
    {
      title: t('onboarding.summary.title'),
      subtitle: t('onboarding.summary.subtitle'),
      component: (
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryItem, isDark && styles.summaryItemDark]}>
            <Ionicons name="person" size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                {t('onboarding.summary.role')}
              </Text>
              <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]}>
                {t(`onboarding.roles.${state.role}.label`)}
              </Text>
            </View>
          </View>
          <View style={[styles.summaryItem, isDark && styles.summaryItemDark]}>
            <Ionicons 
              name={state.environment === 'indoor' ? 'home' : state.environment === 'outdoor' ? 'sunny' : 'water'}
              size={24}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                {t('onboarding.summary.environment')}
              </Text>
              <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]}>
                {t(`onboarding.environment.${state.environment}.label`)}
              </Text>
            </View>
          </View>
          <View style={[styles.summaryItem, isDark && styles.summaryItemDark]}>
            <Ionicons name="leaf" size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                {t('onboarding.summary.interests')}
              </Text>
              <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]}>
                {state.interests.length > 0
                  ? state.interests.map(i => t(`onboarding.interests.${i}`)).join(', ')
                  : t('onboarding.summary.no_interests')}
              </Text>
            </View>
          </View>
          <View style={[styles.summaryItem, isDark && styles.summaryItemDark]}>
            <Ionicons name="location" size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                {t('onboarding.summary.location')}
              </Text>
              <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]}>
                {state.locationPermission
                  ? t('onboarding.summary.location_enabled')
                  : t('onboarding.summary.location_disabled')}
              </Text>
            </View>
          </View>
        </View>
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container} testID="welcomeScreen">
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={isDark ? ['#064E3B', '#065F46', '#047857'] : ['#DCFCE7', '#BBF7D0', '#86EFAC']}
          style={styles.gradient}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ProgressIndicator
              totalSteps={steps.length}
              currentStep={currentStep}
              style={styles.progressIndicator}
            />
            {steps[currentStep].component}
          </ScrollView>

          <View style={styles.bottomNav}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={[styles.backButton, isDark && styles.backButtonDark]}
                onPress={handleBack}
                accessibilityLabel={t('common.previous')}
                testID="prevButton"
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={isDark ? '#9CA3AF' : '#6B7280'}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                isDark && styles.nextButtonDark,
                currentStep === steps.length - 1 && styles.getStartedButton,
                currentStep === steps.length - 1 && isDark && styles.getStartedButtonDark,
              ]}
              onPress={handleNext}
              accessibilityLabel={currentStep === steps.length - 1 ? t('common.getStarted') : t('common.next')}
              testID={currentStep === steps.length - 1 ? 'getStartedButton' : 'nextButton'}
            >
              <Text style={[
                styles.nextButtonText,
                isDark && styles.nextButtonTextDark,
                currentStep === steps.length - 1 && styles.getStartedButtonText,
                currentStep === steps.length - 1 && isDark && styles.getStartedButtonTextDark,
              ]}>
                {currentStep === steps.length - 1 ? t('common.getStarted') : t('common.next')}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  progressIndicator: {
    marginBottom: 32,
  },
  locationContainer: {
    alignItems: 'center',
    padding: 24,
  },
  locationIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  locationIconContainerDark: {
    backgroundColor: '#374151',
  },
  locationIconContainerSuccess: {
    backgroundColor: '#DCFCE7',
  },
  locationText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  locationTextDark: {
    color: '#9CA3AF',
  },
  locationButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#16A34A',
  },
  locationButtonDark: {
    backgroundColor: '#22C55E',
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationButtonTextDark: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  summaryItemDark: {
    backgroundColor: '#374151',
  },
  summaryContent: {
    marginLeft: 16,
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryLabelDark: {
    color: '#9CA3AF',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryValueDark: {
    color: '#F3F4F6',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonDark: {
    backgroundColor: '#374151',
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  nextButtonDark: {
    backgroundColor: '#374151',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  nextButtonTextDark: {
    color: '#F3F4F6',
  },
  getStartedButton: {
    backgroundColor: '#16A34A',
  },
  getStartedButtonDark: {
    backgroundColor: '#22C55E',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
  },
}); 