import { Text, Input, Button, useTheme } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { View, StyleSheet, ScrollView, Image } from 'react-native';

import { useSeeds } from '../hooks/useSeeds';
import { supabase } from '../lib/supabase';
import { SeedFormData } from '../types/seed';

export default function NewSeedScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { loading, error, createSeed } = useSeeds();
    const [formData, setFormData] = useState<SeedFormData>({
        name: '',
        species: '',
        variety: '',
        plantedDate: new Date(),
        imageUrl: undefined,
        notes: '',
    });
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            await uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            setUploading(true);

            const response = await fetch(uri);
            const blob = await response.blob();
            const filename = uri.split('/').pop() || 'image.jpg';
            const filePath = `seeds/${Date.now()}_${filename}`;

            const { error: uploadError, data } = await supabase.storage
                .from('images')
                .upload(filePath, blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
        } catch (err) {
            console.error('Error uploading image:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.species) {
            return;
        }

        const seed = await createSeed(formData);
        if (seed) {
            router.push('/seeds');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text h4 style={styles.title}>Add New Seed</Text>

                {error && (
                    <Text style={[styles.error, { color: theme.colors.error }]}>
                        {error}
                    </Text>
                )}

                <Input
                    label="Seed Name"
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    placeholder="e.g., My First Tomato"
                    autoCapitalize="words"
                />

                <Input
                    label="Species"
                    value={formData.species}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, species: text }))}
                    placeholder="e.g., Solanum lycopersicum"
                    autoCapitalize="words"
                />

                <Input
                    label="Variety (Optional)"
                    value={formData.variety}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, variety: text }))}
                    placeholder="e.g., Beefsteak"
                    autoCapitalize="words"
                />

                <Input
                    label="Notes (Optional)"
                    value={formData.notes}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                    placeholder="Add any additional notes..."
                    multiline
                    numberOfLines={3}
                />

                <View style={styles.imageSection}>
                    <Text style={styles.imageLabel}>Seed Image</Text>
                    <Button
                        title={image ? "Change Image" : "Select Image"}
                        onPress={pickImage}
                        loading={uploading}
                        containerStyle={styles.imageButton}
                    />
                    {image && (
                        <Image
                            source={{ uri: image }}
                            style={styles.preview}
                        />
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Cancel"
                        onPress={() => router.back()}
                        type="outline"
                        containerStyle={styles.button}
                    />
                    <Button
                        title="Add Seed"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading || uploading || !formData.name || !formData.species}
                        containerStyle={styles.button}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
    },
    title: {
        marginBottom: 24,
        textAlign: 'center',
    },
    error: {
        textAlign: 'center',
        marginBottom: 16,
    },
    imageSection: {
        marginBottom: 24,
    },
    imageLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    imageButton: {
        marginBottom: 16,
    },
    preview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    button: {
        flex: 1,
        marginHorizontal: 8,
    },
}); 