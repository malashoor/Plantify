import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

interface ExportOptionsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onExport: (options: {
    includePhotos: boolean;
    includeCharts: boolean;
    includeComments: boolean;
  }) => void;
  type: 'pdf' | 'image';
}

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    background: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    primary: '#4CAF50',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
  },
});

// Custom CheckBox component
const CheckBox = ({
  title,
  checked,
  onPress,
  theme,
}: {
  title: string;
  checked: boolean;
  onPress: () => void;
  theme: any;
}) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <View style={[styles.checkbox, { borderColor: theme.colors.border }]}>
      {checked && <Ionicons name="checkmark" size={16} color={theme.colors.primary} />}
    </View>
    <Text style={[styles.checkboxText, { color: theme.colors.text }]}>{title}</Text>
  </TouchableOpacity>
);

// Custom Button component
const Button = ({
  title,
  onPress,
  type = 'primary',
  theme,
}: {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'clear';
  theme: any;
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      type === 'primary'
        ? { backgroundColor: theme.colors.primary }
        : { backgroundColor: 'transparent' },
    ]}
    onPress={onPress}
  >
    <Text
      style={[styles.buttonText, { color: type === 'primary' ? 'white' : theme.colors.primary }]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  isVisible,
  onClose,
  onExport,
  type,
}) => {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const [includePhotos, setIncludePhotos] = React.useState(true);
  const [includeCharts, setIncludeCharts] = React.useState(true);
  const [includeComments, setIncludeComments] = React.useState(true);

  const handleExport = () => {
    onExport({
      includePhotos,
      includeCharts,
      includeComments,
    });
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} animationType="slide" transparent>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Export as {type.toUpperCase()}
        </Text>

        <View style={styles.options}>
          <CheckBox
            title="Include Photos"
            checked={includePhotos}
            onPress={() => setIncludePhotos(!includePhotos)}
            theme={theme}
          />
          <CheckBox
            title="Include Charts"
            checked={includeCharts}
            onPress={() => setIncludeCharts(!includeCharts)}
            theme={theme}
          />
          <CheckBox
            title="Include Comments"
            checked={includeComments}
            onPress={() => setIncludeComments(!includeComments)}
            theme={theme}
          />
        </View>

        <View style={styles.actions}>
          <Button title="Cancel" onPress={onClose} type="clear" theme={theme} />
          <Button title="Export" onPress={handleExport} type="primary" theme={theme} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  options: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
