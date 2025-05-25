import { Text, Button, CheckBox, useTheme } from '@rneui/themed';
import React from 'react';
import Modal from 'react-native-modal';

import { View, StyleSheet } from 'react-native';

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

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
    isVisible,
    onClose,
    onExport,
    type,
}) => {
    const { theme } = useTheme();
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
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            animationType="slide"
            transparent
        >
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text h4 style={styles.title}>
                    Export as {type.toUpperCase()}
                </Text>

                <View style={styles.options}>
                    <CheckBox
                        title="Include Photos"
                        checked={includePhotos}
                        onPress={() => setIncludePhotos(!includePhotos)}
                        containerStyle={styles.checkbox}
                    />
                    <CheckBox
                        title="Include Charts"
                        checked={includeCharts}
                        onPress={() => setIncludeCharts(!includeCharts)}
                        containerStyle={styles.checkbox}
                    />
                    <CheckBox
                        title="Include Comments"
                        checked={includeComments}
                        onPress={() => setIncludeComments(!includeComments)}
                        containerStyle={styles.checkbox}
                    />
                </View>

                <View style={styles.actions}>
                    <Button
                        title="Cancel"
                        onPress={onClose}
                        type="clear"
                        containerStyle={styles.button}
                    />
                    <Button
                        title="Export"
                        onPress={handleExport}
                        containerStyle={styles.button}
                    />
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
        textAlign: 'center',
        marginBottom: 20,
    },
    options: {
        marginBottom: 20,
    },
    checkbox: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        marginLeft: 0,
        marginRight: 0,
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        marginLeft: 8,
    },
}); 