import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AuthInput } from '../../src/components/auth/AuthInput';
import { Button } from '../../src/components/ui/button';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'Saudi Arabia',
  });
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            country: formData.country,
          },
        },
      });

      if (error) {
        Alert.alert('Registration Error', error.message);
      } else {
        Alert.alert('Registration Successful!', 'Please check your email to verify your account.', [
          { text: 'OK', onPress: () => router.push('/(tabs)') },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Plantify and start your garden journey</Text>
        </View>

        <View style={styles.form}>
          <AuthInput
            label="Full Name"
            value={formData.fullName}
            onChangeText={text => updateField('fullName', text)}
            placeholder="Enter your full name"
            error={errors.fullName}
          />

          <AuthInput
            label="Email Address"
            value={formData.email}
            onChangeText={text => updateField('email', text)}
            placeholder="Enter your email"
            keyboardType="email-address"
            error={errors.email}
          />

          <AuthInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={text => updateField('phone', text)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <AuthInput
            label="Password"
            value={formData.password}
            onChangeText={text => updateField('password', text)}
            placeholder="Create a password"
            secureTextEntry
            error={errors.password}
          />

          <AuthInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={text => updateField('confirmPassword', text)}
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Button
            title={loading ? 'Creating Account...' : 'Create Account'}
            onPress={handleRegister}
            disabled={loading}
            style={styles.registerButton}
          />

          <Button
            title="Already have an account? Sign In"
            onPress={() => router.push('/auth/login')}
            variant="outline"
            style={styles.loginButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  registerButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  loginButton: {
    marginBottom: 20,
  },
});
