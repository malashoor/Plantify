import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];

    if (disabled || loading) {
      baseStyle.push(styles.buttonDisabled);
    } else {
      baseStyle.push(styles[`button_${variant}`]);
    }

    if (style) {
      if (Array.isArray(style)) {
        baseStyle.push(...style.filter(Boolean));
      } else {
        baseStyle.push(style);
      }
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${size}`]];

    if (disabled || loading) {
      baseStyle.push(styles.textDisabled);
    } else {
      baseStyle.push(styles[`text_${variant}`]);
    }

    if (textStyle) {
      if (Array.isArray(textStyle)) {
        baseStyle.push(...textStyle.filter(Boolean));
      } else {
        baseStyle.push(textStyle);
      }
    }

    return baseStyle;
  };

  if (!title || !onPress) {
    console.warn('Button: title and onPress are required props');
    return null;
  }

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button_small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button_medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  button_large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  button_primary: {
    backgroundColor: '#4CAF50',
  },
  button_secondary: {
    backgroundColor: '#2196F3',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  text_primary: {
    color: '#fff',
  },
  text_secondary: {
    color: '#fff',
  },
  text_outline: {
    color: '#4CAF50',
  },
  textDisabled: {
    color: '#999',
  },
});

export default Button;
