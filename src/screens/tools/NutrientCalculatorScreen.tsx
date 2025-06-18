import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Title, Paragraph, Surface } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

type PlantType = 'leafy' | 'fruiting' | 'root';

interface NutrientRatio {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

const NUTRIENT_RATIOS: Record<PlantType, NutrientRatio> = {
  leafy: { nitrogen: 3, phosphorus: 1, potassium: 2 },
  fruiting: { nitrogen: 5, phosphorus: 10, potassium: 10 },
  root: { nitrogen: 2, phosphorus: 4, potassium: 6 },
};

export default function NutrientCalculatorScreen() {
  const [plantType, setPlantType] = useState<PlantType>('leafy');
  const [plantWeight, setPlantWeight] = useState('');
  const [results, setResults] = useState<NutrientRatio | null>(null);

  const calculateNutrients = () => {
    const weight = parseFloat(plantWeight);
    if (isNaN(weight) || weight <= 0) {
      return;
    }

    const ratio = NUTRIENT_RATIOS[plantType];
    const nutrients = {
      nitrogen: (ratio.nitrogen * weight) / 100,
      phosphorus: (ratio.phosphorus * weight) / 100,
      potassium: (ratio.potassium * weight) / 100,
    };
    setResults(nutrients);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <Card style={{ margin: 16 }}>
        <Card.Content>
          <Title>Nutrient Calculator</Title>
          <Paragraph>Calculate the optimal nutrient mix for your plants</Paragraph>

          <Surface style={{ marginTop: 16, gap: 12 }}>
            <Text>Plant Type</Text>
            <Surface style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginTop: 4 }}>
              <Picker
                selectedValue={plantType}
                onValueChange={(value: PlantType) => setPlantType(value)}
                style={{ width: '100%' }}
              >
                <Picker.Item label="Leafy Plants" value="leafy" />
                <Picker.Item label="Fruiting Plants" value="fruiting" />
                <Picker.Item label="Root Plants" value="root" />
              </Picker>
            </Surface>

            <TextInput
              label="Plant Weight (grams)"
              value={plantWeight}
              onChangeText={setPlantWeight}
              keyboardType="numeric"
              mode="outlined"
              style={{ backgroundColor: '#fff' }}
            />

            <Button mode="contained" onPress={calculateNutrients} style={{ marginTop: 8 }}>
              Calculate
            </Button>
          </Surface>

          {results && (
            <Card style={{ marginTop: 16, backgroundColor: '#e8f5e9' }}>
              <Card.Content>
                <Title>Recommended Nutrients (grams)</Title>
                <Surface
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 4,
                  }}
                >
                  <Text>Nitrogen (N):</Text>
                  <Text>{results.nitrogen.toFixed(2)}g</Text>
                </Surface>
                <Surface
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 4,
                  }}
                >
                  <Text>Phosphorus (P):</Text>
                  <Text>{results.phosphorus.toFixed(2)}g</Text>
                </Surface>
                <Surface
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 4,
                  }}
                >
                  <Text>Potassium (K):</Text>
                  <Text>{results.potassium.toFixed(2)}g</Text>
                </Surface>
              </Card.Content>
            </Card>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
