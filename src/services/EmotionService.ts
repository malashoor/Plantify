import { supabase } from '../lib/supabase';

export interface Emotion {
  type: 'joy' | 'concern' | 'frustration' | 'curiosity' | 'satisfaction' | 'neutral';
  intensity: number; // 0-1
  timestamp: string;
  context?: string;
}

export interface EmotionalState {
  currentEmotion: Emotion;
  recentEmotions: Emotion[];
  dominantEmotion?: {
    type: Emotion['type'];
    frequency: number;
  };
  emotionalTrend: 'improving' | 'declining' | 'stable';
}

export class EmotionService {
  private static readonly EMOTION_KEYWORDS = {
    joy: ['happy', 'excited', 'great', 'wonderful', 'love', 'amazing', '😊', '😃', '🌱'],
    concern: ['worried', 'concerned', 'problem', 'issue', 'help', 'dying', '😟', '😕', '😰'],
    frustration: ['frustrated', 'annoying', 'not working', 'failed', 'angry', '😠', '😤', '😡'],
    curiosity: ['curious', 'wonder', 'how', 'what if', 'question', 'learn', '🤔', '❓'],
    satisfaction: ['satisfied', 'proud', 'achieved', 'success', 'working', '👍', '✅'],
  };

  private static readonly EMOTION_PATTERNS = {
    joy: /\b(happy|excited|great|wonderful|love|amazing)\b|😊|😃|🌱/i,
    concern: /\b(worried|concerned|problem|issue|help|dying)\b|😟|😕|😰/i,
    frustration: /\b(frustrated|annoying|not working|failed|angry)\b|😠|😤|😡/i,
    curiosity: /\b(curious|wonder|how|what if|question|learn)\b|🤔|❓/i,
    satisfaction: /\b(satisfied|proud|achieved|success|working)\b|👍|✅/i,
  };

  static detectEmotion(message: string): Emotion {
    let detectedEmotion: Emotion['type'] = 'neutral';
    let maxIntensity = 0;

    // Check each emotion pattern
    for (const [emotion, pattern] of Object.entries(this.EMOTION_PATTERNS)) {
      const matches = message.match(pattern);
      if (matches) {
        const intensity = matches.length / message.split(' ').length;
        if (intensity > maxIntensity) {
          detectedEmotion = emotion as Emotion['type'];
          maxIntensity = intensity;
        }
      }
    }

    return {
      type: detectedEmotion,
      intensity: maxIntensity,
      timestamp: new Date().toISOString(),
      context: message,
    };
  }

  static async saveEmotion(userId: string, emotion: Emotion): Promise<void> {
    try {
      const { error } = await supabase.from('user_emotions').insert([
        {
          user_id: userId,
          emotion_type: emotion.type,
          intensity: emotion.intensity,
          timestamp: emotion.timestamp,
          context: emotion.context,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving emotion:', error);
    }
  }

  static async getEmotionalState(userId: string): Promise<EmotionalState> {
    try {
      // Get recent emotions (last 10)
      const { data: recentData, error: recentError } = await supabase
        .from('user_emotions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      const recentEmotions = recentData.map(e => ({
        type: e.emotion_type,
        intensity: e.intensity,
        timestamp: e.timestamp,
        context: e.context,
      })) as Emotion[];

      // Get emotion frequencies
      const frequencies: Record<Emotion['type'], number> = {
        joy: 0,
        concern: 0,
        frustration: 0,
        curiosity: 0,
        satisfaction: 0,
        neutral: 0,
      };

      recentEmotions.forEach(e => frequencies[e.type]++);

      // Find dominant emotion
      let dominantEmotion: EmotionalState['dominantEmotion'] | undefined;
      let maxFreq = 0;
      Object.entries(frequencies).forEach(([type, freq]) => {
        if (freq > maxFreq) {
          maxFreq = freq;
          dominantEmotion = {
            type: type as Emotion['type'],
            frequency: freq / recentEmotions.length,
          };
        }
      });

      // Calculate emotional trend
      const emotionalTrend = this.calculateEmotionalTrend(recentEmotions);

      return {
        currentEmotion: recentEmotions[0] || {
          type: 'neutral',
          intensity: 0,
          timestamp: new Date().toISOString(),
        },
        recentEmotions,
        dominantEmotion,
        emotionalTrend,
      };
    } catch (error) {
      console.error('Error getting emotional state:', error);
      return {
        currentEmotion: {
          type: 'neutral',
          intensity: 0,
          timestamp: new Date().toISOString(),
        },
        recentEmotions: [],
        emotionalTrend: 'stable',
      };
    }
  }

  private static calculateEmotionalTrend(emotions: Emotion[]): EmotionalState['emotionalTrend'] {
    if (emotions.length < 2) return 'stable';

    const positiveEmotions = ['joy', 'satisfaction'];
    const negativeEmotions = ['concern', 'frustration'];

    const recentPositive = emotions
      .slice(0, 3)
      .filter(e => positiveEmotions.includes(e.type)).length;

    const olderPositive = emotions.slice(-3).filter(e => positiveEmotions.includes(e.type)).length;

    if (recentPositive > olderPositive) return 'improving';
    if (recentPositive < olderPositive) return 'declining';
    return 'stable';
  }

  static generateEmotionalSummary(state: EmotionalState): string {
    const parts: string[] = [];

    // Add current emotional state
    if (state.currentEmotion.type !== 'neutral') {
      parts.push(
        `The user is currently showing signs of ${state.currentEmotion.type} ` +
          `(intensity: ${Math.round(state.currentEmotion.intensity * 100)}%).`
      );
    }

    // Add dominant emotion if available
    if (state.dominantEmotion && state.dominantEmotion.type !== 'neutral') {
      parts.push(
        `Their dominant emotion has been ${state.dominantEmotion.type} ` +
          `(${Math.round(state.dominantEmotion.frequency * 100)}% of recent interactions).`
      );
    }

    // Add emotional trend
    if (state.emotionalTrend !== 'stable') {
      parts.push(`Their emotional state appears to be ${state.emotionalTrend}.`);
    }

    // Add suggestion based on emotional state
    parts.push(this.getEmotionalSuggestion(state));

    return parts.join(' ');
  }

  private static getEmotionalSuggestion(state: EmotionalState): string {
    switch (state.currentEmotion.type) {
      case 'joy':
        return 'Maintain this positive energy by encouraging their enthusiasm and sharing their success.';
      case 'concern':
        return 'Provide reassurance and clear, actionable advice to address their concerns.';
      case 'frustration':
        return 'Acknowledge their frustration and offer step-by-step guidance to resolve the issue.';
      case 'curiosity':
        return 'Encourage their interest by providing detailed explanations and suggesting related topics to explore.';
      case 'satisfaction':
        return 'Build on their success by suggesting new challenges or advanced techniques.';
      default:
        return 'Maintain a supportive and informative tone.';
    }
  }
}
