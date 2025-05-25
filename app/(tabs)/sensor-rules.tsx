import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, FAB, useTheme, Divider, Icon } from '@rneui/themed';
import { useSensorRulesService } from '@/hooks/useSensorRulesService';
import { SensorRule } from '@/types/sensorRules';
import NewSensorRuleModal from '@/components/sensors/NewSensorRuleModal';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { PageLayout } from '@/components/layout/PageLayout';

export default function SensorRulesScreen() {
  const { theme } = useTheme();
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
    <Card containerStyle={styles.card}>
      <View style={styles.cardHeader}>
        <Text h4 style={styles.parameter}>{item.parameter}</Text>
        
        <View style={styles.actionButtons}>
          {canEdit && (
            <TouchableOpacity 
              onPress={() => handleEdit(item)}
              style={styles.iconButton}
              accessibilityLabel="Edit rule"
              accessibilityHint="Opens form to edit this sensor rule"
              testID={`edit-rule-${item.id}`}
            >
              <Icon name="edit" size={20} color={theme.colors.primary} />
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
              <Icon name="delete" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.conditionContainer}>
        <Text style={styles.conditionLabel}>When parameter is:</Text>
        <Text style={styles.conditionText}>{formatCondition(item)}</Text>
      </View>
      
      <View style={styles.conditionContainer}>
        <Text style={styles.conditionLabel}>For at least:</Text>
        <Text style={styles.conditionText}>{item.duration_minutes} minutes</Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsLabel}>Actions:</Text>
        <View style={styles.actionsList}>
          {item.actions.notification && (
            <View style={styles.actionItem}>
              <Icon name="notifications" size={16} color={theme.colors.primary} />
              <Text style={styles.actionText}>Push Notification</Text>
            </View>
          )}
          {item.actions.sms && (
            <View style={styles.actionItem}>
              <Icon name="message" size={16} color={theme.colors.primary} />
              <Text style={styles.actionText}>SMS Alert</Text>
            </View>
          )}
          {item.actions.slack && (
            <View style={styles.actionItem}>
              <Icon name="chat" size={16} color={theme.colors.primary} />
              <Text style={styles.actionText}>
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
            <Text>Loading sensor rules...</Text>
          </View>
        ) : rules.length === 0 ? (
          <View style={styles.centered}>
            <Text h4>No sensor rules created yet</Text>
            <Text style={styles.hint}>
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
            icon={{ name: 'add', color: 'white' }}
            color={theme.colors.primary}
            placement="right"
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
  hint: {
    marginTop: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    borderRadius: 8,
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
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
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
  fab: {
    marginBottom: 16,
  },
}); 