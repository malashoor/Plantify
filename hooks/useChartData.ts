import { useCallback, useEffect, useState } from 'react';
import { ChartDataset } from '@/types';
import { isAfter, isBefore, isWithinInterval } from 'date-fns';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface UseChartDataProps<T> {
  data: T[];
  mapFunction: (item: T, index: number) => ChartDataset[];
  initialDateRange?: DateRange;
}

export function useChartData<T>({
  data,
  mapFunction,
  initialDateRange,
}: UseChartDataProps<T>) {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    if (initialDateRange) {
      return initialDateRange;
    }
    
    // Default to last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    return { startDate, endDate };
  });
  
  const [filteredDatasets, setFilteredDatasets] = useState<ChartDataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Process data when it changes or date range changes
  useEffect(() => {
    if (!data.length) {
      setFilteredDatasets([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Map the raw data to chart datasets
    const allDatasets = mapFunction(data[0], 0);
    
    // Apply date filters to each dataset
    const filtered = allDatasets.map(dataset => {
      return {
        ...dataset,
        data: dataset.data.filter(point => 
          isWithinInterval(point.timestamp, {
            start: dateRange.startDate,
            end: dateRange.endDate,
          })
        ),
      };
    }).filter(dataset => dataset.data.length > 0); // Only include datasets with data
    
    setFilteredDatasets(filtered);
    setIsLoading(false);
  }, [data, dateRange, mapFunction]);
  
  // Update date range
  const updateDateRange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);
  
  return {
    datasets: filteredDatasets,
    dateRange,
    updateDateRange,
    isLoading,
  };
} 