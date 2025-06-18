import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get('window');

// Mock data for now - will be replaced with real hooks later
const mockTheme = {
  primary: '#4CAF50',
  surface: '#F5F5F5',
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3'
};

const mockPlantProfiles = [
  { id: 'lettuce', name: 'Lettuce' },
  { id: 'tomato', name: 'Tomato' },
  { id: 'basil', name: 'Basil' }
];

export default function CropAdvisorScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [selectedPlantId, setSelectedPlantId] = useState<string>('lettuce');
  const [question, setQuestion] = useState('');
  const [selectedTab, setSelectedTab] = useState<'health' | 'recommendations' | 'conversation'>('health');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mock functions - will be replaced with real hooks
  const selectPlant = (plantId: string) => setSelectedPlantId(plantId);
  const handleAskQuestion = () => {
    console.log('Asking question:', question);
    setQuestion('');
  };

  // Render plant selector
  const renderPlantSelector = () => (
    <View style={styles.selectorContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {mockPlantProfiles.map((plant) => (
          <TouchableOpacity
            key={plant.id}
            style={[
              styles.plantButton,
              { 
                backgroundColor: selectedPlantId === plant.id 
                  ? mockTheme.primary 
                  : mockTheme.surface,
                opacity: selectedPlantId === plant.id ? 1 : 0.7
              }
            ]}
            onPress={() => selectPlant(plant.id)}
            accessibilityRole="button"
            accessibilityLabel={`Select plant ${plant.name}`}
          >
            <View style={styles.plantButtonContent}>
              <Ionicons 
                name="leaf-outline" 
                size={16} 
                color={selectedPlantId === plant.id ? 'white' : mockTheme.text} 
              />
              <Text 
                style={[
                  styles.plantButtonText,
                  { color: selectedPlantId === plant.id ? 'white' : mockTheme.text }
                ]}
              >
                {plant.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.addPlantButton}
          onPress={() => router.push('/add-plant')}
          accessibilityRole="button"
          accessibilityLabel="Add new plant"
        >
          <View style={styles.plantButtonContent}>
            <Ionicons name="add" size={16} color={mockTheme.textSecondary} />
            <Text style={[styles.plantButtonText, { color: mockTheme.textSecondary }]}>
              Add Plant
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Render main content based on selected tab
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'health':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.placeholderContainer}>
              <MaterialIcons name="eco" size={64} color={mockTheme.textSecondary} />
              <Text style={[styles.placeholderTitle, { color: mockTheme.text }]}>
                Plant Health Analysis
              </Text>
              <Text style={[styles.placeholderText, { color: mockTheme.textSecondary }]}>
                AI-powered health monitoring coming soon
              </Text>
            </View>
          </View>
        );
      
      case 'recommendations':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.placeholderContainer}>
              <MaterialIcons name="lightbulb-outline" size={64} color={mockTheme.textSecondary} />
              <Text style={[styles.placeholderTitle, { color: mockTheme.text }]}>
                Smart Recommendations
              </Text>
              <Text style={[styles.placeholderText, { color: mockTheme.textSecondary }]}>
                Personalized care recommendations based on your plant's needs
              </Text>
            </View>
          </View>
        );
      
      case 'conversation':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.conversationContainer}>
              <Text style={[styles.sectionTitle, { color: mockTheme.text }]}>
                Ask About Your Plants
              </Text>
              
              <View style={styles.questionInputContainer}>
                <TextInput
                  style={[styles.questionInput, { 
                    backgroundColor: mockTheme.surface,
                    color: mockTheme.text,
                    borderColor: mockTheme.border
                  }]}
                  value={question}
                  onChangeText={setQuestion}
                  placeholder="What's wrong with my plant?"
                  placeholderTextColor={mockTheme.textSecondary}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.askButton, { backgroundColor: mockTheme.primary }]}
                  onPress={handleAskQuestion}
                  disabled={!question.trim()}
                >
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.placeholderContainer}>
                <MaterialIcons name="chat" size={64} color={mockTheme.textSecondary} />
                <Text style={[styles.placeholderText, { color: mockTheme.textSecondary }]}>
                  AI conversation feature in development
                </Text>
              </View>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: mockTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: mockTheme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={mockTheme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: mockTheme.text }]}>
          Crop Advisor
        </Text>
        
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={24} color={mockTheme.text} />
        </TouchableOpacity>
      </View>

      {/* Plant Selector */}
      {renderPlantSelector()}

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: mockTheme.surface }]}>
        {(['health', 'recommendations', 'conversation'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && { backgroundColor: mockTheme.primary }
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[
              styles.tabText,
              { color: selectedTab === tab ? 'white' : mockTheme.text }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectorContainer: {
    marginBottom: 16,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  plantButton: {
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 16,
  },
  plantButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  addPlantButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    marginRight: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  conversationContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  questionInputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  questionInput: {
    flex: 1,
    minHeight: 80,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    textAlignVertical: 'top',
    marginRight: 12,
  },
  askButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
}); 