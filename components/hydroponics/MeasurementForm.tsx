import { Button, Input, useTheme } from '@rneui/themed';
import React, { useState } from 'react';

import { SystemMeasurement } from '@/types/hydroponic';
import { View, StyleSheet } from 'react-native';


export interface MeasurementFormProps {
  systemId: string;
  onSubmit: (data: { systemId: string; measurement: Omit<SystemMeasurement, 'id' | 'measured_at'> }) => Promise<void>;
  isLoading?: boolean;
}

export function MeasurementForm({ systemId, onSubmit, isLoading }: MeasurementFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    ph_level: '',
    ec_level: '',
    water_temperature: '',
    nitrogen_level: '',
    phosphorus_level: '',
    potassium_level: '',
    notes: '',
  });

  const handleSubmit = async () => {
    try {
      await onSubmit({
        systemId,
        measurement: {
          system_id: systemId,
          ph_level: parseFloat(formData.ph_level),
          ec_level: parseFloat(formData.ec_level),
          water_temperature: parseFloat(formData.water_temperature),
          nitrogen_level: parseFloat(formData.nitrogen_level),
          phosphorus_level: parseFloat(formData.phosphorus_level),
          potassium_level: parseFloat(formData.potassium_level),
          notes: formData.notes || undefined,
        },
      });
      setFormData({
        ph_level: '',
        ec_level: '',
        water_temperature: '',
        nitrogen_level: '',
        phosphorus_level: '',
        potassium_level: '',
        notes: '',
      });
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="pH Level"
        value={formData.ph_level}
        onChangeText={(text) => setFormData({ ...formData, ph_level: text })}
        keyboardType="numeric"
        placeholder="Enter pH level"
        accessibilityLabel="pH level input"
        accessibilityHint="Enter the pH level of the nutrient solution"
      />
      <Input
        label="EC Level (mS/cm)"
        value={formData.ec_level}
        onChangeText={(text) => setFormData({ ...formData, ec_level: text })}
        keyboardType="numeric"
        placeholder="Enter EC level"
        accessibilityLabel="EC level input"
        accessibilityHint="Enter the electrical conductivity level in mS/cm"
      />
      <Input
        label="Water Temperature (°C)"
        value={formData.water_temperature}
        onChangeText={(text) => setFormData({ ...formData, water_temperature: text })}
        keyboardType="numeric"
        placeholder="Enter water temperature"
        accessibilityLabel="Water temperature input"
        accessibilityHint="Enter the water temperature in Celsius"
      />
      <Input
        label="Nitrogen Level (ppm)"
        value={formData.nitrogen_level}
        onChangeText={(text) => setFormData({ ...formData, nitrogen_level: text })}
        keyboardType="numeric"
        placeholder="Enter nitrogen level"
        accessibilityLabel="Nitrogen level input"
        accessibilityHint="Enter the nitrogen level in parts per million"
      />
      <Input
        label="Phosphorus Level (ppm)"
        value={formData.phosphorus_level}
        onChangeText={(text) => setFormData({ ...formData, phosphorus_level: text })}
        keyboardType="numeric"
        placeholder="Enter phosphorus level"
        accessibilityLabel="Phosphorus level input"
        accessibilityHint="Enter the phosphorus level in parts per million"
      />
      <Input
        label="Potassium Level (ppm)"
        value={formData.potassium_level}
        onChangeText={(text) => setFormData({ ...formData, potassium_level: text })}
        keyboardType="numeric"
        placeholder="Enter potassium level"
        accessibilityLabel="Potassium level input"
        accessibilityHint="Enter the potassium level in parts per million"
      />
      <Input
        label="Notes"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        placeholder="Enter any additional notes"
        multiline
        accessibilityLabel="Notes input"
        accessibilityHint="Enter any additional notes about the measurement"
      />
      <Button
        title="Add Measurement"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        accessibilityLabel="Add measurement"
        accessibilityHint="Save the current measurement values"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
