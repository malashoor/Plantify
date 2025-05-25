import { Picker } from '@react-native-picker/picker';
import { Text, Input, Button, useTheme } from '@rneui/themed';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';


import { useHydroponics } from '@/hooks/useHydroponics';
import { useToast } from '@/hooks/useToast';
import { HydroponicSystemType } from '@/types/hydroponic';
import { View, StyleSheet, ScrollView } from 'react-native';

import { useAuth } from '../../hooks/useAuth';

const SYSTEM_TYPES: HydroponicSystemType[] = [
  'NFT',
  'DWC',
  'Wick',
  'Ebb and Flow',
  'Aeroponics',
];

export default function NewHydroponicScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { createSystem } = useHydroponics();
  const { showSuccess, showError } = useToast();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState<HydroponicSystemType>('NFT');
  const [notes, setNotes] = useState('');

  if (isLoadingAuth) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please log in to create a hydroponic system</Text>
        <Button
          title="Go to Login"
          onPress={() => router.push('/auth/login')}
          accessibilityLabel="Go to login screen"
          accessibilityHint="Navigate to the login screen to sign in"
        />
      </View>
    );
  }

  const validateForm = () => {
    if (!name.trim()) {
      showError('Please enter a system name');
      return false;
    }
    if (!SYSTEM_TYPES.includes(type)) {
      showError('Please select a valid system type');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createSystem.mutateAsync({
        name: name.trim(),
        type,
        notes: notes.trim(),
        is_active: true,
        user_id: user.id,
      });
      showSuccess('Hydroponic system created successfully');
      router.replace('/hydroponics');
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text h4 style={styles.title}>
          Add New Hydroponic System
        </Text>

        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter system name"
          accessibilityLabel="System name"
          accessibilityHint="Enter a name for your hydroponic system"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Type</Text>
          <Picker<HydroponicSystemType>
            selectedValue={type}
            onValueChange={(value) => setType(value)}
            accessibilityLabel="System type"
            accessibilityHint="Select the type of hydroponic system"
          >
            {SYSTEM_TYPES.map((systemType) => (
              <Picker.Item
                key={systemType}
                label={systemType}
                value={systemType}
              />
            ))}
          </Picker>
        </View>

        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Enter any additional notes"
          multiline
          numberOfLines={3}
          accessibilityLabel="System notes"
          accessibilityHint="Enter any additional notes about the system"
        />

        <Button
          title="Create System"
          onPress={handleSubmit}
          loading={createSystem.isPending}
          disabled={createSystem.isPending || !name || !type}
          accessibilityLabel="Create hydroponic system"
          accessibilityHint="Create a new hydroponic system with the entered details"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#86939e',
  },
});
