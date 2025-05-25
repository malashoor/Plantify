import { Text, Button, useTheme } from '@rneui/themed';
import { useRouter } from 'expo-router';
import React from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator } from 'react-native';


import { HydroponicCard } from '../../components/hydroponics/HydroponicCard';
import { useHydroponics } from '../../hooks/useHydroponics';

export default function HydroponicsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { useSystems } = useHydroponics();
  const { showError } = useToast();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { data: systems, isLoading: isLoadingSystems, error } = useSystems();

  if (isLoadingAuth || isLoadingSystems) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please log in to view your hydroponic systems</Text>
        <Button
          title="Go to Login"
          onPress={() => router.push('/auth/login')}
          accessibilityLabel="Go to login screen"
          accessibilityHint="Navigate to the login screen to sign in"
        />
      </View>
    );
  }

  if (error) {
    showError('Failed to load hydroponic systems');
    return (
      <View style={styles.container}>
        <Text>Error loading systems</Text>
        <Button
          title="Try Again"
          onPress={() => router.replace('/hydroponics')}
          accessibilityLabel="Try loading systems again"
          accessibilityHint="Reload the hydroponic systems list"
        />
      </View>
    );
  }

  if (!systems || systems.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No hydroponic systems found</Text>
        <Button
          title="Add System"
          onPress={() => router.push('/hydroponics/new')}
          accessibilityLabel="Add new hydroponic system"
          accessibilityHint="Create a new hydroponic system"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={systems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HydroponicCard
            system={item}
            onPress={() => router.push(`/hydroponics/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
      />
      <Button
        title="Add System"
        onPress={() => router.push('/hydroponics/new')}
        containerStyle={styles.addButton}
        accessibilityLabel="Add new hydroponic system"
        accessibilityHint="Create a new hydroponic system"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  addButton: {
    margin: 16,
  },
});
