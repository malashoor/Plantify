import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { TextStyles } from '../../theme/text';
import { AuthInput } from '../../components/auth/AuthInput';
import { Button } from '../../components/ui/button';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleLogin = () => {
    if (validateForm()) {
      // TODO: Implement login logic
      navigation.navigate('MainDashboard');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('PasswordReset');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <AuthInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          error={errors.email}
          accessibilityLabel="Email input field"
          accessibilityHint="Enter your email address"
        />

        <AuthInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          error={errors.password}
          accessibilityLabel="Password input field"
          accessibilityHint="Enter your password"
        />

        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPassword}
          accessibilityLabel="Forgot password link"
          accessibilityHint="Tap to reset your password"
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title="Log In"
          onPress={handleLogin}
          style={styles.button}
          accessibilityLabel="Log in button"
          accessibilityHint="Tap to log in to your account"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background.Light,
  },
  contentContainer: {
    flexGrow: 1,
    padding: Spacing.Screen.Padding,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: Spacing.XS,
  },
  forgotPasswordText: {
    ...TextStyles.Body,
    color: Colors.Primary,
  },
  button: {
    marginTop: Spacing.LG,
  },
}); 