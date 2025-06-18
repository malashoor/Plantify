import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MeasurementFormData {
  ph_level: number;
  ec_level: number;
  water_temperature: number;
  notes?: string;
}

interface MeasurementFormProps {
  systemId: string;
  initialData?: Partial<MeasurementFormData>;
  onSubmit: (data: MeasurementFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    primary: '#4CAF50',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
});

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  systemId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const [formData, setFormData] = useState<MeasurementFormData>({
    ph_level: initialData?.ph_level || 6.0,
    ec_level: initialData?.ec_level || 1.5,
    water_temperature: initialData?.water_temperature || 20,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MeasurementFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MeasurementFormData, string>> = {};

    // pH validation (typical range: 4.0 - 9.0)
    if (formData.ph_level < 4.0 || formData.ph_level > 9.0) {
      newErrors.ph_level = 'pH should be between 4.0 and 9.0';
    }

    // EC validation (typical range: 0.5 - 3.0 mS/cm)
    if (formData.ec_level < 0.5 || formData.ec_level > 3.0) {
      newErrors.ec_level = 'EC should be between 0.5 and 3.0 mS/cm';
    }

    // Temperature validation (typical range: 10 - 35°C)
    if (formData.water_temperature < 10 || formData.water_temperature > 35) {
      newErrors.water_temperature = 'Temperature should be between 10°C and 35°C';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the input values and try again.');
      return;
    }

    onSubmit(formData);
  };

  const updateField = (field: keyof MeasurementFormData, value: string) => {
    const numericFields = ['ph_level', 'ec_level', 'water_temperature'];

    setFormData(prev => ({
      ...prev,
      [field]: numericFields.includes(field) ? parseFloat(value) || 0 : value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getStatusColor = (field: keyof MeasurementFormData): string => {
    const value = formData[field] as number;

    switch (field) {
      case 'ph_level':
        if (value >= 5.5 && value <= 6.5) return theme.colors.success;
        if ((value >= 5.0 && value < 5.5) || (value > 6.5 && value <= 7.0))
          return theme.colors.warning;
        return theme.colors.error;

      case 'ec_level':
        if (value >= 1.2 && value <= 2.0) return theme.colors.success;
        if ((value >= 1.0 && value < 1.2) || (value > 2.0 && value <= 2.5))
          return theme.colors.warning;
        return theme.colors.error;

      case 'water_temperature':
        if (value >= 18 && value <= 24) return theme.colors.success;
        if ((value >= 15 && value < 18) || (value > 24 && value <= 28)) return theme.colors.warning;
        return theme.colors.error;

      default:
        return theme.colors.text;
    }
  };

  const getStatusText = (field: keyof MeasurementFormData): string => {
    const value = formData[field] as number;

    switch (field) {
      case 'ph_level':
        if (value >= 5.5 && value <= 6.5) return 'Optimal';
        if ((value >= 5.0 && value < 5.5) || (value > 6.5 && value <= 7.0)) return 'Acceptable';
        return 'Needs adjustment';

      case 'ec_level':
        if (value >= 1.2 && value <= 2.0) return 'Optimal';
        if ((value >= 1.0 && value < 1.2) || (value > 2.0 && value <= 2.5)) return 'Acceptable';
        return 'Needs adjustment';

      case 'water_temperature':
        if (value >= 18 && value <= 24) return 'Optimal';
        if ((value >= 15 && value < 18) || (value > 24 && value <= 28)) return 'Acceptable';
        return 'Needs adjustment';

      default:
        return '';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Add Measurement</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Record current system parameters
        </Text>
      </View>

      <View style={styles.form}>
        {/* pH Level */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Ionicons name="water" size={20} color={getStatusColor('ph_level')} />
            <Text style={[styles.label, { color: theme.colors.text }]}>pH Level</Text>
            <Text style={[styles.status, { color: getStatusColor('ph_level') }]}>
              {getStatusText('ph_level')}
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: errors.ph_level ? theme.colors.error : theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={formData.ph_level.toString()}
            onChangeText={value => updateField('ph_level', value)}
            placeholder="6.0"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="decimal-pad"
            maxLength={4}
          />

          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            Ideal range: 5.5 - 6.5
          </Text>

          {errors.ph_level && (
            <Text style={[styles.error, { color: theme.colors.error }]}>{errors.ph_level}</Text>
          )}
        </View>

        {/* EC Level */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Ionicons name="flash" size={20} color={getStatusColor('ec_level')} />
            <Text style={[styles.label, { color: theme.colors.text }]}>EC Level (mS/cm)</Text>
            <Text style={[styles.status, { color: getStatusColor('ec_level') }]}>
              {getStatusText('ec_level')}
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: errors.ec_level ? theme.colors.error : theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={formData.ec_level.toString()}
            onChangeText={value => updateField('ec_level', value)}
            placeholder="1.5"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="decimal-pad"
            maxLength={4}
          />

          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            Ideal range: 1.2 - 2.0 mS/cm
          </Text>

          {errors.ec_level && (
            <Text style={[styles.error, { color: theme.colors.error }]}>{errors.ec_level}</Text>
          )}
        </View>

        {/* Water Temperature */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Ionicons name="thermometer" size={20} color={getStatusColor('water_temperature')} />
            <Text style={[styles.label, { color: theme.colors.text }]}>Water Temperature (°C)</Text>
            <Text style={[styles.status, { color: getStatusColor('water_temperature') }]}>
              {getStatusText('water_temperature')}
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: errors.water_temperature ? theme.colors.error : theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={formData.water_temperature.toString()}
            onChangeText={value => updateField('water_temperature', value)}
            placeholder="20"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="decimal-pad"
            maxLength={4}
          />

          <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
            Ideal range: 18°C - 24°C
          </Text>

          {errors.water_temperature && (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {errors.water_temperature}
            </Text>
          )}
        </View>

        {/* Notes */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Ionicons name="document-text" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.label, { color: theme.colors.text }]}>Notes (Optional)</Text>
          </View>

          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={formData.notes}
            onChangeText={value => updateField('notes', value)}
            placeholder="Any observations or notes about this measurement..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Saving...' : 'Save Measurement'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  form: {
    padding: 20,
    paddingTop: 0,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  error: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    // backgroundColor will be set by theme
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
