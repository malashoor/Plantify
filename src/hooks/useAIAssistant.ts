import { useState, useCallback, useEffect } from 'react';
import { AIContextService, AIContext } from '../services/AIContextService';
import { EmotionService, Emotion } from '../services/EmotionService';
import { MemoryService, Memory } from '../services/MemoryService';
import { supabase } from '../lib/supabase';

interface UseAIAssistantOptions {
  currentSeedId?: string;
  onError?: (error: Error) => void;
}

interface UseAIAssistantState {
  context: AIContext;
  isLoading: boolean;
  error: Error | null;
}

export function useAIAssistant(options: UseAIAssistantOptions = {}) {
  const [state, setState] = useState<UseAIAssistantState>({
    context: {},
    isLoading: true,
    error: null,
  });

  const refreshContext = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const context = await AIContextService.getContext(options.currentSeedId);
      setState(prev => ({ ...prev, context, isLoading: false }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get AI context');
      setState(prev => ({ ...prev, error: err, isLoading: false }));
      options.onError?.(err);
    }
  }, [options.currentSeedId, options.onError]);

  const processUserMessage = useCallback(async (
    message: string,
    userId: string
  ) => {
    try {
      // Detect and save emotion
      const emotion = EmotionService.detectEmotion(message);
      await EmotionService.saveEmotion(userId, emotion);

      // Save conversation memory
      await MemoryService.saveConversationMemory(
        userId,
        message,
        'user',
        {
          emotion,
          seedId: options.currentSeedId,
        }
      );

      // Refresh context to include new emotional state and memory
      await refreshContext();

      return emotion;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to process user message');
      options.onError?.(err);
      throw err;
    }
  }, [options.currentSeedId, options.onError, refreshContext]);

  const processAssistantResponse = useCallback(async (
    response: string,
    userId: string
  ) => {
    try {
      // Save conversation memory
      await MemoryService.saveConversationMemory(
        userId,
        response,
        'assistant',
        {
          seedId: options.currentSeedId,
        }
      );

      // Extract and save insights
      const insights = extractInsights(response);
      for (const insight of insights) {
        await MemoryService.saveInsight(
          userId,
          insight.content,
          insight.category,
          {
            seedId: options.currentSeedId,
          }
        );
      }

      // Extract and save actions
      const actions = extractActions(response);
      for (const action of actions) {
        await MemoryService.saveAction(
          userId,
          action.content,
          action.status,
          {
            seedId: options.currentSeedId,
          }
        );
      }

      // Extract and save preferences
      const preferences = extractPreferences(response);
      for (const pref of preferences) {
        await MemoryService.savePreference(
          userId,
          pref.content,
          pref.category,
          {
            seedId: options.currentSeedId,
          }
        );
      }

      // Refresh context to include new memories
      await refreshContext();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to process assistant response');
      options.onError?.(err);
      throw err;
    }
  }, [options.currentSeedId, options.onError, refreshContext]);

  const generatePromptContext = useCallback(() => {
    return AIContextService.generatePromptContext(state.context);
  }, [state.context]);

  // Initialize context
  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  return {
    context: state.context,
    isLoading: state.isLoading,
    error: state.error,
    refreshContext,
    processUserMessage,
    processAssistantResponse,
    generatePromptContext,
  };
}

