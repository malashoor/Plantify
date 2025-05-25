export const PLANTS = [
  {
    id: '1',
    name: 'Aloe Vera',
    image: require('@assets/plants/aloe_vera.png'),
    description: 'A succulent plant species known for its medicinal properties.',
    care: 'Water sparingly—allow soil to dry between waterings. Prefers bright, indirect light.',
  },
  {
    id: '2',
    name: 'Basil',
    image: require('@assets/plants/basil.png'),
    description: 'A fragrant culinary herb used in many dishes.',
    care: 'Keep soil moist but not waterlogged. Needs at least 6 hours of sunlight daily.',
  },
  {
    id: '3',
    name: 'Fern',
    image: require('@assets/plants/fern.png'),
    description: 'Lush green plants that thrive in humid environments.',
    care: 'Keep soil consistently moist. Prefers indirect light and high humidity.',
  },
  {
    id: '4',
    name: 'Snake Plant',
    image: require('@assets/plants/snake_plant.png'),
    description: 'A hardy plant known for purifying air and tolerating neglect.',
    care: 'Water every 2-3 weeks. Thrives in low light conditions.',
  },
];

export const PLANTS_MAP = {
  '1': PLANTS[0],
  '2': PLANTS[1],
  '3': PLANTS[2],
  '4': PLANTS[3],
}; 