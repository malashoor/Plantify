import { useRolePermissions } from '@/hooks/useRolePermissions';

export default function NewSensorRuleModal({
  isVisible,
  onClose,
  editRule,
}: NewSensorRuleModalProps) {
  // Get permission checks for the current user
  const { canCreate, canEdit } = useRolePermissions({
    ownerId: editRule?.user_id, // Check if the user owns this rule
  });
  
  // ... existing state and other hooks ...

  // Validation before save
  const validateAndSave = async () => {
    // Don't allow submitting if the user doesn't have permission
    if ((editRule && !canEdit) || (!editRule && !canCreate)) {
      Alert.alert(
        'Permission Denied',
        'You do not have sufficient permissions to perform this action.',
        [{ text: 'OK', onPress: onClose }]
      );
      return;
    }
    
    // ... existing validation code ...
  };
  
  // ... existing render code ...
  
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      testID="new-sensor-rule-modal"
      style={styles.modal}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text h4>{editRule ? 'Edit Sensor Rule' : 'New Sensor Rule'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" />
          </TouchableOpacity>
        </View>
        
        {/* Show permission denied message if user can't edit/create */}
        {((editRule && !canEdit) || (!editRule && !canCreate)) && (
          <View style={[styles.permissionBanner, { backgroundColor: theme.colors.error }]}>
            <Text style={styles.permissionText}>
              You don't have permission to {editRule ? 'edit' : 'create'} sensor rules
            </Text>
          </View>
        )}
        
        {/* Rest of the form elements stay the same, but we add disabled state based on permissions */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Plant</Text>
          <Picker
            selectedValue={selectedPlantId}
            onValueChange={(itemValue) => setSelectedPlantId(itemValue)}
            style={styles.picker}
            enabled={editRule ? canEdit : canCreate}
            testID="plant-picker"
          >
            <Picker.Item label="Select a plant" value="" />
            {plantsData.map((plant) => (
              <Picker.Item key={plant.id} label={plant.name} value={plant.id} />
            ))}
          </Picker>
        </View>
        
        {/* ... existing code for other form elements, adding the enabled/disabled state ... */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Parameter</Text>
          <Picker
            selectedValue={parameter}
            onValueChange={(itemValue) => setParameter(itemValue as SensorParameter)}
            style={styles.picker}
            enabled={editRule ? canEdit : canCreate}
            testID="parameter-picker"
          >
            {/* ... existing options ... */}
          </Picker>
        </View>
        
        {/* ... similar updates for other form fields ... */}
        
        <View style={styles.formActions}>
          <Button
            title="Cancel"
            type="outline"
            onPress={onClose}
            containerStyle={styles.button}
          />
          <Button
            title={editRule ? 'Update Rule' : 'Create Rule'}
            onPress={validateAndSave}
            containerStyle={styles.button}
            disabled={(editRule && !canEdit) || (!editRule && !canCreate)}
            testID="save-rule-button"
          />
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  
  permissionBanner: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 