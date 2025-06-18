import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface PhotoPickerProps {
    onImageSelected: (uri: string) => void;
    initialImage?: string | null;
    disabled?: boolean;
}

export const PhotoPicker = ({ onImageSelected, initialImage, disabled = false }: PhotoPickerProps) => {
    const [image, setImage] = useState<string | null>(initialImage || null);

    const takePhoto = () => {
        Alert.alert('Camera', 'Camera functionality will be implemented');
        // Simulate selecting an image
        const mockUri = 'https://example.com/mock-plant-image.jpg';
        setImage(mockUri);
        onImageSelected(mockUri);
    };

    const pickImage = () => {
        Alert.alert('Gallery', 'Gallery functionality will be implemented');
        // Simulate selecting an image
        const mockUri = 'https://example.com/mock-plant-image.jpg';
        setImage(mockUri);
        onImageSelected(mockUri);
    };

    return (
        <View style={styles.container}>
            {image ? (
                <View style={styles.imageContainer}>
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.imageText}>📷 Image Selected</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, disabled && styles.buttonDisabled]}
                            onPress={takePhoto}
                            disabled={disabled}
                        >
                            <Text style={styles.buttonText}>Take New Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, disabled && styles.buttonDisabled]}
                            onPress={pickImage}
                            disabled={disabled}
                        >
                            <Text style={styles.buttonText}>Choose Another</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.placeholderContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton, disabled && styles.buttonDisabled]}
                        onPress={takePhoto}
                        disabled={disabled}
                    >
                        <Text style={styles.primaryButtonText}>📸 Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton, disabled && styles.buttonDisabled]}
                        onPress={pickImage}
                        disabled={disabled}
                    >
                        <Text style={styles.primaryButtonText}>🖼️ Choose from Gallery</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 16,
    },
    imageContainer: {
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    imageText: {
        fontSize: 18,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        gap: 12,
    },
    placeholderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#4CAF50',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 