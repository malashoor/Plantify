import {
  Cloud,
  Droplet,
  Sun,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';

import { getWeatherBasedRecommendations } from '@/utils/ai';
import { View, Text, StyleSheet, Platform } from 'react-native';


interface Props {
  location: string;
}

export default function WeatherBasedCare({ location }: Props) {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await getWeatherBasedRecommendations(location);
        setRecommendations(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch weather-based recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [location]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading recommendations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AlertCircle size={24} color="#E53935" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Cloud size={24} color="#2E7D32" />
        <Text style={styles.title}>Weather-Based Care Tips</Text>
      </View>

      {recommendations.length > 0 ? (
        <View style={styles.recommendationsContainer}>
          {recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationCard}>
              {index % 2 === 0 ? (
                <Droplet size={20} color="#2196F3" />
              ) : (
                <Sun size={20} color="#FF9800" />
              )}
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No special care needed based on current weather
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginLeft: 8,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333333',
    marginLeft: 12,
    lineHeight: 20,
  },
  emptyContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#E53935',
    textAlign: 'center',
    marginTop: 8,
  },
});
