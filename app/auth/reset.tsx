import { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { TextStyles } from '../../theme/text';
import { AuthInput } from '../../components/auth/AuthInput';
import { Button } from '../../components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function PasswordResetScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    const { error: resetError } = await resetPassword(email);
    
    if (resetError) {
      setError(resetError);
      setIsLoading(false);
    } else {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.message}>
            We've sent password reset instructions to {email}
          </Text>
          <Button
            title="Back to Login"
            onPress={() => router.replace('/auth/login')}
            style={styles.button}
            accessibilityLabel="Back to login button"
            accessibilityHint="Tap to return to the login screen"
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <AuthInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          error={error}
          accessibilityLabel="Email input field"
          accessibilityHint="Enter your email address to receive password reset instructions"
          editable={!isLoading}
        />

        <Button
          title={isLoading ? "Sending..." : "Send Reset Link"}
          onPress={handleResetPassword}
          style={styles.button}
          accessibilityLabel="Send reset link button"
          accessibilityHint="Tap to send password reset instructions to your email"
          disabled={isLoading}
        >
          {isLoading && <ActivityIndicator color={Colors.White} style={styles.loader} />}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background.Light,
  },
  contentContainer: {
    flexGrow: 1,
    padding: Spacing.Screen.Padding,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.Screen.Padding,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...TextStyles.H1,
    marginBottom: Spacing.MD,
  },
  subtitle: {
    ...TextStyles.Body,
    marginBottom: Spacing.LG,
  },
  message: {
    ...TextStyles.Body,
    textAlign: 'center',
    marginBottom: Spacing.LG,
  },
  button: {
    marginTop: Spacing.LG,
  },
  loader: {
    marginLeft: Spacing.SM,
  },
  errorText: {
    ...TextStyles.Body,
    color: Colors.Error,
    marginBottom: Spacing.MD,
  },
}); 