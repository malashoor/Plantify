import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { withAdminGuard } from '../../components/hoc/withAdminGuard';
import { Text } from '../../components/ui/Text';
import { supabase } from '../../utils/supabase';
import { Promotion, PromotionType } from '../../types/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

type FormData = Omit<Promotion, 'id' | 'created_at' | 'created_by'>;

const PROMOTION_TYPES: PromotionType[] = ['discount', 'free_trial', 'premium_access'];

function PromotionFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const isEditing = route.params?.promotion;
  const initialData = route.params?.promotion || {
    code: '',
    type: 'discount' as PromotionType,
    value: '',
    expires_at: null,
  };

  const [formData, setFormData] = useState<FormData>(initialData);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.value) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      if (isEditing) {
        const { error } = await supabase
          .from('promotions')
          .update({
            code: formData.code,
            type: formData.type,
            value: formData.value,
            expires_at: formData.expires_at,
          })
          .eq('id', route.params.promotion.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('promotions').insert({
          ...formData,
          created_by: user.id,
        });

        if (error) throw error;
      }

      Alert.alert('Success', `Promotion ${isEditing ? 'updated' : 'created'} successfully`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Error saving promotion:', err);
      Alert.alert('Error', 'Failed to save promotion');
    }
  };

  const handleDateChange = (_: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, expires_at: selectedDate.toISOString() }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.form}>
        <Text variant="title" style={styles.title}>
          {isEditing ? 'Edit Promotion' : 'Create Promotion'}
        </Text>

        <View style={styles.field}>
          <Text variant="subtitle">Code</Text>
          <TextInput
            style={styles.input}
            value={formData.code}
            onChangeText={code => setFormData(prev => ({ ...prev, code }))}
            placeholder="Enter promotion code"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.field}>
          <Text variant="subtitle">Type</Text>
          <View style={styles.typeContainer}>
            {PROMOTION_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, formData.type === type && styles.typeButtonActive]}
                onPress={() => setFormData(prev => ({ ...prev, type }))}
              >
                <Text style={[styles.typeText, formData.type === type && styles.typeTextActive]}>
                  {type.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text variant="subtitle">Value</Text>
          <TextInput
            style={styles.input}
            value={formData.value}
            onChangeText={value => setFormData(prev => ({ ...prev, value }))}
            placeholder="e.g., 10%, 30d, unlimited"
          />
        </View>

        <View style={styles.field}>
          <Text variant="subtitle">Expiration (Optional)</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text>
              {formData.expires_at
                ? new Date(formData.expires_at).toLocaleDateString()
                : 'Set expiration date'}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.expires_at ? new Date(formData.expires_at) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Update Promotion' : 'Create Promotion'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  typeButtonActive: {
    backgroundColor: '#2196F3',
  },
  typeText: {
    color: '#666666',
    textTransform: 'capitalize',
  },
  typeTextActive: {
    color: 'white',
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default withAdminGuard(PromotionFormScreen);
