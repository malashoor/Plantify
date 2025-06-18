import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text } from '@components/ui/Text';
import { useColorScheme } from 'react-native';

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function BackHeader({ title, onBack }: BackHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel={title}
    >
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
        accessible={true}
        accessibilityLabel={t('accessibility.back_hint', 'Go back to previous screen')}
        accessibilityRole="button"
        accessibilityHint={t('accessibility.back_hint_detail', 'Returns to the previous view')}
      >
        <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>
      <Text
        variant="title"
        style={[styles.title, isDark && styles.titleDark]}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  titleDark: {
    color: '#FFFFFF',
  },
});
