import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Input, Text, Card, CheckBox, Divider } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { HydroponicTaskCategory } from '@/app/types/reminder';

interface HydroponicReminderFormProps {
  onSubmit: (data: {
    title: string;
    trigger_date: string;
    repeat_interval?: 'daily' | 'weekly' | 'monthly' | null;
    priority?: 'low' | 'medium' | 'high';
    emotion_tone?: 'neutral' | 'positive' | 'urgent' | 'gentle';
    category: HydroponicTaskCategory;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const HydroponicReminderForm: React.FC<HydroponicReminderFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [triggerDate, setTriggerDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [emotionTone, setEmotionTone] = useState<'neutral' | 'positive' | 'urgent' | 'gentle'>('neutral');
  const [category, setCategory] = useState<HydroponicTaskCategory>('daily_check');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Preserve the time from the current triggerDate
      const newDate = new Date(selectedDate);
      newDate.setHours(
        triggerDate.getHours(),
        triggerDate.getMinutes(),
        triggerDate.getSeconds(),
        triggerDate.getMilliseconds()
      );
      setTriggerDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      // Preserve the date from the current triggerDate
      const newDate = new Date(triggerDate);
      newDate.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        selectedTime.getSeconds(),
        selectedTime.getMilliseconds()
      );
      setTriggerDate(newDate);
    }
  };

  const handleSubmit = async () => {
    if (!title) {
      alert('Please enter a title');
      return;
    }

    try {
      await onSubmit({
        title,
        trigger_date: triggerDate.toISOString(),
        repeat_interval: repeatInterval,
        priority,
        emotion_tone: emotionTone,
        category,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create reminder');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Card.Title>Add Hydroponic Reminder</Card.Title>
        <Card.Divider />

        <Input
          placeholder="Reminder Title"
          value={title}
          onChangeText={setTitle}
          autoCapitalize="sentences"
          label="Title"
          labelStyle={styles.label}
          accessibilityLabel="Reminder title"
          accessibilityHint="Enter a title for your reminder"
          required
        />

        <Text style={styles.label}>Date</Text>
        <Button
          title={triggerDate.toLocaleDateString()}
          onPress={() => setShowDatePicker(true)}
          type="outline"
          buttonStyle={styles.dateButton}
          accessibilityLabel="Select date"
          accessibilityHint="Choose a date for the reminder"
        />

        <Text style={styles.label}>Time</Text>
        <Button
          title={triggerDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          onPress={() => setShowTimePicker(true)}
          type="outline"
          buttonStyle={styles.dateButton}
          accessibilityLabel="Select time"
          accessibilityHint="Choose a time for the reminder"
        />

        {showDatePicker && (
          <DateTimePicker
            value={triggerDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={triggerDate}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <Text style={styles.label}>Repeat</Text>
        <View style={styles.checkboxContainer}>
          <CheckBox
            title="Daily"
            checked={repeatInterval === 'daily'}
            onPress={() => setRepeatInterval(repeatInterval === 'daily' ? null : 'daily')}
            containerStyle={styles.checkbox}
          />
          <CheckBox
            title="Weekly"
            checked={repeatInterval === 'weekly'}
            onPress={() => setRepeatInterval(repeatInterval === 'weekly' ? null : 'weekly')}
            containerStyle={styles.checkbox}
          />
          <CheckBox
            title="Monthly"
            checked={repeatInterval === 'monthly'}
            onPress={() => setRepeatInterval(repeatInterval === 'monthly' ? null : 'monthly')}
            containerStyle={styles.checkbox}
          />
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue as HydroponicTaskCategory)}
            style={styles.picker}
            accessibilityLabel="Select category"
          >
            <Picker.Item label="Daily Check" value="daily_check" />
            <Picker.Item label="Nutrient Refill" value="nutrient_refill" />
            <Picker.Item label="Harvest Alert" value="harvest_alert" />
            <Picker.Item label="pH Balance" value="ph_balance" />
            <Picker.Item label="Water Change" value="water_change" />
            <Picker.Item label="System Clean" value="system_clean" />
          </Picker>
        </View>

        <Text style={styles.label}>Priority</Text>
        <View style={styles.checkboxContainer}>
          <CheckBox
            title="Low"
            checked={priority === 'low'}
            onPress={() => setPriority('low')}
            containerStyle={styles.checkbox}
          />
          <CheckBox
            title="Medium"
            checked={priority === 'medium'}
            onPress={() => setPriority('medium')}
            containerStyle={styles.checkbox}
          />
          <CheckBox
            title="High"
            checked={priority === 'high'}
            onPress={() => setPriority('high')}
            containerStyle={styles.checkbox}
          />
        </View>

        <Text style={styles.label}>Notification Tone</Text>
        <View style={styles.checkboxContainer}>
          <CheckBox
            title="Neutral"
            checked={emotionTone === 'neutral'}
            onPress={() => setEmotionTone('neutral')}
            containerStyle={styles.checkbox}
          />
          <CheckBox
            title="Positive"
            checked={emotionTone === 'positive'}
            onPress={() => setEmotionTone('positive')}
            containerStyle={styles.checkbox}
          />
          <CheckBox
            title="Urgent"
            checked={emotionTone === 'urgent'}
            onPress={() => setEmotionTone('urgent')}
            containerStyle={styles.checkbox}
          />
          <CheckBox
            title="Gentle"
            checked={emotionTone === 'gentle'}
            onPress={() => setEmotionTone('gentle')}
            containerStyle={styles.checkbox}
          />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onCancel}
            type="outline"
            containerStyle={styles.buttonWrapper}
            accessibilityLabel="Cancel"
            accessibilityHint="Cancel creating this reminder"
          />
          <Button
            title="Create Reminder"
            onPress={handleSubmit}
            containerStyle={styles.buttonWrapper}
            loading={isLoading}
            disabled={isLoading || !title}
            accessibilityLabel="Create reminder"
            accessibilityHint="Save this reminder"
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  dateButton: {
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 8,
    margin: 0,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  divider: {
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
}); 