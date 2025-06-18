import { SpeciesProfile } from '../types/species';

export const speciesProfiles: SpeciesProfile[] = [
  {
    id: 'basil_genovese',
    scientificName: 'Ocimum basilicum',
    commonNames: ['Sweet Basil', 'Genovese Basil'],
    category: 'herb',
    moisture: {
      retentionScore: 0.4,
      droughtTolerance: 0.3,
      humidityPreference: 0.6,
      wateringInterval: {
        summer: 2,
        winter: 4,
      },
      moistureThresholds: {
        min: 0.3,
        optimal: 0.6,
        max: 0.8,
      },
      sensitivities: {
        overwatering: true,
        underwatering: true,
        temperature: true,
        wind: true,
      },
    },
    careNotes: {
      watering: [
        'Keep soil consistently moist but not waterlogged',
        'Water when top inch of soil feels dry',
        'Increase frequency during flowering',
      ],
      environment: [
        'Prefers warm, humid conditions',
        'Protect from strong winds',
        'Good air circulation prevents disease',
      ],
      seasonal: [
        'Water more frequently in summer heat',
        'Reduce watering in winter',
        'Monitor closely during temperature extremes',
      ],
    },
  },
  {
    id: 'aloe_vera',
    scientificName: 'Aloe vera',
    commonNames: ['Aloe', 'Medicinal Aloe'],
    category: 'succulent',
    moisture: {
      retentionScore: 0.9,
      droughtTolerance: 0.9,
      humidityPreference: 0.3,
      wateringInterval: {
        summer: 14,
        winter: 28,
      },
      moistureThresholds: {
        min: 0.1,
        optimal: 0.3,
        max: 0.5,
      },
      sensitivities: {
        overwatering: true,
        underwatering: false,
        temperature: false,
        wind: false,
      },
    },
    careNotes: {
      watering: [
        'Allow soil to dry completely between waterings',
        'Water deeply but infrequently',
        'Reduce watering significantly in winter',
      ],
      environment: [
        'Excellent drought tolerance',
        'Prone to root rot in wet conditions',
        'Prefers dry air over humidity',
      ],
      seasonal: [
        'Minimal water needed in winter dormancy',
        'Slightly increase watering during active growth',
        'Watch for signs of overwatering in cool seasons',
      ],
    },
  },
  {
    id: 'peace_lily',
    scientificName: 'Spathiphyllum wallisii',
    commonNames: ['Peace Lily', 'White Sail Plant'],
    category: 'houseplant',
    moisture: {
      retentionScore: 0.6,
      droughtTolerance: 0.2,
      humidityPreference: 0.8,
      wateringInterval: {
        summer: 5,
        winter: 7,
      },
      moistureThresholds: {
        min: 0.4,
        optimal: 0.7,
        max: 0.9,
      },
      sensitivities: {
        overwatering: true,
        underwatering: true,
        temperature: true,
        wind: false,
      },
    },
    careNotes: {
      watering: [
        'Keep soil consistently moist',
        'Water when top of soil starts to dry',
        'Responds well to humidity',
      ],
      environment: [
        'Thrives in high humidity',
        'Protect from cold drafts',
        'Ideal for bathroom environments',
      ],
      seasonal: [
        'Maintain even moisture year-round',
        'Mist regularly in dry winter air',
        'Watch for leaf browning in low humidity',
      ],
    },
  },
  {
    id: 'tomato_cherry',
    scientificName: 'Solanum lycopersicum var. cerasiforme',
    commonNames: ['Cherry Tomato'],
    category: 'vegetable',
    moisture: {
      retentionScore: 0.5,
      droughtTolerance: 0.4,
      humidityPreference: 0.6,
      wateringInterval: {
        summer: 1,
        winter: 2,
      },
      moistureThresholds: {
        min: 0.4,
        optimal: 0.6,
        max: 0.8,
      },
      sensitivities: {
        overwatering: true,
        underwatering: true,
        temperature: true,
        wind: true,
      },
    },
    careNotes: {
      watering: [
        'Water deeply and regularly',
        'Keep soil consistently moist',
        'Avoid wetting leaves to prevent disease',
      ],
      environment: [
        'Needs excellent drainage',
        'Mulch helps retain moisture',
        'Morning watering is best',
      ],
      seasonal: [
        'Increase water during fruit development',
        'Monitor closely during heat waves',
        'Reduce watering in cooler weather',
      ],
    },
  },
  {
    id: 'lavender_english',
    scientificName: 'Lavandula angustifolia',
    commonNames: ['English Lavender', 'Common Lavender'],
    category: 'herb',
    moisture: {
      retentionScore: 0.7,
      droughtTolerance: 0.8,
      humidityPreference: 0.3,
      wateringInterval: {
        summer: 7,
        winter: 14,
      },
      moistureThresholds: {
        min: 0.2,
        optimal: 0.4,
        max: 0.6,
      },
      sensitivities: {
        overwatering: true,
        underwatering: false,
        temperature: false,
        wind: false,
      },
    },
    careNotes: {
      watering: [
        'Allow soil to dry between waterings',
        'Avoid overwatering at all costs',
        'Water at base of plant only',
      ],
      environment: [
        'Prefers dry, well-draining soil',
        'Excellent drought tolerance once established',
        'Good air circulation is essential',
      ],
      seasonal: [
        'Minimal watering in winter',
        'Increase slightly during blooming',
        'Most water-sensitive in cool, wet seasons',
      ],
    },
  },
];
