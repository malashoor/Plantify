import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { TextStyles } from '../../theme/text';

export interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  editable?: boolean;
}

export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  error,
  accessibilityLabel,
  accessibilityHint,
  editable = true,
}: AuthInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={Colors.Text.Secondary}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        editable={editable}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.MD,
  },
  label: {
    ...TextStyles.Body,
    marginBottom: Spacing.XS,
  },
  input: {
    ...TextStyles.Body,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderRadius: 8,
    paddingHorizontal: Spacing.MD,
    backgroundColor: Colors.Background.Light,
  },
  inputError: {
    borderColor: Colors.Error,
  },
  error: {
    ...TextStyles.Caption,
    color: Colors.Error,
    marginTop: Spacing.XS,
  },
}); 