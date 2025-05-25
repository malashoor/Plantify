import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { TextStyles } from '../../theme/text';
import { AuthInput } from '../../components/auth/AuthInput';
import { Button } from '../../components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { signIn, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
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
      general: '',
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

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    const { error } = await signIn(email, password);
    
    if (error) {
      setErrors(prev => ({ ...prev, general: error }));
    }
    
    setIsLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    const { error } = await signInWithOAuth(provider);
    
    if (error) {
      setErrors(prev => ({ ...prev, general: error }));
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    router.push('/auth/reset');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

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

        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPassword}
          accessibilityLabel="Forgot password link"
          accessibilityHint="Tap to reset your password"
          disabled={isLoading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title={isLoading ? "Signing in..." : "Log In"}
          onPress={handleLogin}
          style={styles.button}
          accessibilityLabel="Log in button"
          accessibilityHint="Tap to log in to your account"
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
          onPress={() => handleSocialLogin('google')}
          style={[styles.button, styles.socialButton]}
          variant="outline"
          disabled={isLoading}
        />

        <Button
          title="Continue with Apple"
          onPress={() => handleSocialLogin('apple')}
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