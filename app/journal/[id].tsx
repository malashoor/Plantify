import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';

import { ExportOptionsModal } from '../../components/ExportOptionsModal';
import { PDFPreview } from '../../components/PDFPreview';
import { SnapshotGenerator } from '../../components/SnapshotGenerator';
import { useExport } from '../../hooks/useExport';
import { useJournal } from '../../hooks/useJournal';

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    background: colorScheme === 'dark' ? '#1E1E1E' : '#F5F5F5',
    surface: colorScheme === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
    border: colorScheme === 'dark' ? '#444444' : '#E0E0E0',
  },
});

// Custom Button component
const Button = ({
  title,
  onPress,
  iconName,
  theme,
  style,
}: {
  title: string;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  theme: any;
  style?: any;
}) => (
  <TouchableOpacity
    style={[styles.buttonBase, { backgroundColor: theme.colors.primary }, style]}
    onPress={onPress}
  >
    <View style={styles.buttonContent}>
      {iconName && <Ionicons name={iconName} size={20} color="white" style={styles.buttonIcon} />}
      <Text style={styles.buttonText}>{title}</Text>
    </View>
  </TouchableOpacity>
);

export default function JournalDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const router = useRouter();
  const { journal, isLoading } = useJournal(id as string);
  const { generatePDF, generateSnapshot, shareFile } = useExport();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'image'>('pdf');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const snapshotRef = useRef<View>(null);

  const handleExport = async (options: {
    includePhotos: boolean;
    includeCharts: boolean;
    includeComments: boolean;
  }) => {
    try {
      if (!journal) return;

      if (exportType === 'pdf') {
        const uri = await generatePDF(
          {
            title: journal.title,
            content: journal.content,
            photos: journal.photos,
            type: 'journal',
            comments: journal.comments,
          },
          options
        );

        setPreviewUri(uri);
      } else {
        if (!snapshotRef.current) return;

        const uri = await generateSnapshot(snapshotRef);
        await shareFile(uri, 'image');
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading || !journal) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <SnapshotGenerator ref={snapshotRef}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{journal.title}</Text>
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
              {format(new Date(journal.created_at), 'MMM d, yyyy')}
            </Text>
          </View>

          <Text style={[styles.journalContent, { color: theme.colors.text }]}>
            {journal.content}
          </Text>

          {journal.photos && journal.photos.length > 0 && (
            <View style={styles.photos}>
              {journal.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                  accessibilityLabel={`Journal photo ${index + 1}`}
                />
              ))}
            </View>
          )}

          {journal.comments && journal.comments.length > 0 && (
            <View style={styles.comments}>
              <Text style={[styles.commentsTitle, { color: theme.colors.text }]}>Comments</Text>
              {journal.comments.map((comment, index) => (
                <View
                  key={index}
                  style={[styles.comment, { backgroundColor: theme.colors.surface }]}
                >
                  <Text style={{ color: theme.colors.text }}>{comment}</Text>
                </View>
              ))}
            </View>
          )}
        </SnapshotGenerator>
      </ScrollView>

      <View
        style={[
          styles.actions,
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        ]}
      >
        <Button
          title="Export as PDF"
          onPress={() => {
            setExportType('pdf');
            setShowExportModal(true);
          }}
          iconName="document"
          theme={theme}
          style={styles.button}
        />
        <Button
          title="Share Snapshot"
          onPress={() => {
            setExportType('image');
            setShowExportModal(true);
          }}
          iconName="share"
          theme={theme}
          style={styles.button}
        />
      </View>

      <ExportOptionsModal
        isVisible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        type={exportType}
      />

      <Modal
        isVisible={!!previewUri}
        onBackdropPress={() => setPreviewUri(null)}
        style={styles.previewModal}
      >
        <View style={[styles.previewContainer, { backgroundColor: theme.colors.surface }]}>
          {previewUri && <PDFPreview uri={previewUri} />}
          <Button
            title="Share"
            onPress={() => previewUri && shareFile(previewUri, 'pdf')}
            theme={theme}
            style={styles.previewButton}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    marginTop: 4,
  },
  journalContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  photos: {
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  comments: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comment: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  buttonBase: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  previewModal: {
    margin: 0,
    justifyContent: 'center',
  },
  previewContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 16,
    height: '80%',
  },
  previewButton: {
    marginTop: 16,
  },
});
