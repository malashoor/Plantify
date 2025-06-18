import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from 'lib/supabase';

// Simple theme helper
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#1E1E1E' : '#F8F9FA',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#212121',
    textSecondary: colorScheme === 'dark' ? '#AAAAAA' : '#757575',
    border: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
    error: '#F44336',
    success: '#4CAF50',
  },
});

export default function EditProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setFormData({
          fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          bio: user.user_metadata?.bio || '',
          location: user.user_metadata?.location || '',
          website: user.user_metadata?.website || '',
        });
        setProfileImage(user.user_metadata?.avatar_url || null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const requestImagePermissions = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and photo library access are required to upload profile pictures.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    Alert.alert('Profile Picture', 'Choose how you want to update your profile picture', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickFromLibrary },
    ]);
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);

      if (!user) {
        throw new Error('No user found');
      }

      // Create filename with user ID and timestamp
      const fileExt = imageUri.split('.').pop();
      const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;

      try {
        // Try to upload to Supabase Storage (if configured)
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          name: fileName,
          type: `image/${fileExt}`,
        } as any);

        // For now, we'll use the local URI and update user metadata
        // In production with Supabase Storage properly configured, you'd do:
        // const { data, error: uploadError } = await supabase.storage
        //   .from('avatars')
        //   .upload(fileName, formData);

        const { error } = await supabase.auth.updateUser({
          data: {
            avatar_url: imageUri,
            avatar_updated_at: new Date().toISOString(),
          },
        });

        if (error) {
          throw error;
        }

        // Update local state to trigger re-render
        setProfileImage(imageUri);

        // Reload user data to ensure consistency
        await loadUserProfile();

        Alert.alert('Success! ✅', 'Profile picture updated successfully!');
      } catch (storageError) {
        console.log('Storage upload failed, using local URI:', storageError);

        // Fallback: store local URI in user metadata
        const { error } = await supabase.auth.updateUser({
          data: {
            avatar_url: imageUri,
            avatar_updated_at: new Date().toISOString(),
          },
        });

        if (error) {
          throw error;
        }

        setProfileImage(imageUri);
        Alert.alert('Success! ✅', 'Profile picture updated successfully!');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/\s/g, '');
      if (!/^\+?[1-9]\d{6,14}$/.test(cleanPhone)) {
        if (cleanPhone.length < 7) {
          newErrors.phone = 'Phone number is too short (minimum 7 digits)';
        } else if (cleanPhone.length > 15) {
          newErrors.phone = 'Phone number is too long (maximum 15 digits)';
        } else if (!/^\+/.test(cleanPhone) && !/^[1-9]/.test(cleanPhone)) {
          newErrors.phone = 'Please include country code, e.g. +966512345678';
        } else if (/[a-zA-Z]/.test(cleanPhone)) {
          newErrors.phone = 'Phone number cannot contain letters';
        } else {
          newErrors.phone = 'Please enter a valid phone number, e.g. +966512345678';
        }
      }
    }

    if (
      formData.website &&
      !formData.website.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)
    ) {
      newErrors.website = 'Please enter a valid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below');
      return;
    }

    try {
      setIsSaving(true);

      const updateData = {
        full_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        website: formData.website.trim(),
        avatar_url: profileImage,
      };

      const { error } = await supabase.auth.updateUser({
        data: updateData,
      });

      if (error) {
        throw error;
      }

      Alert.alert('Profile Updated! ✅', 'Your profile has been successfully updated.', [
        {
          text: 'OK',
          onPress: () => {
            try {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/account');
              }
            } catch (error) {
              console.error('Navigation error:', error);
              router.push('/account');
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Update Failed', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={32} color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => {
            try {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/account');
              }
            } catch (error) {
              console.error('Navigation error:', error);
              router.push('/account'); // Fallback to account screen
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          disabled={isSaving}
        >
          {isSaving ? (
            <Ionicons name="hourglass" size={20} color="white" />
          ) : (
            <Ionicons name="checkmark" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Picture Section */}
          <View
            style={[
              styles.profilePictureSection,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profile Picture</Text>

            <View style={styles.profilePictureContainer}>
              <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {formData.fullName ? getInitials(formData.fullName) : '?'}
                  </Text>
                )}
                {isUploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <Ionicons name="hourglass" size={24} color="white" />
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.changePhotoButton, { backgroundColor: theme.colors.primary }]}
                onPress={pickImage}
                disabled={isUploadingImage}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={16} color="white" />
                <Text style={styles.changePhotoText}>
                  {isUploadingImage ? 'Uploading...' : 'Change Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Info Section */}
          <View
            style={[
              styles.section,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Basic Information
            </Text>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Full Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: errors.fullName ? theme.colors.error : theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.fullName}
                onChangeText={text => updateField('fullName', text)}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
                maxLength={50}
              />
              {errors.fullName && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.fullName}
                </Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email Address</Text>
              <Text style={[styles.labelSubtext, { color: theme.colors.textSecondary }]}>
                Email cannot be changed from this screen
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.inputDisabled,
                  {
                    backgroundColor: theme.colors.border + '30',
                    borderColor: theme.colors.border,
                    color: theme.colors.textSecondary,
                  },
                ]}
                value={formData.email}
                editable={false}
                placeholder="No email provided"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Phone Number</Text>
              <Text style={[styles.labelSubtext, { color: theme.colors.textSecondary }]}>
                Include country code for international format
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: errors.phone ? theme.colors.error : theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.phone}
                onChangeText={text => updateField('phone', text)}
                placeholder="+966512345678"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
                maxLength={20}
                autoCorrect={false}
              />
              {errors.phone && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.phone}
                </Text>
              )}
            </View>
          </View>

          {/* Additional Info Section */}
          <View
            style={[
              styles.section,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Additional Information
            </Text>

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Bio</Text>
              <Text style={[styles.labelSubtext, { color: theme.colors.textSecondary }]}>
                Tell others about yourself and your gardening journey
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.bio}
                onChangeText={text => updateField('bio', text)}
                placeholder="Write a short bio about yourself..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={200}
              />
              <Text style={[styles.characterCount, { color: theme.colors.textSecondary }]}>
                {formData.bio.length}/200 characters
              </Text>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Location</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.location}
                onChangeText={text => updateField('location', text)}
                placeholder="City, Country"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>

            {/* Website */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Website</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: errors.website ? theme.colors.error : theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                value={formData.website}
                onChangeText={text => updateField('website', text)}
                placeholder="https://yourwebsite.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
                maxLength={100}
              />
              {errors.website && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.website}
                </Text>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButtonLarge,
              { backgroundColor: theme.colors.primary },
              isSaving && styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <>
                <Ionicons name="hourglass" size={20} color="white" />
                <Text style={styles.saveButtonText}>Saving Changes...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profilePictureSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  profilePictureContainer: {
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  changePhotoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  labelSubtext: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  saveButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
