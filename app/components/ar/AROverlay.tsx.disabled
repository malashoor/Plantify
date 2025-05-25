import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@rneui/themed';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroConstants,
  ViroARTrackingTargets,
  ViroMaterials,
  ViroImage,
  ViroNode,
  ViroAnimations,
} from '@viro-community/react-viro';
import { useSensorData } from '@/hooks/useSensorData';
import { LinearGradient } from 'expo-linear-gradient';
import { ChartDataset } from '@/types';
import { InteractiveTrendChart } from '@/components/charts/InteractiveTrendChart';
import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

// ARScene component to render the actual AR overlay
const ARScene = (props: { onAnchorFound: () => void; onTapAR: (sensor: string, position: any) => void }) => {
  const { onAnchorFound, onTapAR } = props;
  const { sensorData, isLoading: isLoadingSensors } = useSensorData();
  const { theme } = useTheme();
  const arSceneRef = useRef(null);
  const [trackingStatus, setTrackingStatus] = useState('');
  
  // Register anchor targets for hydroponic system components
  useEffect(() => {
    ViroARTrackingTargets.createTargets({
      reservoir: {
        source: require('@/assets/ar-targets/reservoir-target.png'),
        orientation: 'Up',
        physicalWidth: 0.2, // 20cm target size
      },
      nutrientTank: {
        source: require('@/assets/ar-targets/nutrient-tank-target.png'),
        orientation: 'Up',
        physicalWidth: 0.15, // 15cm target size
      }
    });
    
    // Setup materials for AR elements
    ViroMaterials.createMaterials({
      labelBg: {
        diffuseColor: theme.mode === 'dark' 
          ? 'rgba(40, 40, 40, 0.7)' 
          : 'rgba(240, 240, 240, 0.7)',
        lightingModel: 'Blinn',
      },
      criticalValue: {
        diffuseColor: theme.colors.error,
        lightingModel: 'Blinn',
      },
      warningValue: {
        diffuseColor: theme.colors.warning,
        lightingModel: 'Blinn',
      },
      normalValue: {
        diffuseColor: theme.colors.success,
        lightingModel: 'Blinn',
      },
    });
    
    // Setup animations
    ViroAnimations.registerAnimations({
      scaleUp: {
        properties: { scaleX: 1.2, scaleY: 1.2, scaleZ: 1.2 },
        duration: 300,
      },
      scaleDown: {
        properties: { scaleX: 1, scaleY: 1, scaleZ: 1 },
        duration: 300,
      },
      fadeIn: {
        properties: { opacity: 1 },
        duration: 500,
      },
      fadeOut: {
        properties: { opacity: 0 },
        duration: 500,
      },
      rotate: {
        properties: { rotateZ: '+=45' },
        duration: 1000,
      },
    });
  }, [theme.mode, theme.colors]);
  
  // Get sensor value color based on thresholds
  const getSensorValueColor = (sensor: string, value: number): string => {
    if (sensor === 'ph') {
      if (value < 5.5 || value > 7.0) return 'criticalValue';
      if (value < 6.0 || value > 6.5) return 'warningValue';
      return 'normalValue';
    } else if (sensor === 'ec') {
      if (value < 0.8 || value > 2.0) return 'criticalValue'; 
      if (value < 1.0 || value > 1.8) return 'warningValue';
      return 'normalValue';
    } else if (sensor === 'temperature') {
      if (value < 18 || value > 26) return 'criticalValue';
      if (value < 20 || value > 24) return 'warningValue';
      return 'normalValue';
    } else {
      return 'normalValue';
    }
  };
  
  // Extract latest sensor values or use placeholders
  const phValue = sensorData?.ph_level ?? 6.2;
  const ecValue = sensorData?.ec_level ?? 1.4;
  const tempValue = sensorData?.water_temperature ?? 22.5;
  const nitrogenValue = sensorData?.nitrogen_level ?? 150;
  const phosphorusValue = sensorData?.phosphorus_level ?? 45;
  const potassiumValue = sensorData?.potassium_level ?? 180;
  
  // Get sensor unit text
  const getSensorUnit = (sensor: string): string => {
    if (sensor === 'ph') return '';
    if (sensor === 'ec') return ' mS/cm';
    if (sensor === 'temperature') return '°C';
    return ' ppm';
  };
  
  return (
    <ViroARScene
      onTrackingUpdated={(state, reason) => {
        if (state === ViroConstants.TRACKING_NORMAL) {
          setTrackingStatus('normal');
          onAnchorFound();
        } else if (state === ViroConstants.TRACKING_NONE) {
          setTrackingStatus('none');
        }
      }}
    >
      {/* Reservoir pH and EC labels */}
      <ViroNode
        position={[0, 0.1, -0.5]} // Positioned in front of camera
        transformBehaviors={['billboardY']} // Always face the user
      >
        <ViroText
          text={`pH: ${phValue.toFixed(1)}${getSensorUnit('ph')}`}
          position={[0, 0.1, 0]}
          scale={[0.1, 0.1, 0.1]}
          style={{
            fontFamily: 'Arial',
            fontSize: 20,
            color: 'white',
            textAlignVertical: 'center',
            textAlign: 'center',
          }}
          materials={[getSensorValueColor('ph', phValue)]}
          onClick={() => onTapAR('ph', [0, 0.1, -0.5])}
          animation={{ name: 'fadeIn', run: true, loop: false }}
          width={1}
          height={0.5}
          extrusionDepth={0.1}
          outerStroke={{ type: 'Outline', width: 2, color: '#FFFFFF' }}
          testID="arLabel-pH"
          accessible={true}
          accessibilityLabel={`pH value ${phValue.toFixed(1)}. Tap for details`}
        />
        
        <ViroText
          text={`EC: ${ecValue.toFixed(1)}${getSensorUnit('ec')}`}
          position={[0, 0, 0]}
          scale={[0.1, 0.1, 0.1]}
          style={{
            fontFamily: 'Arial',
            fontSize: 20,
            color: 'white',
            textAlignVertical: 'center',
            textAlign: 'center',
          }}
          materials={[getSensorValueColor('ec', ecValue)]}
          onClick={() => onTapAR('ec', [0, 0, -0.5])}
          animation={{ name: 'fadeIn', run: true, loop: false }}
          width={1}
          height={0.5}
          extrusionDepth={0.1}
          outerStroke={{ type: 'Outline', width: 2, color: '#FFFFFF' }}
          testID="arLabel-EC"
          accessible={true}
          accessibilityLabel={`EC value ${ecValue.toFixed(1)} millisiemens per centimeter. Tap for details`}
        />
      </ViroNode>
      
      {/* Temperature label */}
      <ViroNode
        position={[0.2, 0.05, -0.5]} // Positioned to the right
        transformBehaviors={['billboardY']} // Always face the user
      >
        <ViroText
          text={`Temp: ${tempValue.toFixed(1)}${getSensorUnit('temperature')}`}
          position={[0, 0, 0]}
          scale={[0.1, 0.1, 0.1]}
          style={{
            fontFamily: 'Arial',
            fontSize: 20,
            color: 'white',
            textAlignVertical: 'center',
            textAlign: 'center',
          }}
          materials={[getSensorValueColor('temperature', tempValue)]}
          onClick={() => onTapAR('temperature', [0.2, 0.05, -0.5])}
          animation={{ name: 'fadeIn', run: true, loop: false }}
          width={1.5}
          height={0.5}
          extrusionDepth={0.1}
          outerStroke={{ type: 'Outline', width: 2, color: '#FFFFFF' }}
          testID="arLabel-temperature"
          accessible={true}
          accessibilityLabel={`Temperature ${tempValue.toFixed(1)} degrees Celsius. Tap for details`}
        />
      </ViroNode>
      
      {/* Nutrients (NPK) labels */}
      <ViroNode
        position={[-0.25, 0, -0.5]} // Positioned to the left
        transformBehaviors={['billboardY']} // Always face the user
      >
        <ViroText
          text={`N: ${nitrogenValue}${getSensorUnit('nitrogen')}`}
          position={[0, 0.05, 0]}
          scale={[0.08, 0.08, 0.08]}
          style={{
            fontFamily: 'Arial',
            fontSize: 18,
            color: 'white',
            textAlignVertical: 'center',
            textAlign: 'center',
          }}
          materials={['normalValue']}
          onClick={() => onTapAR('nitrogen', [-0.25, 0.05, -0.5])}
          animation={{ name: 'fadeIn', run: true, loop: false }}
          width={1}
          height={0.5}
          extrusionDepth={0.1}
          outerStroke={{ type: 'Outline', width: 2, color: '#FFFFFF' }}
          testID="arLabel-nitrogen"
          accessible={true}
          accessibilityLabel={`Nitrogen ${nitrogenValue} parts per million. Tap for details`}
        />
        
        <ViroText
          text={`P: ${phosphorusValue}${getSensorUnit('phosphorus')}`}
          position={[0, 0, 0]}
          scale={[0.08, 0.08, 0.08]}
          style={{
            fontFamily: 'Arial',
            fontSize: 18,
            color: 'white',
            textAlignVertical: 'center',
            textAlign: 'center',
          }}
          materials={['normalValue']}
          onClick={() => onTapAR('phosphorus', [-0.25, 0, -0.5])}
          animation={{ name: 'fadeIn', run: true, loop: false }}
          width={1}
          height={0.5}
          extrusionDepth={0.1}
          outerStroke={{ type: 'Outline', width: 2, color: '#FFFFFF' }}
          testID="arLabel-phosphorus"
          accessible={true}
          accessibilityLabel={`Phosphorus ${phosphorusValue} parts per million. Tap for details`}
        />
        
        <ViroText
          text={`K: ${potassiumValue}${getSensorUnit('potassium')}`}
          position={[0, -0.05, 0]}
          scale={[0.08, 0.08, 0.08]}
          style={{
            fontFamily: 'Arial',
            fontSize: 18,
            color: 'white',
            textAlignVertical: 'center',
            textAlign: 'center',
          }}
          materials={['normalValue']}
          onClick={() => onTapAR('potassium', [-0.25, -0.05, -0.5])}
          animation={{ name: 'fadeIn', run: true, loop: false }}
          width={1}
          height={0.5}
          extrusionDepth={0.1}
          outerStroke={{ type: 'Outline', width: 2, color: '#FFFFFF' }}
          testID="arLabel-potassium"
          accessible={true}
          accessibilityLabel={`Potassium ${potassiumValue} parts per million. Tap for details`}
        />
      </ViroNode>
      
      {/* Guide rectangle where hydroponic system should be detected */}
      <ViroNode
        position={[0, -0.1, -0.5]} // Positioned below main labels
      >
        <ViroImage
          source={require('@/assets/ar-guides/hydroponic-guide.png')}
          position={[0, 0, 0]}
          scale={[0.5, 0.3, 0.5]}
          opacity={0.6}
          transformBehaviors={['billboardY']}
          animation={{ name: trackingStatus === 'normal' ? 'fadeOut' : 'fadeIn', run: true, loop: false }}
        />
      </ViroNode>
    </ViroARScene>
  );
};

