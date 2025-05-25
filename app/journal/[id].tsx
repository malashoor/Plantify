import { Text, Button, useTheme } from '@rneui/themed';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import Modal from 'react-native-modal';

import { View, StyleSheet, ScrollView, Image } from 'react-native';

import { ExportOptionsModal } from '../components/ExportOptionsModal';
import { PDFPreview } from '../components/PDFPreview';
import { SnapshotGenerator } from '../components/SnapshotGenerator';
import { useExport } from '../hooks/useExport';
import { useJournal } from '../hooks/useJournal';


export default function JournalDetailScreen() {
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
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
                const uri = await generatePDF({
                    title: journal.title,
                    content: journal.content,
                    photos: journal.photos,
                    type: 'journal',
                    comments: journal.comments,
                }, options);

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
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <SnapshotGenerator ref={snapshotRef}>
                    <View style={styles.header}>
                        <Text h4>{journal.title}</Text>
                        <Text style={styles.date}>
                            {format(new Date(journal.created_at), 'MMM d, yyyy')}
                        </Text>
                    </View>

                    <Text style={styles.journalContent}>{journal.content}</Text>

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
                            <Text h4>Comments</Text>
                            {journal.comments.map((comment, index) => (
                                <View key={index} style={styles.comment}>
                                    <Text>{comment}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </SnapshotGenerator>
            </ScrollView>

            <View style={styles.actions}>
                <Button
                    title="Export as PDF"
                    onPress={() => {
                        setExportType('pdf');
                        setShowExportModal(true);
                    }}
                    icon={{
                        name: 'file-pdf-box',
                        type: 'material-community',
                        color: 'white',
                        size: 20,
                    }}
                    containerStyle={styles.button}
                />
                <Button
                    title="Share Snapshot"
                    onPress={() => {
                        setExportType('image');
                        setShowExportModal(true);
                    }}
                    icon={{
                        name: 'share',
                        type: 'material-community',
                        color: 'white',
                        size: 20,
                    }}
                    containerStyle={styles.button}
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
                <View style={styles.previewContainer}>
                    {previewUri && <PDFPreview uri={previewUri} />}
                    <Button
                        title="Share"
                        onPress={() => previewUri && shareFile(previewUri, 'pdf')}
                        containerStyle={styles.previewButton}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    date: {
        color: '#666',
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
    comment: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    actions: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
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
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 12,
        padding: 16,
        height: '80%',
    },
    previewButton: {
        marginTop: 16,
    },
}); 