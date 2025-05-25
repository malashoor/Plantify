# New Module Structure

## 1. Hydroponic Systems Module

### Folder Structure

```
app/
├── (tabs)/
│   └── hydroponic-systems/
│       ├── _layout.tsx           # Tab layout with nested navigation
│       ├── index.tsx             # Systems list view
│       ├── [id].tsx             # System details view
│       ├── new.tsx              # New system form
│       └── edit/
│           └── [id].tsx         # Edit system form
├── components/
│   └── hydroponic/
│       ├── SystemCard.tsx       # System list item
│       ├── MeasurementForm.tsx  # Add/edit measurements
│       ├── LightingSchedule.tsx # Lighting schedule component
│       ├── NutrientChart.tsx    # Nutrient level visualization
│       └── SystemStats.tsx      # System statistics summary
└── hooks/
    └── useHydroponicSystem.ts   # System management hook
```

### Required Dependencies

- `react-native-chart-kit` for nutrient level charts
- `@react-native-community/datetimepicker` for time selection
- `react-native-slider` for intensity control

## 2. Plant Journal Module

### Folder Structure

```
app/
├── (tabs)/
│   └── journal/
│       ├── _layout.tsx          # Tab layout with nested navigation
│       ├── index.tsx            # Journal entries list
│       ├── [id].tsx            # Journal entry details
│       ├── new.tsx             # New entry form
│       └── edit/
│           └── [id].tsx        # Edit entry form
├── components/
│   └── journal/
│       ├── JournalCard.tsx     # Journal entry list item
│       ├── EmotionSelector.tsx # Emotion tag selection
│       ├── PhotoUploader.tsx   # Photo upload component
│       └── JournalTimeline.tsx # Timeline view of entries
└── hooks/
    └── usePlantJournal.ts      # Journal management hook
```

### Required Dependencies

- `expo-image-picker` for photo uploads
- `react-native-emoji-selector` for emotion tags
- `react-native-calendars` for date selection
- `react-native-gesture-handler` for timeline interactions

## Shared Components

```
components/
└── shared/
    ├── PhotoViewer.tsx         # Photo preview component
    ├── DatePicker.tsx          # Date selection component
    └── FormInput.tsx           # Reusable form inputs
```

## Navigation Structure

```typescript
// app/(tabs)/_layout.tsx
<Tabs>
  {/* Existing tabs */}
  <Tabs.Screen
    name="hydroponic-systems"
    options={{
      title: t('tabs.hydroponic'),
      tabBarIcon: ({ color, size }) => <Droplet size={size} color={color} />,
    }}
  />
  <Tabs.Screen
    name="journal"
    options={{
      title: t('tabs.journal'),
      tabBarIcon: ({ color, size }) => <Book size={size} color={color} />,
    }}
  />
</Tabs>
```

## State Management

- Use React Query for data fetching and caching
- Implement optimistic updates for better UX
- Add offline support with AsyncStorage

## API Integration

```typescript
// utils/api.ts
export const hydroponicApi = {
  getSystems: () => supabase.from('hydroponic_systems').select('*'),
  getSystemDetails: (id: string) =>
    supabase
      .from('hydroponic_systems')
      .select('*, measurements(*), lighting_schedules(*)')
      .eq('id', id)
      .single(),
  // ... other methods
};

export const journalApi = {
  getEntries: () => supabase.from('plant_journals').select('*'),
  getEntryDetails: (id: string) =>
    supabase
      .from('plant_journals')
      .select('*, plants(name, image_url)')
      .eq('id', id)
      .single(),
  // ... other methods
};
```

## Required Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
EXPO_PUBLIC_STORAGE_URL=your_storage_url
```
