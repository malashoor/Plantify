import React, { useEffect, useState } from 'react';

import {
  supabase,
  isSupabaseConfigured,
  testSupabaseConnection,
  retryOperation,
} from '@/utils/supabase';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';


export default function SupabaseConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(
    null,
  );
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorDetails(null);
    setConnectionMessage(null);

    if (!isSupabaseConfigured()) {
      setIsConnected(false);
      setErrorMessage(
        'Supabase configuration is missing. Please check your environment variables.',
      );
      setIsLoading(false);
      return;
    }

    try {
      // Test the connection with retry logic
      const result = await retryOperation(
        testSupabaseConnection,
        retryCount > 0 ? 2 : 1, // Only retry if user has manually retried
        1000,
      );

      if (result.success) {
        setIsConnected(true);
        setConnectionMessage(
          result.message || 'Successfully connected to Supabase',
        );
      } else {
        setIsConnected(false);
        setErrorMessage(result.error || 'Unknown connection error');
        if (result.details) {
          setErrorDetails(result.details);
        }
      }
    } catch (error) {
      console.error('Failed to check Supabase connection:', error);
      setIsConnected(false);
      setErrorMessage(String(error));
      if (error instanceof Error && error.message.includes('timeout')) {
        setErrorDetails(
          'The connection timed out. This could be due to network issues or Supabase service availability.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    checkConnection();
  };

  const handleHelp = () => {
    Alert.alert(
      'Supabase Connection Help',
      'To connect to Supabase:\n\n1. Create a Supabase account at supabase.com\n2. Create a new project\n3. Get your project URL and anon key from the API settings\n4. Add them to your .env file as:\nEXPO_PUBLIC_SUPABASE_URL=your_url\nEXPO_PUBLIC_SUPABASE_ANON_KEY=your_key\n5. Restart your development server\n\nMake sure to run the SQL migrations in the Supabase SQL editor.',
      [{ text: 'OK' }],
    );
  };

  const openSupabaseDashboard = () => {
    Linking.openURL('https://app.supabase.com');
  };

  const handleMigrations = () => {
    Alert.alert(
      'Run Database Migrations',
      'To set up your database schema:\n\n1. Go to your Supabase dashboard\n2. Navigate to the SQL Editor\n3. Copy and paste each migration file from the supabase/migrations folder\n4. Run each migration in order\n\nThis will create all necessary tables and security policies.',
      [
        {
          text: 'Open Supabase Dashboard',
          onPress: openSupabaseDashboard,
        },
        { text: 'OK' },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#2E7D32" />
        <Text style={styles.loadingText}>Checking Supabase connection...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.statusIndicator,
          isConnected
            ? styles.connectedIndicator
            : styles.disconnectedIndicator,
        ]}
      />

      <Text style={styles.statusText}>
        {isConnected ? 'Connected to Supabase' : 'Not connected to Supabase'}
      </Text>

      {connectionMessage && (
        <Text style={styles.connectionMessage}>{connectionMessage}</Text>
      )}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {errorDetails && <Text style={styles.errorDetails}>{errorDetails}</Text>}

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.button} onPress={handleRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleHelp}>
          <Text style={styles.buttonText}>Help</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleMigrations}>
          <Text style={styles.buttonText}>Migrations</Text>
        </TouchableOpacity>
      </View>

      {!isConnected && (
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={openSupabaseDashboard}
        >
          <Text style={styles.dashboardButtonText}>
            Open Supabase Dashboard
          </Text>
        </TouchableOpacity>
      )}

      {errorMessage && errorMessage.includes('timeout') && (
        <View style={styles.timeoutHelpContainer}>
          <Text style={styles.timeoutHelpTitle}>Timeout Troubleshooting:</Text>
          <Text style={styles.timeoutHelpText}>
            1. Check your internet connection
          </Text>
          <Text style={styles.timeoutHelpText}>
            2. Verify Supabase project is active
          </Text>
          <Text style={styles.timeoutHelpText}>
            3. Ensure your API keys are correct
          </Text>
          <Text style={styles.timeoutHelpText}>
            4. Try again in a few minutes
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  connectedIndicator: {
    backgroundColor: '#4CAF50',
  },
  disconnectedIndicator: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  connectionMessage: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  dashboardButton: {
    marginTop: 16,
    backgroundColor: '#1E88E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  dashboardButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  timeoutHelpContainer: {
    marginTop: 16,
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
    alignSelf: 'stretch',
  },
  timeoutHelpTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#F57C00',
  },
  timeoutHelpText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
});
