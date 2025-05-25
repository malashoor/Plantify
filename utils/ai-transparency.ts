import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// Types for AI decision explanations
export interface AIDecision {
  confidence: number;
  factors: DecisionFactor[];
  alternatives: Alternative[];
  dataSource: string;
  timestamp: string;
}

export interface DecisionFactor {
  name: string;
  weight: number;
  value: number;
  threshold: number;
  impact: 'positive' | 'negative' | 'neutral';
  explanation: string;
}

export interface Alternative {
  decision: string;
  confidence: number;
  reason: string;
}

export interface UserOverride {
  originalDecision: AIDecision;
  userDecision: string;
  reason: string;
  timestamp: string;
}

// AI Transparency Manager
export class AITransparencyManager {
  private static readonly STORAGE_KEYS = {
    decisions: 'ai_decisions_',
    overrides: 'user_overrides_',
    feedback: 'ai_feedback_',
  };

  // Store AI decision with explanations
  static async storeDecision(
    decisionId: string,
    decision: AIDecision,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.decisions + decisionId,
        JSON.stringify({
          ...decision,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error('Error storing AI decision:', error);
    }
  }

  // Get AI decision history
  static async getDecisionHistory(limit: number = 10): Promise<AIDecision[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const decisionKeys = keys.filter((k) =>
        k.startsWith(this.STORAGE_KEYS.decisions),
      );

      const decisions = await Promise.all(
        decisionKeys.map(async (key) => {
          const data = await AsyncStorage.getItem(key);
          return data ? JSON.parse(data) : null;
        }),
      );

      return decisions
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting decision history:', error);
      return [];
    }
  }

  // Store user override
  static async storeOverride(
    decisionId: string,
    override: UserOverride,
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.overrides + decisionId,
        JSON.stringify(override),
      );

      // Update AI model with feedback
      await this.processFeedback(override);
    } catch (error) {
      console.error('Error storing user override:', error);
    }
  }

  // Process user feedback for AI improvement
  private static async processFeedback(override: UserOverride): Promise<void> {
    try {
      const feedback = {
        originalConfidence: override.originalDecision.confidence,
        userDecision: override.userDecision,
        reason: override.reason,
        timestamp: override.timestamp,
        factors: override.originalDecision.factors,
      };

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.feedback + Date.now(),
        JSON.stringify(feedback),
      );
    } catch (error) {
      console.error('Error processing feedback:', error);
    }
  }

  // Generate explanation for AI decision
  static generateExplanation(decision: AIDecision): string {
    const mainFactors = decision.factors
      .filter((f) => f.weight > 0.3)
      .sort((a, b) => b.weight - a.weight);

    let explanation = `I am ${Math.round(decision.confidence * 100)}% confident in this recommendation based on:\n\n`;

    mainFactors.forEach((factor) => {
      explanation += `• ${factor.explanation}\n`;
    });

    if (decision.alternatives.length > 0) {
      explanation += '\nAlternative considerations:\n';
      decision.alternatives.forEach((alt) => {
        explanation += `• ${alt.decision} (${Math.round(alt.confidence * 100)}% confidence) - ${alt.reason}\n`;
      });
    }

    return explanation;
  }

  // Get confidence indicators
  static getConfidenceLevel(confidence: number): {
    level: 'low' | 'medium' | 'high';
    color: string;
    message: string;
  } {
    if (confidence >= 0.8) {
      return {
        level: 'high',
        color: '#4CAF50',
        message: 'High confidence prediction',
      };
    } else if (confidence >= 0.6) {
      return {
        level: 'medium',
        color: '#FFC107',
        message: 'Moderate confidence, consider alternatives',
      };
    } else {
      return {
        level: 'low',
        color: '#F44336',
        message: 'Low confidence, manual verification recommended',
      };
    }
  }

  // Clean up old data
  static async cleanupOldData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30); // 30 days retention

      for (const key of keys) {
        if (
          key.startsWith(this.STORAGE_KEYS.decisions) ||
          key.startsWith(this.STORAGE_KEYS.overrides)
        ) {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const { timestamp } = JSON.parse(data);
            if (new Date(timestamp) < oldDate) {
              await AsyncStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }
}

// Initialize cleanup schedule
if (Platform.OS !== 'web') {
  // Run cleanup daily
  setInterval(
    () => {
      AITransparencyManager.cleanupOldData().catch(console.error);
    },
    24 * 60 * 60 * 1000,
  );
}

// Export helper functions for components
export function generatePlantIdentificationExplanation(
  confidence: number,
  factors: Record<string, number>,
): AIDecision {
  const decision: AIDecision = {
    confidence,
    factors: [],
    alternatives: [],
    dataSource: 'Plant recognition model v2.0',
    timestamp: new Date().toISOString(),
  };

  // Convert raw factors to explanations
  Object.entries(factors).forEach(([name, value]) => {
    let explanation = '';
    let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
    let weight = 0;

    switch (name) {
      case 'leafPattern':
        weight = 0.4;
        explanation = `Leaf pattern matches at ${Math.round(value * 100)}% similarity`;
        impact = value > 0.7 ? 'positive' : 'negative';
        break;
      case 'flowerPresence':
        weight = 0.3;
        explanation =
          value > 0.5 ? 'Distinctive flowers present' : 'No flowers visible';
        impact = value > 0.5 ? 'positive' : 'neutral';
        break;
      case 'plantStructure':
        weight = 0.3;
        explanation = `Overall plant structure is ${Math.round(value * 100)}% characteristic`;
        impact = value > 0.6 ? 'positive' : 'negative';
        break;
    }

    decision.factors.push({
      name,
      weight,
      value,
      threshold: 0.6,
      impact,
      explanation,
    });
  });

  return decision;
}

export function generateCareRecommendationExplanation(
  conditions: Record<string, number>,
  plantType: string,
): AIDecision {
  const decision: AIDecision = {
    confidence: 0,
    factors: [],
    alternatives: [],
    dataSource: 'Plant care recommendation engine v1.5',
    timestamp: new Date().toISOString(),
  };

  let totalWeight = 0;
  let weightedConfidence = 0;

  // Process each environmental factor
  Object.entries(conditions).forEach(([name, value]) => {
    const factor: DecisionFactor = {
      name,
      weight: 0,
      value,
      threshold: 0,
      impact: 'neutral',
      explanation: '',
    };

    switch (name) {
      case 'soilMoisture':
        factor.weight = 0.4;
        factor.threshold = 0.3;
        factor.explanation = `Soil moisture is ${Math.round(value * 100)}% - ${
          value < factor.threshold ? 'Water needed' : 'Adequate moisture'
        }`;
        factor.impact = value < factor.threshold ? 'negative' : 'positive';
        break;

      case 'lightLevel':
        factor.weight = 0.3;
        factor.threshold = 0.6;
        factor.explanation = `Light level is ${Math.round(value * 100)}% of optimal for ${plantType}`;
        factor.impact = value > factor.threshold ? 'positive' : 'negative';
        break;

      case 'temperature':
        factor.weight = 0.3;
        factor.threshold = 0.7;
        factor.explanation = `Temperature is ${Math.round(value * 100)}% within ideal range`;
        factor.impact = value > factor.threshold ? 'positive' : 'negative';
        break;
    }

    totalWeight += factor.weight;
    weightedConfidence += factor.weight * (factor.value / factor.threshold);
    decision.factors.push(factor);
  });

  decision.confidence = weightedConfidence / totalWeight;

  return decision;
}
