import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Text, Button, ButtonGroup, useTheme } from '@rneui/themed';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangeSelectorProps {
  onRangeSelected: (range: DateRange) => void;
  initialRange?: DateRange;
  testID?: string;
}

export function DateRangeSelector({
  onRangeSelected,
  initialRange,
  testID = 'date-range-selector',
}: DateRangeSelectorProps) {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0); // Default to 7 days
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
  });
  const [showModal, setShowModal] = useState(false);
  const [pickingStartDate, setPickingStartDate] = useState(true);
  const [tempDate, setTempDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Initialize with initial range if provided
  useEffect(() => {
    if (initialRange) {
      setCustomRange(initialRange);
      
      // Try to match initial range to a preset
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);
      const thirtyDaysAgo = subDays(now, 30);
      
      const isSevenDays = Math.abs(initialRange.startDate.getTime() - sevenDaysAgo.getTime()) < 86400000; // Within 1 day
      const isThirtyDays = Math.abs(initialRange.startDate.getTime() - thirtyDaysAgo.getTime()) < 86400000; // Within 1 day
      
      if (isSevenDays) {
        setSelectedIndex(0);
      } else if (isThirtyDays) {
        setSelectedIndex(1);
      } else {
        setSelectedIndex(2); // Custom
      }
    }
  }, [initialRange]);

  // Handle preset selection
  const handlePresetSelection = useCallback((index: number) => {
    setSelectedIndex(index);
    
    const now = new Date();
    let range: DateRange;
    
    switch (index) {
      case 0: // Last 7 days
        range = {
          startDate: startOfDay(subDays(now, 7)),
          endDate: endOfDay(now),
        };
        setCustomRange(range);
        onRangeSelected(range);
        break;
      case 1: // Last 30 days
        range = {
          startDate: startOfDay(subDays(now, 30)),
          endDate: endOfDay(now),
        };
        setCustomRange(range);
        onRangeSelected(range);
        break;
      case 2: // Custom range
        setShowModal(true);
        break;
    }
  }, [onRangeSelected]);

  // Handle date changes
  const handleDateChange = useCallback((event, selectedDate?: Date) => {
    const currentDate = selectedDate || tempDate;
    setShowPicker(Platform.OS === 'ios');
    setTempDate(currentDate);
    
    if (Platform.OS === 'android') {
      // On Android, we update immediately and switch to end date if needed
      if (pickingStartDate) {
        setCustomRange(prev => ({
          ...prev,
          startDate: startOfDay(currentDate),
        }));
        // If selecting start date, move to end date selection
        setPickingStartDate(false);
        setShowPicker(true);
      } else {
        setCustomRange(prev => ({
          ...prev,
          endDate: endOfDay(currentDate),
        }));
        // If selecting end date, we're done
        setPickingStartDate(true);
      }
    }
  }, [tempDate, pickingStartDate]);

  // Apply selected custom range
  const applyCustomRange = useCallback(() => {
    // Ensure start date is before end date
    let range = customRange;
    if (customRange.startDate > customRange.endDate) {
      range = {
        startDate: customRange.endDate,
        endDate: customRange.startDate,
      };
      setCustomRange(range);
    }
    
    onRangeSelected(range);
    setShowModal(false);
  }, [customRange, onRangeSelected]);

  // Handle iOS confirm button press
  const handleIOSConfirm = useCallback(() => {
    if (pickingStartDate) {
      setCustomRange(prev => ({
        ...prev,
        startDate: startOfDay(tempDate),
      }));
      setPickingStartDate(false);
    } else {
      setCustomRange(prev => ({
        ...prev,
        endDate: endOfDay(tempDate),
      }));
      setPickingStartDate(true);
      setShowPicker(false);
    }
  }, [pickingStartDate, tempDate]);

  return (
    <View testID={testID} style={styles.container}>
      <ButtonGroup
        buttons={['Last 7 days', 'Last 30 days', 'Custom range']}
        selectedIndex={selectedIndex}
        onPress={handlePresetSelection}
        containerStyle={[
          styles.buttonGroup,
          { backgroundColor: theme.colors.background }
        ]}
        selectedButtonStyle={{ backgroundColor: theme.colors.primary }}
        selectedTextStyle={{ color: theme.colors.white }}
        textStyle={{ fontSize: 12 }}
        accessible={true}
        accessibilityLabel="Date range selector"
        accessibilityHint="Select a date range for the chart"
      />
      
      {/* Custom Range Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
        testID="custom-range-modal"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text h4 style={styles.modalTitle}>Select Date Range</Text>
            
            <View style={styles.rangeDisplay}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TouchableOpacity
                  onPress={() => {
                    setPickingStartDate(true);
                    setTempDate(customRange.startDate);
                    setShowPicker(true);
                  }}
                  style={[styles.dateButton, { borderColor: theme.colors.grey3 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Select start date"
                >
                  <Text style={[styles.dateText, { color: theme.colors.grey0 }]}>
                    {format(customRange.startDate, 'MMM d, yyyy')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.toText}>to</Text>
              
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TouchableOpacity
                  onPress={() => {
                    setPickingStartDate(false);
                    setTempDate(customRange.endDate);
                    setShowPicker(true);
                  }}
                  style={[styles.dateButton, { borderColor: theme.colors.grey3 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Select end date"
                >
                  <Text style={[styles.dateText, { color: theme.colors.grey0 }]}>
                    {format(customRange.endDate, 'MMM d, yyyy')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {(showPicker || Platform.OS === 'ios') && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  testID="date-picker"
                />
                
                {Platform.OS === 'ios' && (
                  <Button
                    title={pickingStartDate ? "Next" : "Apply"}
                    onPress={handleIOSConfirm}
                    containerStyle={styles.confirmButton}
                  />
                )}
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                type="outline"
                onPress={() => setShowModal(false)}
                containerStyle={styles.button}
                accessibilityLabel="Cancel date selection"
              />
              <Button
                title="Apply"
                onPress={applyCustomRange}
                containerStyle={styles.button}
                accessibilityLabel="Apply selected date range"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  buttonGroup: {
    borderRadius: 8,
    minHeight: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  rangeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateBox: {
    flex: 1,
  },
  dateLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
  },
  toText: {
    marginHorizontal: 10,
    marginTop: 20,
    fontSize: 14,
  },
  pickerContainer: {
    marginVertical: 20,
  },
  confirmButton: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
}); 