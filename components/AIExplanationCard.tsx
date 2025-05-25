import {
  Info,
  TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle,
} from 'lucide-react-native';
import React from 'react';

import type { AIDecision } from '@/utils/ai-transparency';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';


interface Props {
  decision: AIDecision;
  onOverride?: () => void;
}

export default function AIExplanationCard({ decision, onOverride }: Props) {
  const getConfidenceDisplay = () => {
    const confidence = decision.confidence;
    if (confidence >= 0.8) {
      return {
        icon: <CheckCircle size={20} color="#4CAF50" />,
        text: 'High Confidence',
        color: '#4CAF50',
      };
    } else if (confidence >= 0.6) {
      return {
        icon: <Info size={20} color="#FFC107" />,
        text: 'Moderate Confidence',
        color: '#FFC107',
      };
    } else {
      return {
        icon: <AlertTriangle size={20} color="#F44336" />,
        text: 'Low Confidence',
        color: '#F44336',
      };
    }
  };

  const confidenceDisplay = getConfidenceDisplay();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.confidenceIndicator}>
          {confidenceDisplay.icon}
          <Text
            style={[styles.confidenceText, { color: confidenceDisplay.color }]}
          >
            {confidenceDisplay.text}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(decision.timestamp).toLocaleString()}
        </Text>
      </View>

      <View style={styles.factorsContainer}>
        {decision.factors.map((factor, index) => (
          <View key={index} style={styles.factor}>
            <View
              style={[
                styles.factorIndicator,
                {
                  backgroundColor:
                    factor.impact === 'positive'
                      ? '#E8F5E9'
                      : factor.impact === 'negative'
                        ? '#FFEBEE'
                        : '#F5F5F5',
                },
              ]}
            >
              <Text
                style={[
                  styles.factorWeight,
                  {
                    color:
                      factor.impact === 'positive'
                        ? '#4CAF50'
                        : factor.impact === 'negative'
                          ? '#F44336'
                          : '#757575',
                  },
                ]}
              >
                {Math.round(factor.weight * 100)}%
              </Text>
            </View>
            <Text style={styles.factorExplanation}>{factor.explanation}</Text>
          </View>
        ))}
      </View>

      {decision.alternatives.length > 0 && (
        <View style={styles.alternativesContainer}>
          <Text style={styles.alternativesTitle}>
            Alternative Considerations:
          </Text>
          {decision.alternatives.map((alt, index) => (
            <Text key={index} style={styles.alternativeText}>
              • {alt.decision} ({Math.round(alt.confidence * 100)}% confidence)
            </Text>
          ))}
        </View>
      )}

      {onOverride && (
        <TouchableOpacity style={styles.overrideButton} onPress={onOverride}>
          <Text style={styles.overrideButtonText}>Override Decision</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sourceText}>Source: {decision.dataSource}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  factorsContainer: {
    marginBottom: 16,
  },
  factor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factorIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  factorWeight: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  factorExplanation: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Poppins-Regular',
  },
  alternativesContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  alternativesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  alternativeText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  overrideButton: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  overrideButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  sourceText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
  },
});
