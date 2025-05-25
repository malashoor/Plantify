# Interactive Charts Components

This directory contains components for creating interactive charts with date range filtering and point tap interactions.

## Components

### InteractiveTrendChart

A chart component that displays data points with interactive features:

- Tap on any data point to view details in a popup
- Handles touchscreen events for both iOS and Android
- Support for keyboard navigation and screen readers
- Animates transitions between data sets
- Can use either Victory Charts or react-native-chart-kit

```tsx
import { InteractiveTrendChart } from '@/components/charts/InteractiveTrendChart';

// Example usage
<InteractiveTrendChart
  datasets={[{
    label: 'Temperature',
    data: [{
      timestamp: new Date('2023-05-20'),
      value: 24.5,
      label: 'May 20',
      comment: 'Peak afternoon temperature'
    }],
    color: '#FF6B6B'
  }]}
  title="Temperature Readings"
  unit="°C"
  useVictory={true}
  bezier={true}
  onPointPress={(point) => console.log('Point pressed:', point)}
  testID="temperature-chart"
/>
```

### DateRangeSelector

A component for selecting date ranges to filter chart data:

- Preset options: "Last 7 days", "Last 30 days", "Custom range"
- Custom date picker for selecting specific date ranges
- Handles both iOS and Android date pickers
- Accessible for screen readers

```tsx
import { DateRangeSelector } from '@/components/charts/DateRangeSelector';

// Example usage
<DateRangeSelector
  onRangeSelected={(range) => console.log('Selected range:', range)}
  initialRange={{ startDate: new Date('2023-05-01'), endDate: new Date('2023-05-31') }}
  testID="date-range-selector"
/>
```

### InteractiveChartWithDateRange

A complete component combining charts with date range filtering:

- Includes both the InteractiveTrendChart and DateRangeSelector
- Handles data filtering based on selected date range
- Animates transitions when date range changes
- Uses the useChartData hook for data processing

```tsx
import { InteractiveChartWithDateRange } from '@/components/charts/InteractiveChartWithDateRange';

// Example usage
<InteractiveChartWithDateRange
  data={measurementsData}
  mapFunction={(data) => [{
    label: 'pH',
    data: data.map(m => ({
      timestamp: new Date(m.measured_at),
      value: m.ph_level,
      label: new Date(m.measured_at).toLocaleDateString(),
    })),
    color: theme.colors.primary,
  }]}
  title="pH Readings"
  unit=""
  useVictory={true}
  bezier={true}
  testID="ph-chart"
/>
```

## Hooks

### useChartData

A hook for processing chart data with date range filtering:

```tsx
import { useChartData } from '@/hooks/useChartData';

// Example usage
const { 
  datasets,
  dateRange,
  updateDateRange,
  isLoading
} = useChartData({
  data: measurements,
  mapFunction: (item) => [{
    label: 'Temperature',
    data: [...],
    color: '#FF6B6B'
  }],
  initialDateRange: { startDate: new Date('2023-05-01'), endDate: new Date('2023-05-31') }
});
```

### useAccessibilityInfo

A hook for accessing device accessibility settings:

```tsx
import { useAccessibilityInfo } from '@/hooks/useAccessibilityInfo';

// Example usage
const { 
  screenReaderEnabled,
  reduceMotionEnabled,
  reduceTransparencyEnabled,
  boldTextEnabled
} = useAccessibilityInfo();

// Conditionally render based on accessibility settings
if (screenReaderEnabled) {
  // Provide alternative UI for screen readers
}
```

## Accessibility Features

- All interactive elements have appropriate accessibility labels and roles
- Charts can be navigated with keyboard (arrow keys)
- Screen reader announcements for data points
- Respects device reduce motion settings
- High contrast support

## Usage Tips

1. For best performance with large datasets (>500 points), set `useVictory={true}`
2. For smoother line appearance, set `bezier={true}`
3. For more precise point selection, set `bezier={false}`
4. Always provide meaningful units in the `unit` prop
5. Custom styles can be applied to charts by using theme context 