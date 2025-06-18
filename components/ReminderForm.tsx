import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ReminderType, RepeatInterval } from '../types/reminder';

interface ReminderFormProps {
  initialValues?: {
    title: string;
    type: ReminderType;
    trigger_date: string;
    repeat_interval?: RepeatInterval;
  };
  onSubmit: (values: {
    title: string;
    type: ReminderType;
    trigger_date: string;
    repeat_interval?: RepeatInterval;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
    inputBackground: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
  },
});

// Custom Input component
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  autoFocus,
  theme,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  theme: any;
}) => (
  <View style={styles.inputContainer}>
    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{label}</Text>
    <TextInput
      style={[
        styles.textInput,
        {
          backgroundColor: theme.colors.inputBackground,
          borderColor: theme.colors.border,
          color: theme.colors.text,
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
      autoFocus={autoFocus}
    />
  </View>
);

// Custom Button component
const Button = ({
  title,
  onPress,
  type = 'solid',
  iconName,
  theme,
  style,
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  type?: 'solid' | 'outline' | 'clear';
  iconName?: keyof typeof Ionicons.glyphMap;
  theme: any;
  style?: any;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const getButtonStyle = () => {
    if (disabled) {
      return {
        backgroundColor: '#E0E0E0',
        borderColor: '#E0E0E0',
      };
    }

    switch (type) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'clear':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
        };
    }
  };

  const getTextColor = () => {
    if (disabled) return '#9E9E9E';

    switch (type) {
      case 'outline':
        return theme.colors.primary;
      case 'clear':
        return theme.colors.primary;
      default:
        return 'white';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator size="small" color={getTextColor()} />
        ) : (
          <>
            {iconName && (
              <Ionicons
                name={iconName}
                size={20}
                color={getTextColor()}
                style={styles.buttonIcon}
              />
            )}
            <Text style={[styles.buttonText, { color: getTextColor() }]}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const ReminderForm: React.FC<ReminderFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const [title, setTitle] = useState(initialValues?.title || '');
  const [type, setType] = useState<ReminderType>(initialValues?.type || 'system');
  const [triggerDate, setTriggerDate] = useState(
    initialValues?.trigger_date ? new Date(initialValues.trigger_date) : new Date()
  );
  const [repeatInterval, setRepeatInterval] = useState<RepeatInterval>(
    initialValues?.repeat_interval || null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      title,
      type,
      trigger_date: triggerDate.toISOString(),
      repeat_interval: repeatInterval,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Input
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="Enter reminder title"
        autoFocus
        theme={theme}
      />

      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Type</Text>
        <View style={styles.typeContainer}>
          <Button
            title="System"
            type={type === 'system' ? 'solid' : 'outline'}
            onPress={() => setType('system')}
            theme={theme}
            style={styles.typeButton}
          />
          <Button
            title="Journal"
            type={type === 'journal' ? 'solid' : 'outline'}
            onPress={() => setType('journal')}
            theme={theme}
            style={styles.typeButton}
          />
          <Button
            title="Seed"
            type={type === 'seed' ? 'solid' : 'outline'}
            onPress={() => setType('seed')}
            theme={theme}
            style={styles.typeButton}
          />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Date & Time</Text>
        <Button
          title={format(triggerDate, 'MMM d, yyyy h:mm a')}
          onPress={() => setShowDatePicker(true)}
          type="outline"
          iconName="calendar"
          theme={theme}
          style={styles.dateButton}
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={triggerDate}
          mode="datetime"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setTriggerDate(date);
          }}
        />
      )}

      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Repeat</Text>
        <View style={styles.repeatContainer}>
          <Button
            title="Daily"
            type={repeatInterval === 'daily' ? 'solid' : 'outline'}
            onPress={() => setRepeatInterval('daily')}
            theme={theme}
            style={styles.repeatButton}
          />
          <Button
            title="Weekly"
            type={repeatInterval === 'weekly' ? 'solid' : 'outline'}
            onPress={() => setRepeatInterval('weekly')}
            theme={theme}
            style={styles.repeatButton}
          />
          <Button
            title="Monthly"
            type={repeatInterval === 'monthly' ? 'solid' : 'outline'}
            onPress={() => setRepeatInterval('monthly')}
            theme={theme}
            style={styles.repeatButton}
          />
          <Button
            title="None"
            type={repeatInterval === null ? 'solid' : 'outline'}
            onPress={() => setRepeatInterval(null)}
            theme={theme}
            style={styles.repeatButton}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={onCancel}
          type="clear"
          theme={theme}
          style={styles.actionButton}
        />
        <Button
          title="Save"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!title || isLoading}
          theme={theme}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateButton: {
    width: '100%',
  },
  repeatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  repeatButton: {
    width: '48%',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    marginLeft: 8,
    paddingHorizontal: 24,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
