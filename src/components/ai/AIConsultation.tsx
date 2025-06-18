import React, { useState, useEffect, useRef, useCallback, ElementRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  useColorScheme, 
  Alert, 
  ActivityIndicator,
  AccessibilityInfo,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { withPremiumAccess } from '../premium/withPremiumAccess';
import { useProtectedFeature } from '../../hooks/useProtectedFeature';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { AIContextService } from '../../services/AIContextService';
import { WeatherDisplay } from '../WeatherDisplay';
import { WeatherService, WeatherData } from '../../services/WeatherService';
import { useRoute, RouteProp } from '@react-navigation/native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  emotion?: 'neutral' | 'supportive' | 'concerned' | 'urgent';
}

interface RouteParams {
  seedId?: string;
}

function AIConsultationBase() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const scrollViewRef = useRef<ElementRef<typeof ScrollView>>(null);
  const inputRef = useRef<ElementRef<typeof TextInput>>(null);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const seedId = route.params?.seedId;

  const { protectedAction } = useProtectedFeature({
    featureId: 'unlimitedAI',
  });

  useEffect(() => {
    loadChatHistory();
    checkScreenReader();
    loadContext();
    loadWeatherData();
  }, [seedId]);

  const checkScreenReader = async () => {
    const enabled = await AccessibilityInfo.isScreenReaderEnabled();
    setIsScreenReaderEnabled(enabled);
  };

  const announceMessage = (message: string) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
      if (Platform.OS !== 'web') {
        Speech.speak(message, {
          language: 'en-US',
          rate: 0.5,
        });
      }
    }
  };

  const loadChatHistory = async () => {
    try {
      const { data: chatData, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const formattedMessages = chatData.map(msg => ({
        id: msg.id,
        text: msg.text,
        isUser: msg.is_user,
        timestamp: new Date(msg.timestamp),
        emotion: msg.emotion || 'neutral',
      }));

      setMessages(formattedMessages);
      
      if (isScreenReaderEnabled) {
        announceMessage(t('ai.accessibility.chat_history_loaded'));
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
      announceMessage(t('ai.accessibility.error_occurred'));
    }
  };

  const loadContext = async () => {
    setIsContextLoading(true);
    try {
      const context = await AIContextService.getContext(seedId);
      const contextPrompt = AIContextService.generatePromptContext(context);
      const careInstructions = AIContextService.getLocationBasedCareInstructions(context);
      
      // Add context and care instructions to initial messages if available
      if (contextPrompt || careInstructions) {
        const message: Message = {
          id: 'context',
          text: `${contextPrompt}\n\n${careInstructions}`,
          isUser: false,
          timestamp: new Date(),
          emotion: 'neutral'
        };
        setMessages([message]);
      }
    } catch (error) {
      console.error('Error loading AI context:', error);
    } finally {
      setIsContextLoading(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      const weatherData = await WeatherService.getCurrentWeather();
      setWeather(weatherData);
    } catch (error) {
      console.error('Error loading weather data:', error);
    }
  };

  const handleSend = protectedAction(async () => {
    if (!input.trim()) return;

    setLoading(true);
    announceMessage(t('ai.accessibility.sending_message'));

    try {
      // Save user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      const { error: userMsgError } = await supabase
        .from('ai_chat_history')
        .insert({
          text: userMessage.text,
          is_user: true,
          timestamp: userMessage.timestamp.toISOString(),
        });

      if (userMsgError) throw userMsgError;

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      scrollToBottom();
      announceMessage(t('ai.accessibility.message_sent'));

      // Announce typing state
      announceMessage(t('ai.accessibility.assistant_typing'));

      // Get AI response using Supabase Edge Function
      const { data: aiResponseData, error: aiError } = await supabase
        .functions.invoke('ai-chat', {
          body: { 
            message: userMessage.text,
            context: messages,
            weather: weather,
            seedId: seedId
          }
        });

      if (aiError) throw aiError;

      if (!aiResponseData || !aiResponseData.text) {
        throw new Error('Invalid AI response format');
      }

      // Determine emotion and provide haptic feedback
      const emotion = determineEmotion(aiResponseData.text);
      if (emotion === 'urgent') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (emotion === 'supportive') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Save AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseData.text,
        isUser: false,
        timestamp: new Date(),
        emotion: emotion
      };

      const { error: aiMsgError } = await supabase
        .from('ai_chat_history')
        .insert({
          text: aiMessage.text,
          is_user: false,
          timestamp: aiMessage.timestamp.toISOString(),
          emotion: emotion
        });

      if (aiMsgError) throw aiMsgError;

      setMessages(prev => [...prev, aiMessage]);
      scrollToBottom();
      announceMessage(t('ai.accessibility.received_response'));

    } catch (error) {
      console.error('Error in chat:', error);
      Alert.alert(
        t('ai.error.title'),
        t('ai.error.message'),
        [{ text: t('common.ok') }]
      );
      announceMessage(t('ai.accessibility.error_occurred'));
    } finally {
      setLoading(false);
    }
  });

  const determineEmotion = (text: string): Message['emotion'] => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('urgent') || lowerText.includes('immediately')) {
      return 'urgent';
    } else if (lowerText.includes('recommend') || lowerText.includes('suggest')) {
      return 'supportive';
    } else if (lowerText.includes('concern') || lowerText.includes('careful')) {
      return 'concerned';
    }
    return 'neutral';
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleInputFocus = () => {
    announceMessage(t('ai.accessibility.input_focused'));
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    if (text.length > 300) {
      announceMessage(t('ai.accessibility.character_count', { count: text.length }));
    }
  };

  const handleKeyboardShortcuts = useCallback((e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    const isCmdOrCtrl = Platform.OS === 'ios' ? e.nativeEvent.metaKey : e.nativeEvent.ctrlKey;
    
    if (!isCmdOrCtrl) return;

    switch (e.nativeEvent.key) {
      case 'Enter':
        // Already handled in handleKeyCommand
        break;
      case 'k':
        inputRef.current?.focus();
        break;
      case 'l':
        loadChatHistory();
        break;
      default:
        break;
    }
  }, []);

  const handleKeyCommand = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    handleKeyboardShortcuts(e);
  };

  const renderKeyboardShortcutsButton = () => (
    <TouchableOpacity
      onPress={showKeyboardShortcuts}
      style={styles.shortcutsButton}
      accessibilityLabel={t('ai.accessibility.keyboard_shortcuts')}
    >
      <Ionicons name="keypad-outline" size={24} color={isDark ? '#fff' : '#000'} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View 
      style={styles.emptyState}
      accessibilityLabel={t('ai.accessibility.empty_state')}
      accessibilityRole="summary"
    >
      <Ionicons 
        name="chatbubbles-outline" 
        size={64} 
        color={isDark ? '#9CA3AF' : '#6B7280'} 
      />
      <Text style={[styles.emptyTitle, isDark && styles.textDark]}>
        {t('ai.emptyTitle')}
      </Text>
      <Text style={[styles.emptyDescription, isDark && styles.textLightDark]}>
        {t('ai.emptyDescription')}
      </Text>
      <View style={styles.exampleQuestions}>
        <Text style={[styles.exampleTitle, isDark && styles.textDark]}>
          {t('ai.tryAsking')}:
        </Text>
        {[
          "Why are my plant's leaves turning yellow?",
          "How often should I water my succulents?",
        ].map((question, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.exampleButton}
            onPress={() => setInput(question)}
            accessibilityRole="button"
            accessibilityLabel={t('ai.accessibility.example_question')}
            accessibilityHint={question}
          >
            <Text style={[styles.exampleText, isDark && styles.textDark]}>
              "{question}"
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMessage = (message: Message) => {
    const isLocationAware = message.text.includes(t('seeds.location.detected')) ||
      message.text.includes(t('ai.location_aware'));

    return (
      <View
        key={message.id}
        style={[
          styles.message,
          message.isUser ? styles.userMessage : styles.aiMessage,
          isDark && (message.isUser ? styles.userMessageDark : styles.aiMessageDark),
        ]}
        accessibilityRole="text"
        accessibilityLabel={`${message.isUser ? t('ai.user_message') : t('ai.assistant_message')}: ${message.text}`}
      >
        {!message.isUser && isLocationAware && (
          <View style={styles.locationBadge}>
            <Ionicons
              name="location"
              size={12}
              color={isDark ? '#22C55E' : '#16A34A'}
            />
            <Text style={[styles.locationBadgeText, isDark && styles.locationBadgeTextDark]}>
              {t('ai.location_aware')}
            </Text>
          </View>
        )}
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.aiMessageText,
          isDark && (message.isUser ? styles.userMessageTextDark : styles.aiMessageTextDark),
        ]}>
          {message.text}
        </Text>
        <Text style={[styles.timestamp, isDark && styles.timestampDark]}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={isDark ? '#22C55E' : '#16A34A'} />
      <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
        {isContextLoading ? t('ai.loading_context') : t('ai.thinking')}
      </Text>
    </View>
  );

  const showKeyboardShortcuts = () => {
    const shortcuts = [
      `${Platform.OS === 'ios' ? '⌘' : 'Ctrl'} + Enter: ${t('ai.accessibility.shortcut_send')}`,
      `${Platform.OS === 'ios' ? '⌘' : 'Ctrl'} + K: ${t('ai.accessibility.shortcut_focus')}`,
      `${Platform.OS === 'ios' ? '⌘' : 'Ctrl'} + L: ${t('ai.accessibility.shortcut_load')}`,
    ].join('\n');

    Alert.alert(
      t('ai.accessibility.shortcuts_title'),
      shortcuts,
      [{ text: 'OK', onPress: () => announceMessage(t('ai.accessibility.shortcuts_closed')) }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, isDark && styles.containerDark]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messages}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToBottom}
      >
        {messages.length === 0 ? renderEmptyState() :
          messages.map((message) => (
            renderMessage(message))
          ))
        )}
        {loading && (
          renderLoadingState()
        )}
      </ScrollView>
      <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={handleInputChange}
          onFocus={handleInputFocus}
          onKeyPress={handleKeyCommand}
          placeholder={t('ai.input.placeholder')}
          placeholderTextColor={isDark ? '#98989D' : '#8E8E93'}
          style={[styles.input, isDark && styles.inputDark]}
          multiline
          maxLength={1000}
          accessibilityLabel={t('ai.accessibility.message_input')}
          accessibilityHint={t('ai.accessibility.message_input_hint')}
        />
        <TouchableOpacity
          style={[styles.sendButton, isDark && styles.sendButtonDark]}
          onPress={handleSend}
          accessibilityLabel={t('ai.accessibility.send_button')}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
        {renderKeyboardShortcutsButton()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  messages: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9E9EB',
  },
  userMessageDark: {
    backgroundColor: '#0A84FF',
  },
  aiMessageDark: {
    backgroundColor: '#2C2C2E',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000',
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#000',
  },
  userMessageTextDark: {
    color: '#fff',
  },
  aiMessageTextDark: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  timestampDark: {
    color: '#98989D',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9E9EB',
  },
  inputContainerDark: {
    borderTopColor: '#38383A',
  },
  input: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    fontSize: 16,
    maxHeight: 100,
  },
  inputDark: {
    backgroundColor: '#2C2C2E',
    color: '#fff',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDark: {
    backgroundColor: '#0A84FF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
    lineHeight: 24,
  },
  exampleQuestions: {
    width: '100%',
    paddingHorizontal: 32,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  exampleButton: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#111827',
  },
  textDark: {
    color: '#F3F4F6',
  },
  textLightDark: {
    color: '#9CA3AF',
  },
  shortcutsButton: {
    padding: 8,
    marginLeft: 8,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  locationBadgeText: {
    fontSize: 12,
    color: '#16A34A',
  },
  locationBadgeTextDark: {
    color: '#22C55E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  loadingTextDark: {
    color: '#F3F4F6',
  },
  weatherContainer: {
    marginBottom: 16,
  },
});

// Wrap with premium access protection
export const AIConsultation = withPremiumAccess(AIConsultationBase, {
  featureId: 'unlimitedAI',
  variant: 'overlay',
}); 