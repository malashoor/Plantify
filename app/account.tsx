import React from 'react';
import { ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { AccountSubscription } from '../components/account/AccountSubscription';
import Colors from '../constants/Colors';
import { Stack } from 'expo-router';

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Stack.Screen options={{ title: 'My Account' }} />
      <AccountSubscription />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
}); 