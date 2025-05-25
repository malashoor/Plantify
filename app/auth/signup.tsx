import { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { TextStyles } from '../../theme/text';
import { AuthInput } from '../../components/auth/AuthInput';
import { Button } from '../../components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function SignUpScreen() {
  const { signUp, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    };

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    const { error } = await signUp(email, password);
    
    if (error) {
      setErrors(prev => ({ ...prev, general: error }));
    }
    
    setIsLoading(false);
  };

  const handleSocialSignUp = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    const { error } = await signInWithOAuth(provider);
    
    if (error) {
      setErrors(prev => ({ ...prev, general: error }));
    }
    
    setIsLoading(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {errors.general ? (
          <Text style={styles.errorText}>{errors.general}</Text>
        ) : null}

        <AuthInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          error={errors.email}
          accessibilityLabel="Email input field"
          accessibilityHint="Enter your email address"
          editable={!isLoading}
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
          editable={!isLoading}
        />

        <AuthInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          secureTextEntry
          error={errors.confirmPassword}
          accessibilityLabel="Confirm password input field"
          accessibilityHint="Confirm your password"
          editable={!isLoading}
        />

        <Button
          title={isLoading ? "Creating account..." : "Sign Up"}
          onPress={handleSignUp}
          style={styles.button}
          accessibilityLabel="Sign up button"
          accessibilityHint="Tap to create your account"
          disabled={isLoading}
        >
          {isLoading && <ActivityIndicator color={Colors.White} style={styles.loader} />}
        </Button>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="Continue with Google"
          onPress={() => handleSocialSignUp('google')}
          style={[styles.button, styles.socialButton]}
          variant="outline"
          disabled={isLoading}
        />

        <Button
          title="Continue with Apple"
          onPress={() => handleSocialSignUp('apple')}
          style={[styles.button, styles.socialButton]}
          variant="outline"
          disabled={isLoading}
        />
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
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...TextStyles.H1,
    marginBottom: Spacing.XS,
  },
  subtitle: {
    ...TextStyles.Body,
    color: Colors.Text.Secondary,
    marginBottom: Spacing.LG,
  },
  button: {
    marginTop: Spacing.LG,
  },
  socialButton: {
    marginTop: Spacing.MD,
  },
  loader: {
    marginLeft: Spacing.SM,
  },
  errorText: {
    ...TextStyles.Body,
    color: Colors.Error,
    marginBottom: Spacing.MD,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.LG,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.Border,
  },
  dividerText: {
    ...TextStyles.Body,
    color: Colors.Text.Secondary,
    marginHorizontal: Spacing.MD,
  },
}); 