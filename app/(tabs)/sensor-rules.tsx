import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Text, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSensorRulesService, SensorRule } from '../../hooks/useSensorRulesService';
import NewSensorRuleModal from '@components/sensors/NewSensorRuleModal';
import { useRolePermissions } from '../../hooks/useRolePermissions';
import { PageLayout } from '@layouts/PageLayout';

// Simple theme object
const createTheme = (colorScheme: 'light' | 'dark' | null) => ({
  colors: {
    primary: '#4CAF50',
    error: '#F44336',
    background: colorScheme === 'dark' ? '#121212' : '#FFFFFF',
    surface: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    text: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textSecondary: colorScheme === 'dark' ? '#BBBBBB' : '#666666',
  }
});

// Custom Card component
const Card = ({ children, containerStyle }: { children: React.ReactNode; containerStyle?: any }) => (
  <View style={[styles.cardBase, containerStyle]}>
    {children}
  </View>
);

// Custom Divider component
const Divider = ({ style }: { style?: any }) => (
  <View style={[styles.dividerBase, style]} />
);

// Custom FAB component
const FAB = ({ onPress, style, testID, accessibilityLabel }: { 
  onPress: () => void; 
  style?: any; 
  testID?: string; 
  accessibilityLabel?: string;
}) => (
  <TouchableOpacity 
    style={[styles.fabBase, style]} 
    onPress={onPress}
    testID={testID}
    accessibilityLabel={accessibilityLabel}
  >
    <Ionicons name="add" size={24} color="white" />
  </TouchableOpacity>
);

export default function SensorRulesScreen() {
  const colorScheme = useColorScheme();
  const theme = createTheme(colorScheme);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editRule, setEditRule] = useState<SensorRule | null>(null);
  const { rules, isLoading, deleteRule } = useSensorRulesService();
  
  // Get permission checks for the current user
  const { canCreate, canEdit, canDelete } = useRolePermissions();

  // Handle rule deletion
  const handleDelete = (rule: SensorRule) => {
    // Don't show delete confirmation if user doesn't have permission
    if (!canDelete) return;
    
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this rule for ${rule.parameter}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRule(rule.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete rule');
            }
          }
        }
      ]
    );
  };

  // Handle editing a rule
  const handleEdit = (rule: SensorRule) => {
    // Don't allow editing if user doesn't have permission
    if (!canEdit) return;
    
    setEditRule(rule);
    setIsModalVisible(true);
  };

  // Format the condition and threshold
  const formatCondition = (rule: SensorRule) => {
    const condition = rule.condition === '<' ? 'below' : 
                       rule.condition === '<=' ? 'below or equal to' :
                       rule.condition === '>' ? 'above' : 'above or equal to';
    
    let unit = '';
    switch (rule.parameter) {
      case 'EC': unit = ' mS/cm'; break;
      case 'temperature': unit = '°C'; break;
      case 'nitrogen':
      case 'phosphorus':
      case 'potassium': unit = ' ppm'; break;
      case 'water_level': unit = '%'; break;
    }
    
    return `${condition} ${rule.threshold}${unit}`;
  };

  // Render a sensor rule item
  const renderItem = ({ item }: { item: SensorRule }) => (
    <Card containerStyle={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.parameter, { color: theme.colors.text }]}>{item.parameter}</Text>
        
        <View style={styles.actionButtons}>
          {canEdit && (
            <TouchableOpacity 
              onPress={() => handleEdit(item)}
              style={styles.iconButton}
              accessibilityLabel="Edit rule"
              accessibilityHint="Opens form to edit this sensor rule"
              testID={`edit-rule-${item.id}`}
            >
              <Ionicons name="pencil" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          
          {canDelete && (
            <TouchableOpacity 
              onPress={() => handleDelete(item)}
              style={styles.iconButton}
              accessibilityLabel="Delete rule"
              accessibilityHint="Deletes this sensor rule"
              testID={`delete-rule-${item.id}`}
            >
              <Ionicons name="trash" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.conditionContainer}>
        <Text style={[styles.conditionLabel, { color: theme.colors.textSecondary }]}>When parameter is:</Text>
        <Text style={[styles.conditionText, { color: theme.colors.text }]}>{formatCondition(item)}</Text>
      </View>
      
      <View style={styles.conditionContainer}>
        <Text style={[styles.conditionLabel, { color: theme.colors.textSecondary }]}>For at least:</Text>
        <Text style={[styles.conditionText, { color: theme.colors.text }]}>{item.duration_minutes} minutes</Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.actionsContainer}>
        <Text style={[styles.actionsLabel, { color: theme.colors.textSecondary }]}>Actions:</Text>
        <View style={styles.actionsList}>
          {item.actions.notification && (
            <View style={styles.actionItem}>
              <Ionicons name="notifications" size={16} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Push Notification</Text>
            </View>
          )}
          {item.actions.sms && (
            <View style={styles.actionItem}>
              <Ionicons name="chatbubble" size={16} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>SMS Alert</Text>
            </View>
          )}
          {item.actions.slack && (
            <View style={styles.actionItem}>
              <Ionicons name="chatbubbles" size={16} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Slack Alert to #{item.actions.slack.channel}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <PageLayout title="Sensor Rules" showBackButton={false}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {isLoading ? (
          <View style={styles.centered}>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading sensor rules...</Text>
          </View>
        ) : rules.length === 0 ? (
          <View style={styles.centered}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No sensor rules created yet</Text>
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              {canCreate 
                ? 'Tap the Add button to create your first rule' 
                : 'Only Growers and Admins can create sensor rules'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={rules}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            testID="sensor-rules-list"
          />
        )}

        {/* Add FAB for creating new rules - only shown if user has permission */}
        {canCreate && (
          <FAB
            onPress={() => {
              setEditRule(null);
              setIsModalVisible(true);
            }}
            style={styles.fab}
            testID="add-sensor-rule-button"
            accessibilityLabel="Add new sensor rule"
          />
        )}

        {/* New/Edit Sensor Rule Modal */}
        <NewSensorRuleModal
          isVisible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setEditRule(null);
          }}
          editRule={editRule}
        />
      </View>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hint: {
    marginTop: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  parameter: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  dividerBase: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  divider: {
    marginVertical: 10,
  },
  conditionContainer: {
    marginVertical: 4,
  },
  conditionLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    marginTop: 4,
  },
  actionsLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionsList: {
    marginTop: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
  },
  fabBase: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fab: {
    marginBottom: 16,
  },
}); 