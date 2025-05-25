import { Button, useTheme } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useCallback, memo } from 'react';
import ReactNative from 'react-native';
import { useTranslation } from 'react-i18next';
import { ErrorState } from '../../components/ui/error-state';
import { Spacing } from '../../theme/spacing';
import { Image } from 'expo-image';

const { View, StyleSheet, Platform, I18nManager } = ReactNative;

interface PhotoPickerProps {
    onImageSelected: (uri: string) => void;
    initialImage?: string | null;
    disabled?: boolean;
}

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface ImageProps {
    uri: string;
}

interface ButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    icon?: {
        name: string;
        type: string;
        color: string;
        size: number;
    };
    accessibilityLabel: string;
    accessibilityHint: string;
}

// Memoized image component for better performance
const MemoizedImage = memo(({ uri }: { uri: string }) => {
    const { t } = useTranslation();
    return (
        <Image
            source={{ uri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            accessibilityLabel={t('photoPicker.selectedImage')}
            accessibilityRole="image"
        />
    );
});

// Memoized button component for better performance
const MemoizedButton = memo(({ 
    title, 
    onPress, 
    disabled, 
    icon, 
    accessibilityLabel, 
    accessibilityHint 
}: { 
    title: string;
    onPress: () => void;
    disabled?: boolean;
    icon?: {
        name: string;
        type: string;
        color: string;
        size: number;
    };
    accessibilityLabel: string;
    accessibilityHint: string;
}) => (
    <Button
        title={title}
        onPress={onPress}
        disabled={disabled}
        icon={icon}
        containerStyle={styles.button}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
    />
));

export const PhotoPicker = ({
    onImageSelected,
    initialImage,
    disabled = false,
}: PhotoPickerProps): React.ReactElement => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [image, setImage] = useState<string | null>(initialImage || null);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const requestPermissions = useCallback(async () => {
        if (Platform.OS === 'web') return true;

        try {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (cameraStatus === 'denied' || libraryStatus === 'denied') {
                setPermissionError(t('photoPicker.permissionDenied'));
                return false;
            }
            
            if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
                setPermissionError(t('photoPicker.permissionRequired'));
                return false;
            }

            setPermissionError(null);
            return true;
        } catch (error) {
            setPermissionError(t('photoPicker.permissionError'));
            return false;
        }
    }, [t]);

    const handleRetryPermissions = useCallback(async () => {
        setPermissionError(null);
        const hasPermission = await requestPermissions();
        if (hasPermission) {
            if (image) {
                pickImage();
            } else {
                takePhoto();
            }
        }
    }, [image, requestPermissions]);

    const takePhoto = useCallback(async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                onImageSelected(result.assets[0].uri);
            }
        } catch (error) {
            setPermissionError(t('photoPicker.cameraError'));
        }
    }, [requestPermissions, onImageSelected, t]);

    const pickImage = useCallback(async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
                onImageSelected(result.assets[0].uri);
            }
        } catch (error) {
            setPermissionError(t('photoPicker.galleryError'));
        }
    }, [requestPermissions, onImageSelected, t]);

    if (permissionError) {
        return (
            <ErrorState
                message={permissionError}
                onRetry={handleRetryPermissions}
                testID="photo-picker-error"
            />
        );
    }

    return (
        <View 
            style={styles.container}
            accessibilityRole="group"
            accessibilityLabel={t('photoPicker.containerLabel')}
        >
            {image ? (
                <View style={styles.imageContainer}>
                    <MemoizedImage uri={image} />
                    <View style={[
                        styles.buttonContainer,
                        I18nManager.isRTL && styles.buttonContainerRTL
                    ]}>
                        <MemoizedButton
                            title={t('photoPicker.takeNew')}
                            onPress={takePhoto}
                            disabled={disabled}
                            accessibilityLabel={t('photoPicker.takeNew')}
                            accessibilityHint={t('photoPicker.takeNewHint')}
                        />
                        <MemoizedButton
                            title={t('photoPicker.chooseAnother')}
                            onPress={pickImage}
                            disabled={disabled}
                            accessibilityLabel={t('photoPicker.chooseAnother')}
                            accessibilityHint={t('photoPicker.chooseAnotherHint')}
                        />
                    </View>
                </View>
            ) : (
                <View 
                    style={[
                        styles.placeholderContainer,
                        I18nManager.isRTL && styles.placeholderContainerRTL
                    ]}
                    accessibilityRole="group"
                    accessibilityLabel={t('photoPicker.placeholderLabel')}
                >
                    <MemoizedButton
                        title={t('photoPicker.takePhoto')}
                        onPress={takePhoto}
                        disabled={disabled}
                        icon={{
                            name: 'camera',
                            type: 'material-community',
                            color: 'white',
                            size: 20,
                        }}
                        accessibilityLabel={t('photoPicker.takePhoto')}
                        accessibilityHint={t('photoPicker.takePhotoHint')}
                    />
                    <MemoizedButton
                        title={t('photoPicker.chooseGallery')}
                        onPress={pickImage}
                        disabled={disabled}
                        icon={{
                            name: 'image',
                            type: 'material-community',
                            color: 'white',
                            size: 20,
                        }}
                        accessibilityLabel={t('photoPicker.chooseGallery')}
                        accessibilityHint={t('photoPicker.chooseGalleryHint')}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: Spacing.SM,
    },
    imageContainer: {
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        marginBottom: Spacing.SM,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    buttonContainerRTL: {
        flexDirection: 'row-reverse',
    },
    placeholderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    placeholderContainerRTL: {
        flexDirection: 'row-reverse',
    },
    button: {
        flex: 1,
        marginHorizontal: Spacing.XS,
    },
}); 