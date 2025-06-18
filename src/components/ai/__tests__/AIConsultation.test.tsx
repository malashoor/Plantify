import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { AIConsultation } from '../AIConsultation';
import { useTranslation } from 'react-i18next';
import { useProtectedFeature } from '../../../hooks/useProtectedFeature';
import { supabase } from '../../../lib/supabase';
import {
  commonAccessibilityTests,
  mockAccessibilityInfo,
  mockAccessibilityHooks,
  createAccessibilityTestHelpers,
} from '../../../screens/tools/__tests__/accessibility-test-utils';

// Mock the hooks and dependencies
jest.mock('react-i18next');
jest.mock('../../../hooks/useProtectedFeature');
jest.mock('../../../lib/supabase');
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Set up accessibility mocks
mockAccessibilityInfo();
mockAccessibilityHooks();

describe('AIConsultation Accessibility', () => {
  const mockT = jest.fn((key) => key);
  const mockI18n = { language: 'en' };
  const mockMessages = [
    {
      id: '1',
      text: 'Why are my plant leaves turning yellow?',
      isUser: true,
      timestamp: new Date(),
    },
    {
      id: '2',
      text: 'Yellowing leaves can be caused by several factors...',
      isUser: false,
      timestamp: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT, i18n: mockI18n });
    (useProtectedFeature as jest.Mock).mockReturnValue({
      protectedAction: (fn: Function) => fn,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockMessages, error: null }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  // Run common accessibility tests
  commonAccessibilityTests.testBasicAccessibility(
    () => render(<AIConsultation />),
    mockT,
    {
      labels: [
        'ai.accessibility.chat_container',
        'ai.accessibility.message_input',
        'ai.accessibility.send_button',
        'ai.accessibility.empty_state',
      ],
      roles: {
        'ai.accessibility.message_input': 'textbox',
        'ai.accessibility.send_button': 'button',
      },
      announcements: [
        'ai.accessibility.screen_loaded',
        'ai.accessibility.ready_for_input',
      ],
      focusOrder: [
        'ai.accessibility.message_input',
        'ai.accessibility.send_button',
      ],
    }
  );

  it('announces new messages via screen reader', async () => {
    const { getByA11yLabel, getByPlaceholderText } = render(<AIConsultation />);
    
    const input = getByPlaceholderText('ai.askPlaceholder');
    const sendButton = getByA11yLabel('ai.accessibility.send_button');

    await act(async () => {
      fireEvent.changeText(input, 'Test question');
      fireEvent.press(sendButton);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('ai.accessibility.message_sent')
    );
  });

  it('provides accessible message history navigation', async () => {
    const { getAllByA11yRole } = render(<AIConsultation />);
    
    const messages = getAllByA11yRole('article');
    expect(messages).toHaveLength(mockMessages.length);
    
    messages.forEach((message, index) => {
      const isUser = mockMessages[index].isUser;
      expect(message.props.accessibilityLabel).toContain(
        isUser ? 'ai.accessibility.user_message' : 'ai.accessibility.assistant_message'
      );
    });
  });

  it('announces AI typing state', async () => {
    const { getByA11yLabel, getByPlaceholderText } = render(<AIConsultation />);
    
    const input = getByPlaceholderText('ai.askPlaceholder');
    const sendButton = getByA11yLabel('ai.accessibility.send_button');

    await act(async () => {
      fireEvent.changeText(input, 'Test question');
      fireEvent.press(sendButton);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('ai.accessibility.assistant_typing')
    );
  });

  it('provides accessible error feedback', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: 'Test error' }),
    });

    const { getByA11yLabel } = render(<AIConsultation />);
    
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        expect.stringContaining('ai.accessibility.error_occurred')
      );
    });
  });

  it('supports keyboard shortcuts', async () => {
    const { getByPlaceholderText } = render(<AIConsultation />);
    
    const input = getByPlaceholderText('ai.askPlaceholder');
    
    await act(async () => {
      // Simulate Enter key press
      fireEvent.keyPress(input, { key: 'Enter', code: 13, modifiers: ['cmd'] });
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('ai.accessibility.message_sent')
    );
  });

  it('announces emotional context of AI responses', async () => {
    const { getByA11yLabel, getAllByA11yRole } = render(<AIConsultation />);
    
    const messages = getAllByA11yRole('article');
    const aiMessage = messages.find(
      msg => msg.props.accessibilityLabel?.includes('ai.accessibility.assistant_message')
    );

    expect(aiMessage?.props.accessibilityHint).toContain('ai.accessibility.supportive_tone');
  });

  it('provides accessible empty state with example questions', () => {
    const { getByA11yLabel, getAllByA11yRole } = render(<AIConsultation />);
    
    const emptyState = getByA11yLabel('ai.accessibility.empty_state');
    const exampleButtons = getAllByA11yRole('button').filter(
      button => button.props.accessibilityHint?.includes('ai.accessibility.example_question')
    );

    expect(emptyState).toBeTruthy();
    expect(exampleButtons.length).toBeGreaterThan(0);
  });

  it('announces message character count for long messages', async () => {
    const { getByPlaceholderText } = render(<AIConsultation />);
    
    const input = getByPlaceholderText('ai.askPlaceholder');
    const longText = 'a'.repeat(400);

    await act(async () => {
      fireEvent.changeText(input, longText);
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      expect.stringContaining('ai.accessibility.character_count')
    );
  });

  it('provides accessible timestamp information', () => {
    const { getAllByA11yRole } = render(<AIConsultation />);
    
    const messages = getAllByA11yRole('article');
    messages.forEach(message => {
      expect(message.props.accessibilityHint).toMatch(
        /ai\.accessibility\.(sent|received)_at/
      );
    });
  });
}); 