// Helper functions to extract insights, actions, and preferences from assistant responses
function extractInsights(response: string): Array<{
  content: string;
  category: 'preference' | 'behavior' | 'knowledge' | 'challenge' | 'success';
}> {
  const insights: ReturnType<typeof extractInsights> = [];

  // Extract knowledge insights (e.g., "Did you know...", "Important to note...")
  const knowledgePatterns = [
    /did you know that ([^.!?]+)[.!?]/i,
    /important to note that ([^.!?]+)[.!?]/i,
    /key point: ([^.!?]+)[.!?]/i,
  ];

  knowledgePatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches?.[1]) {
      insights.push({
        content: matches[1].trim(),
        category: 'knowledge',
      });
    }
  });

  // Extract behavior insights (e.g., "I notice you often...", "You seem to prefer...")
  const behaviorPatterns = [
    /I notice (?:that )?you ([^.!?]+)[.!?]/i,
    /you seem to ([^.!?]+)[.!?]/i,
    /you tend to ([^.!?]+)[.!?]/i,
  ];

  behaviorPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches?.[1]) {
      insights.push({
        content: matches[1].trim(),
        category: 'behavior',
      });
    }
  });

  // Extract success insights (e.g., "Great job on...", "You've successfully...")
  const successPatterns = [
    /great job (?:on )?([^.!?]+)[.!?]/i,
    /you've successfully ([^.!?]+)[.!?]/i,
    /well done (?:on )?([^.!?]+)[.!?]/i,
  ];

  successPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches?.[1]) {
      insights.push({
        content: matches[1].trim(),
        category: 'success',
      });
    }
  });

  return insights;
}

function extractActions(response: string): Array<{
  content: string;
  status: 'suggested' | 'completed' | 'failed' | 'pending';
}> {
  const actions: ReturnType<typeof extractActions> = [];

  // Extract suggested actions (e.g., "You should...", "Try to...", "Consider...")
  const suggestedPatterns = [
    /you should ([^.!?]+)[.!?]/i,
    /try to ([^.!?]+)[.!?]/i,
    /consider ([^.!?]+)[.!?]/i,
    /I recommend ([^.!?]+)[.!?]/i,
  ];

  suggestedPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches?.[1]) {
      actions.push({
        content: matches[1].trim(),
        status: 'suggested',
      });
    }
  });

  // Extract completed actions (e.g., "You've completed...", "You already...")
  const completedPatterns = [
    /you've (?:already )?([^.!?]+)[.!?]/i,
    /you have (?:already )?([^.!?]+)[.!?]/i,
    /successfully ([^.!?]+)[.!?]/i,
  ];

  completedPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches?.[1]) {
      actions.push({
        content: matches[1].trim(),
        status: 'completed',
      });
    }
  });

  return actions;
}

function extractPreferences(response: string): Array<{
  content: string;
  category: 'plant' | 'care' | 'environment' | 'interaction';
}> {
  const preferences: ReturnType<typeof extractPreferences> = [];

  // Extract plant preferences (e.g., "You prefer...", "You like...")
  const plantPatterns = [
    /you prefer ([^.!?]+) plants[.!?]/i,
    /you like ([^.!?]+) plants[.!?]/i,
    /your favorite (?:type of )?plants? (?:is|are) ([^.!?]+)[.!?]/i,
  ];

  plantPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches?.[1]) {
      preferences.push({
        content: matches[1].trim(),
        category: 'plant',
      });
    }
  });

  // Extract care preferences (e.g., "You prefer to water...", "Your watering schedule...")
  const carePatterns = [
    /you prefer to ([^.!?]+) when caring for[.!?]/i,
    /your (?:preferred )?watering schedule is ([^.!?]+)[.!?]/i,
    /you like to ([^.!?]+) your plants[.!?]/i,
  ];

  carePatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches?.[1]) {
      preferences.push({
        content: matches[1].trim(),
        category: 'care',
      });
    }
  });

  // Extract environment preferences (e.g., "You prefer growing in...", "Your ideal growing conditions...")
  const environmentPatterns = [
    /you prefer growing (?:plants )?in ([^.!?]+)[.!?]/i,
    /your ideal growing conditions? (?:is|are) ([^.!?]+)[.!?]/i,
    /you like to keep your plants in ([^.!?]+)[.!?]/i,
  ];

  environmentPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches?.[1]) {
      preferences.push({
        content: matches[1].trim(),
        category: 'environment',
      });
    }
  });

  return preferences;
} 