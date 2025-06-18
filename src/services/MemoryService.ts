import { supabase } from '../lib/supabase';
import { Emotion } from './EmotionService';

export interface Memory {
  id: string;
  userId: string;
  type: 'conversation' | 'insight' | 'action' | 'preference';
  content: string;
  context?: {
    emotion?: Emotion;
    seedId?: string;
    location?: string;
    weather?: string;
  };
  importance: number; // 0-1
  timestamp: string;
  tags: string[];
}

export interface ConversationMemory extends Memory {
  type: 'conversation';
  role: 'user' | 'assistant';
}

export interface InsightMemory extends Memory {
  type: 'insight';
  category: 'preference' | 'behavior' | 'knowledge' | 'challenge' | 'success';
}

export interface ActionMemory extends Memory {
  type: 'action';
  status: 'suggested' | 'completed' | 'failed' | 'pending';
}

export interface PreferenceMemory extends Memory {
  type: 'preference';
  category: 'plant' | 'care' | 'environment' | 'interaction';
}

export class MemoryService {
  static async saveMemory(memory: Omit<Memory, 'id'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('memories')
        .insert([
          {
            user_id: memory.userId,
            type: memory.type,
            content: memory.content,
            context: memory.context,
            importance: memory.importance,
            timestamp: memory.timestamp,
            tags: memory.tags,
          },
        ])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error saving memory:', error);
      throw error;
    }
  }

  static async getRecentMemories(
    userId: string,
    options: {
      types?: Memory['type'][];
      limit?: number;
      tags?: string[];
      minImportance?: number;
    } = {}
  ): Promise<Memory[]> {
    try {
      let query = supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (options.types?.length) {
        query = query.in('type', options.types);
      }

      if (options.tags?.length) {
        query = query.contains('tags', options.tags);
      }

      if (options.minImportance !== undefined) {
        query = query.gte('importance', options.minImportance);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Memory[];
    } catch (error) {
      console.error('Error getting memories:', error);
      return [];
    }
  }

  static async searchMemories(
    userId: string,
    searchTerm: string,
    options: {
      types?: Memory['type'][];
      tags?: string[];
      limit?: number;
    } = {}
  ): Promise<Memory[]> {
    try {
      let query = supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .textSearch('content', searchTerm)
        .order('timestamp', { ascending: false });

      if (options.types?.length) {
        query = query.in('type', options.types);
      }

      if (options.tags?.length) {
        query = query.contains('tags', options.tags);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Memory[];
    } catch (error) {
      console.error('Error searching memories:', error);
      return [];
    }
  }

  static async saveConversationMemory(
    userId: string,
    content: string,
    role: 'user' | 'assistant',
    context?: ConversationMemory['context']
  ): Promise<string> {
    const memory: Omit<ConversationMemory, 'id'> = {
      userId,
      type: 'conversation',
      role,
      content,
      context,
      importance: this.calculateImportance(content),
      timestamp: new Date().toISOString(),
      tags: this.extractTags(content),
    };

    return this.saveMemory(memory);
  }

  static async saveInsight(
    userId: string,
    content: string,
    category: InsightMemory['category'],
    context?: InsightMemory['context']
  ): Promise<string> {
    const memory: Omit<InsightMemory, 'id'> = {
      userId,
      type: 'insight',
      category,
      content,
      context,
      importance: 0.8, // Insights are generally important
      timestamp: new Date().toISOString(),
      tags: this.extractTags(content),
    };

    return this.saveMemory(memory);
  }

  static async saveAction(
    userId: string,
    content: string,
    status: ActionMemory['status'],
    context?: ActionMemory['context']
  ): Promise<string> {
    const memory: Omit<ActionMemory, 'id'> = {
      userId,
      type: 'action',
      status,
      content,
      context,
      importance: 0.6,
      timestamp: new Date().toISOString(),
      tags: this.extractTags(content),
    };

    return this.saveMemory(memory);
  }

  static async savePreference(
    userId: string,
    content: string,
    category: PreferenceMemory['category'],
    context?: PreferenceMemory['context']
  ): Promise<string> {
    const memory: Omit<PreferenceMemory, 'id'> = {
      userId,
      type: 'preference',
      category,
      content,
      context,
      importance: 0.7,
      timestamp: new Date().toISOString(),
      tags: this.extractTags(content),
    };

    return this.saveMemory(memory);
  }

  private static calculateImportance(content: string): number {
    // Simple importance calculation based on content length and key indicators
    const indicators = [
      'important',
      'critical',
      'urgent',
      'remember',
      'note',
      'problem',
      'success',
      'achievement',
      'preference',
      'always',
      'never',
    ];

    const words = content.toLowerCase().split(/\s+/);
    const hasIndicators = indicators.some(i => words.includes(i));
    const lengthFactor = Math.min(words.length / 50, 1); // Longer content might be more important

    return hasIndicators ? Math.max(0.6, lengthFactor) : Math.min(0.4, lengthFactor);
  }

  private static extractTags(content: string): string[] {
    const tags = new Set<string>();

    // Extract plant-related tags
    const plantTags = [
      'watering',
      'fertilizer',
      'pruning',
      'repotting',
      'pest',
      'disease',
      'light',
      'temperature',
      'humidity',
      'soil',
      'growth',
      'flowering',
      'propagation',
    ];

    const words = content.toLowerCase().split(/\s+/);
    plantTags.forEach(tag => {
      if (words.includes(tag)) {
        tags.add(tag);
      }
    });

    // Extract emotion-related tags
    const emotionTags = ['happy', 'worried', 'frustrated', 'curious', 'satisfied', 'concerned'];

    emotionTags.forEach(tag => {
      if (content.toLowerCase().includes(tag)) {
        tags.add(tag);
      }
    });

    return Array.from(tags);
  }

  static generateMemorySummary(memories: Memory[]): string {
    if (!memories.length) return '';

    const parts: string[] = [];

    // Group memories by type
    const grouped = memories.reduce(
      (acc, memory) => {
        acc[memory.type] = acc[memory.type] || [];
        acc[memory.type].push(memory);
        return acc;
      },
      {} as Record<Memory['type'], Memory[]>
    );

    // Summarize insights
    if (grouped.insight?.length) {
      const insights = grouped.insight as InsightMemory[];
      const categories = insights.reduce(
        (acc, insight) => {
          acc[insight.category] = acc[insight.category] || 0;
          acc[insight.category]++;
          return acc;
        },
        {} as Record<string, number>
      );

      const categoryList = Object.entries(categories)
        .map(([category, count]) => `${count} ${category}`)
        .join(', ');

      parts.push(`Key insights (${categoryList})`);
    }

    // Summarize actions
    if (grouped.action?.length) {
      const actions = grouped.action as ActionMemory[];
      const completed = actions.filter(a => a.status === 'completed').length;
      const pending = actions.filter(a => a.status === 'pending').length;

      if (completed || pending) {
        parts.push(`Actions: ${completed} completed, ${pending} pending`);
      }
    }

    // Summarize preferences
    if (grouped.preference?.length) {
      const preferences = grouped.preference as PreferenceMemory[];
      const recentPrefs = preferences
        .slice(0, 3)
        .map(p => p.content)
        .join('; ');

      parts.push(`Recent preferences: ${recentPrefs}`);
    }

    // Add conversation summary if available
    if (grouped.conversation?.length) {
      const conversations = grouped.conversation as ConversationMemory[];
      const topics = new Set(conversations.flatMap(c => c.tags));

      if (topics.size) {
        parts.push(`Recent topics discussed: ${Array.from(topics).join(', ')}`);
      }
    }

    return parts.join('\n');
  }
}
