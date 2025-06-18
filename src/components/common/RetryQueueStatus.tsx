import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { RetryQueue } from '../../utils/RetryQueue';
import { useTheme } from '../../hooks/useTheme';
import { useVoiceAnnouncement } from '../utils/VoiceAnnouncement';

interface RetryQueueStatusProps {
  showDetails?: boolean;
}

export function RetryQueueStatus({ showDetails = false }: RetryQueueStatusProps) {
  const { colors, spacing } = useTheme();
  const { announceQueue } = useVoiceAnnouncement();
  const retryQueue = RetryQueue.getInstance();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const unsubscribe = retryQueue.subscribe(state => {
      const hasOperations = state.queuedOperations.length > 0;

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: hasOperations ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: hasOperations ? 0 : 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Announce queue status changes for accessibility
      if (hasOperations) {
        const pendingCount = state.queuedOperations.length;
        const processingCount = state.queuedOperations.filter(op => op.isProcessing).length;

        announceQueue([
          `${pendingCount} operations in queue.`,
          processingCount > 0 ? `${processingCount} currently processing.` : '',
        ]);
      }
    });

    return () => unsubscribe();
  }, []);

  const renderQueueDetails = () => {
    const state = retryQueue.getState();
    const { queuedOperations } = state;

    if (!showDetails || queuedOperations.length === 0) {
      return null;
    }

    return (
      <View style={styles.details}>
        {queuedOperations.map(op => (
          <View
            key={op.id}
            style={styles.operationItem}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`${op.operationKey} operation, ${
              op.isProcessing ? 'processing' : 'queued'
            }, attempt ${op.attempt} of ${op.maxRetries}`}
          >
            <Text style={[styles.operationText, { color: colors.text }]}>{op.operationKey}</Text>
            <View style={styles.operationStatus}>
              {op.isProcessing && (
                <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
              )}
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                {op.isProcessing ? 'Processing' : 'Queued'}
                {op.attempt > 0 && ` (${op.attempt}/${op.maxRetries})`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.card,
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Retry Queue Status</Text>
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.badgeText, { color: colors.white }]}>
            {retryQueue.getState().queuedOperations.length}
          </Text>
        </View>
      </View>
      {renderQueueDetails()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    marginTop: 12,
  },
  operationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  operationText: {
    fontSize: 14,
  },
  operationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
});
