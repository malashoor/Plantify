import React, { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';

/**
 * Component that detects and fixes web-specific compatibility issues
 * Only active in web environments to help debug blank screens
 */
export const WebCompatibilityWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Only run on web
    if (Platform.OS !== 'web') return;

    // Detect common issues
    const detectedErrors: string[] = [];
    const info: { [key: string]: string } = {};

    try {
      // Gather environment info
      info.userAgent = window.navigator.userAgent;
      info.platform = Platform.OS;
      info.windowWidth = `${window.innerWidth}px`;
      info.windowHeight = `${window.innerHeight}px`;

      // Try to get package versions without using require
      try {
        // @ts-ignore - Access global
        info.reactNativeWebVersion = global.reactNativeWebVersion || 'unknown';
        // @ts-ignore - Access global
        info.reactVersion = global.React?.version || 'unknown';
      } catch (e) {
        info.versions = 'Unable to detect versions';
      }

      // Check for missing polyfills
      if (!window.requestAnimationFrame) {
        detectedErrors.push('Missing requestAnimationFrame polyfill');
      }

      // Check for URL support
      try {
        new URL('https://example.com');
      } catch (e) {
        detectedErrors.push('Missing URL polyfill');
      }

      setDebugInfo(info);
      setErrors(detectedErrors);
    } catch (err) {
      console.error('Error in WebCompatibilityWrapper:', err);
    }
  }, []);

  // Only render debugging UI in web environment and if there are errors
  if (Platform.OS === 'web' && (errors.length > 0 || process.env.NODE_ENV === 'development')) {
    return (
      <View style={styles.container}>
        {children}

        {/* Debug overlay - only shown in development or when errors exist */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Web Debug Info</Text>

          {errors.length > 0 && (
            <View style={styles.errorSection}>
              <Text style={styles.sectionTitle}>Errors Detected:</Text>
              {errors.map((error, i) => (
                <Text key={i} style={styles.errorText}>
                  {error}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Environment:</Text>
            {Object.entries(debugInfo).map(([key, value]) => (
              <Text key={key} style={styles.infoText}>
                {key}: {value}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Just render children on native platforms
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  debugContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    maxHeight: 200,
    overflow: 'auto',
  },
  debugTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  errorSection: {
    marginBottom: 10,
  },
  errorText: {
    color: '#ff6666',
    fontSize: 12,
  },
  infoSection: {
    marginBottom: 10,
  },
  infoText: {
    color: '#aaffaa',
    fontSize: 12,
  },
});

export default WebCompatibilityWrapper;