// Main AROverlay component
export const AROverlay = () => {
  const { theme } = useTheme();
  const [showAR, setShowAR] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [anchorFound, setAnchorFound] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState('');
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const { sensorMeasurements, isLoading } = useSensorData();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  
  // Check if device supports AR
  useEffect(() => {
    const checkARSupport = async () => {
      try {
        // In a real app, we'd check for AR support using ViroUtils or platform-specific checks
        // For demo, we'll just assume support on iOS 11+ and Android 8+
        if (Platform.OS === 'ios') {
          const majorVersionIOS = parseInt(String(Platform.Version), 10);
          if (majorVersionIOS < 11) {
            setShowAR(false);
            setShowFallback(true);
          }
        } else if (Platform.OS === 'android') {
          // For Android, assume AR support on newer devices
          // In a real app, check for ARCore support
          setShowAR(true);
        }
      } catch (err) {
        console.error('Error checking AR support:', err);
        setShowAR(false);
        setShowFallback(true);
      }
    };
    
    checkARSupport();
  }, []);
  
  // Handle anchor found in AR scene
  const handleAnchorFound = () => {
    setAnchorFound(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  // Handle tap on AR element
  const handleTapAR = (sensor: string, position: any) => {
    setSelectedSensor(sensor);
    // Convert AR world position to screen coordinates (approximate)
    // In a real app, this would be more accurate with proper projection
    setModalPosition({
      x: (position[0] + 0.5) * screenWidth,
      y: (position[1] + 0.5) * screenWidth,
    });
    setShowDetailModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  
  // Create sensor history chart data
  const getSensorHistoryData = (): ChartDataset[] => {
    if (!sensorMeasurements || sensorMeasurements.length === 0) {
      return [];
    }
    
    // Get appropriate data key based on selected sensor
    let dataKey = 'ph_level';
    let color = theme.colors.primary;
    let title = 'pH';
    
    switch (selectedSensor) {
      case 'ph':
        dataKey = 'ph_level';
        color = theme.colors.primary;
        title = 'pH';
        break;
      case 'ec':
        dataKey = 'ec_level';
        color = theme.colors.secondary;
        title = 'EC';
        break;
      case 'temperature':
        dataKey = 'water_temperature';
        color = '#FF6B6B';
        title = 'Temperature';
        break;
      case 'nitrogen':
        dataKey = 'nitrogen_level';
        color = '#2E7D32';
        title = 'Nitrogen';
        break;
      case 'phosphorus':
        dataKey = 'phosphorus_level';
        color = '#FF9800';
        title = 'Phosphorus';
        break;
      case 'potassium':
        dataKey = 'potassium_level';
        color = '#9C27B0';
        title = 'Potassium';
        break;
      default:
        dataKey = 'ph_level';
    }
    
    // Sort measurements by date
    const sortedMeasurements = [...sensorMeasurements].sort(
      (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    );
    
    // Create dataset for chart
    return [{
      label: title,
      data: sortedMeasurements.map(m => ({
        timestamp: new Date(m.measured_at),
        value: m[dataKey as keyof typeof m] as number,
        label: new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      })),
      color: color,
    }];
  };
  
  // Get unit for selected sensor
  const getSensorUnit = () => {
    switch (selectedSensor) {
      case 'ph': return '';
      case 'ec': return 'mS/cm';
      case 'temperature': return '°C';
      default: return 'ppm';
    }
  };
  
  // Render fallback if AR is not available
  if (showFallback) {
    return (
      <View style={[styles.fallbackContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.fallbackTitle, { color: theme.colors.primary }]}>
          AR View Not Available
        </Text>
        <Image 
          source={require('@/assets/ar-fallback/hydroponic-diagram.png')} 
          style={styles.fallbackImage}
          resizeMode="contain"
        />
        <Text style={{ color: theme.colors.grey0 }}>
          Your device doesn't support AR features. Here's a static view instead.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {showAR && (
        <ViroARSceneNavigator
          initialScene={{
            scene: ARScene,
            passProps: {
              onAnchorFound: handleAnchorFound,
              onTapAR: handleTapAR
            }
          }}
          style={styles.arView}
        />
      )}
      
      {/* Guide Overlay */}
      {!anchorFound && (
        <View style={[styles.guideOverlay, { top: insets.top + 40 }]}>
          <LinearGradient
            colors={[theme.colors.primary + '80', theme.colors.primary + '40']}
            style={styles.guideBox}
          >
            <Text style={styles.guideText}>
              Point camera at your hydroponic system
            </Text>
          </LinearGradient>
        </View>
      )}
      
      {/* Close Button */}
      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + 10 }]}
        onPress={() => Alert.alert(
          'Exit AR View?',
          'Do you want to exit the AR view?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: () => {} } // Navigate back
          ]
        )}
        accessibilityLabel="Exit AR view"
        testID="exit-ar-button"
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
      
      {/* Sensor Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetailModal(false)}
        >
          <View 
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background }
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.black }]}>
              {selectedSensor.charAt(0).toUpperCase() + selectedSensor.slice(1)} History
            </Text>
            
            {isLoading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
              <ScrollView style={styles.modalScroll}>
                {/* Sensor History Chart */}
                <InteractiveTrendChart
                  datasets={getSensorHistoryData()}
                  title=""
                  unit={getSensorUnit()}
                  height={220}
                  width={screenWidth - 64}
                  testID={`${selectedSensor}-trend-chart`}
                />
                
                {/* Sensor Info */}
                <View style={styles.sensorInfoContainer}>
                  <Text style={[styles.sensorInfoTitle, { color: theme.colors.grey0 }]}>
                    Optimal Range:
                  </Text>
                  <Text style={[styles.sensorInfoText, { color: theme.colors.grey1 }]}>
                    {selectedSensor === 'ph' && '6.0 - 6.5'}
                    {selectedSensor === 'ec' && '1.2 - 1.8 mS/cm'}
                    {selectedSensor === 'temperature' && '20 - 24°C'}
                    {selectedSensor === 'nitrogen' && '100 - 200 ppm'}
                    {selectedSensor === 'phosphorus' && '30 - 50 ppm'}
                    {selectedSensor === 'potassium' && '100 - 200 ppm'}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.closeModalButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setShowDetailModal(false)}
                  testID="close-detail-modal-button"
                >
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  guideOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  guideBox: {
    padding: 12,
    borderRadius: 8,
    maxWidth: '80%',
  },
  guideText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fallbackImage: {
    width: '100%',
    height: 300,
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    width: '100%',
  },
  sensorInfoContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  sensorInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sensorInfoText: {
    fontSize: 16,
  },
  closeModalButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 