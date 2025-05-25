import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Info, Leaf } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '@/utils/i18n';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  Platform,
} from 'react-native';

export default function IdentifyScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        alert(t('identify.permission.camera'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>
          {t('identify.title')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.uploadSection}>
          <View
            style={[styles.imagePreview, isDark && styles.imagePreviewDark]}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <>
                <ImageIcon size={80} color={isDark ? '#555555' : '#CCCCCC'} />
                <Text
                  style={[styles.uploadText, isDark && styles.textLightDark]}
                >
                  {t('identify.uploadPrompt')}
                </Text>
              </>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cameraButton]}
              onPress={takePhoto}
            >
              <Camera size={24} color="white" />
              <Text style={styles.buttonText}>{t('identify.takePhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.galleryButton]}
              onPress={pickImage}
            >
              <ImageIcon size={24} color="white" />
              <Text style={styles.buttonText}>{t('identify.uploadPhoto')}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.tipsContainer, isDark && styles.cardDark]}>
            <Text style={[styles.tipsTitle, isDark && styles.textDark]}>
              {t('identify.tips.title')}
            </Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipIconContainer}>
                  <Leaf size={20} color="#2E7D32" />
                </View>
                <Text style={[styles.tipText, isDark && styles.textLightDark]}>
                  {t('identify.tips.closeup')}
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipIconContainer}>
                  <Camera size={20} color="#2E7D32" />
                </View>
                <Text style={[styles.tipText, isDark && styles.textLightDark]}>
                  {t('identify.tips.lighting')}
                </Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipIconContainer}>
                  <Info size={20} color="#2E7D32" />
                </View>
                <Text style={[styles.tipText, isDark && styles.textLightDark]}>
                  {t('identify.tips.focus')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  uploadSection: {
    padding: 20,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  imagePreviewDark: {
    backgroundColor: '#1E1E1E',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    flex: 0.48,
  },
  cameraButton: {
    backgroundColor: '#2E7D32',
  },
  galleryButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  tipsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  textDark: {
    color: '#FFFFFF',
  },
  textLightDark: {
    color: '#AAAAAA',
  },
});
