import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { testSupabaseConnection } from '@lib/testSupabase';

export default function TestScreen() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function checkConnection() {
      try {
        const isConnected = await testSupabaseConnection();
        setConnectionStatus(isConnected ? 'success' : 'error');
      } catch (error) {
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    }

    checkConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.status}>
          Status: {connectionStatus === 'loading' ? 'Testing...' : connectionStatus}
        </Text>
        {connectionStatus === 'error' && <Text style={styles.error}>{errorMessage}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusContainer: {
    alignItems: 'center',
  },
  status: {
    fontSize: 18,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});
