import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Button, 
  Overlay, 
  Input, 
  ButtonGroup, 
  Switch,
  useTheme 
} from '@rneui/themed';
import { SensorRule, SensorParameter, SensorCondition } from '@/types/sensorRules';
import { useSensorRulesService } from '@/hooks/useSensorRulesService';

interface NewSensorRuleModalProps {
  isVisible: boolean;
  onClose: () => void;
  editRule?: SensorRule | null;
}

const PARAMETER_OPTIONS: SensorParameter[] = ['pH', 'EC', 'temperature', 'nitrogen', 'phosphorus', 'potassium', 'water_level'];
const CONDITION_OPTIONS: SensorCondition[] = ['<', '<=', '>', '>='];

export default function NewSensorRuleModal({ 
  isVisible, 
  onClose, 
  editRule 
}: NewSensorRuleModalProps) {
  const { theme } = useTheme();
  const { createRule, updateRule } = useSensorRulesService();
  
  const [parameter, setParameter] = useState<SensorParameter>('pH');
  const [condition, setCondition] = useState<SensorCondition>('<');
  const [threshold, setThreshold] = useState('');
  const [duration, setDuration] = useState('');
  const [notification, setNotification] = useState(true);
  const [sms, setSms] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackChannel, setSlackChannel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes or when editing
  useEffect(() => {
    if (editRule) {
      setParameter(editRule.parameter);
      setCondition(editRule.condition);
      setThreshold(editRule.threshold.toString());
      setDuration(editRule.duration_minutes.toString());
      setNotification(editRule.actions.notification);
      setSms(editRule.actions.sms);
      setSlackEnabled(!!editRule.actions.slack);
      setSlackChannel(editRule.actions.slack?.channel || '');
    } else {
      // Reset to defaults for new rule
      setParameter('pH');
      setCondition('<');
      setThreshold('');
      setDuration('');
      setNotification(true);
      setSms(false);
      setSlackEnabled(false);
      setSlackChannel('');
    }
  }, [editRule, isVisible]);

  const handleSave = async () => {
    // Validation
    if (!threshold || !duration) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    const thresholdNum = parseFloat(threshold);
    const durationNum = parseInt(duration);

    if (isNaN(thresholdNum) || isNaN(durationNum)) {
      Alert.alert('Validation Error', 'Please enter valid numbers for threshold and duration');
      return;
    }

    if (slackEnabled && !slackChannel.trim()) {
      Alert.alert('Validation Error', 'Please enter a Slack channel name');
      return;
    }

    setIsLoading(true);

    try {
      const ruleData = {
        parameter,
        condition,
        threshold: thresholdNum,
        duration_minutes: durationNum,
        actions: {
          notification,
          sms,
          slack: slackEnabled ? { channel: slackChannel.trim() } : null,
        },
      };

      if (editRule) {
        await updateRule(editRule.id, ruleData);
      } else {
        await createRule(ruleData);
      }

      onClose();
    } catch (error) {
      Alert.alert('Error', `Failed to ${editRule ? 'update' : 'create'} sensor rule`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Overlay 
      isVisible={isVisible} 
      onBackdropPress={onClose}
      overlayStyle={styles.overlay}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text h4 style={styles.title}>
          {editRule ? 'Edit Sensor Rule' : 'New Sensor Rule'}
        </Text>

        {/* Parameter Selection */}
        <Text style={styles.label}>Parameter</Text>
        <ButtonGroup
          buttons={PARAMETER_OPTIONS}
          selectedIndex={PARAMETER_OPTIONS.indexOf(parameter)}
          onPress={(index) => setParameter(PARAMETER_OPTIONS[index])}
          containerStyle={styles.buttonGroup}
        />

        {/* Condition Selection */}
        <Text style={styles.label}>Condition</Text>
        <ButtonGroup
          buttons={CONDITION_OPTIONS}
          selectedIndex={CONDITION_OPTIONS.indexOf(condition)}
          onPress={(index) => setCondition(CONDITION_OPTIONS[index])}
          containerStyle={styles.buttonGroup}
        />

        {/* Threshold Input */}
        <Input
          label="Threshold Value"
          value={threshold}
          onChangeText={setThreshold}
          keyboardType="numeric"
          placeholder="Enter threshold value"
          containerStyle={styles.input}
        />

        {/* Duration Input */}
        <Input
          label="Duration (minutes)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          placeholder="Enter duration in minutes"
          containerStyle={styles.input}
        />

        {/* Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <View style={styles.switchContainer}>
          <Text>Push Notification</Text>
          <Switch
            value={notification}
            onValueChange={setNotification}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text>SMS Alert</Text>
          <Switch
            value={sms}
            onValueChange={setSms}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text>Slack Alert</Text>
          <Switch
            value={slackEnabled}
            onValueChange={setSlackEnabled}
          />
        </View>

        {slackEnabled && (
          <Input
            label="Slack Channel"
            value={slackChannel}
            onChangeText={setSlackChannel}
            placeholder="Enter channel name (e.g., alerts)"
            containerStyle={styles.input}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={onClose}
            type="outline"
            containerStyle={styles.button}
          />
          <Button
            title={editRule ? 'Update' : 'Create'}
            onPress={handleSave}
            loading={isLoading}
            containerStyle={styles.button}
          />
        </View>
      </ScrollView>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  overlay: {
    width: '90%',
    maxHeight: '80%',
  },
  container: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  buttonGroup: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    width: '40%',
  },
}); 