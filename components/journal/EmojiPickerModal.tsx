import { useTheme } from '@rneui/themed';
import React from 'react';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';

import { Modal, StyleSheet, View } from 'react-native';

interface EmojiPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export function EmojiPickerModal({ visible, onClose, onSelect }: EmojiPickerModalProps) {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityLabel="Emoji picker"
      accessibilityHint="Select an emoji for your plant"
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmojiSelector
          onEmojiSelected={onSelect}
          showSearchBar={false}
          showHistory={true}
          columns={8}
          category={Categories.nature}
          theme={theme.mode === 'dark' ? 'dark' : 'light'}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
}); 