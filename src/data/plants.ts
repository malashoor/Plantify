// Basic plant data for the app
export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  description?: string;
  image?: any;
  careLevel?: 'Easy' | 'Medium' | 'Hard';
  lightRequirement?: string;
  waterFrequency?: string;
  care?: string;
}

// Sample plant data
export const PLANTS: Plant[] = [
  {
    id: '1',
    name: 'Aloe Vera',
    scientificName: 'Aloe barbadensis',
    description: 'A succulent plant with healing properties',
    careLevel: 'Easy',
    lightRequirement: 'Bright indirect light',
    waterFrequency: 'Every 2-3 weeks'
  },
  {
    id: '2', 
    name: 'Basil',
    scientificName: 'Ocimum basilicum',
    description: 'A fragrant herb perfect for cooking',
    careLevel: 'Easy',
    lightRequirement: 'Full sun',
    waterFrequency: 'Daily when dry'
  },
  {
    id: '3',
    name: 'Snake Plant',
    scientificName: 'Sansevieria trifasciata',
    description: 'A hardy plant that purifies air',
    careLevel: 'Easy',
    lightRequirement: 'Low to bright light',
    waterFrequency: 'Every 2-4 weeks'
  }
]; 