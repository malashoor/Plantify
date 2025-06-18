import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SortControl, SortConfig } from '../SortControl';

// Mock react-native-paper components
jest.mock('react-native-paper', () => ({
  Menu: {
    Item: ({ onPress, title }: any) => (
      <button testID={`menu-item-${title}`} onPress={onPress}>
        {title}
      </button>
    ),
  },
  IconButton: ({ onPress, accessibilityLabel }: any) => (
    <button testID="icon-button" onPress={onPress}>
      {accessibilityLabel}
    </button>
  ),
  useTheme: () => ({
    colors: {
      surfaceDisabled: '#999999',
    },
  }),
  Divider: () => null,
  Text: ({ children }: any) => <span>{children}</span>,
}));

// Mock MaterialCommunityIcons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'Icon',
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key.startsWith('sorting.criteria.')) {
        return key.split('.').pop();
      }
      if (key.startsWith('sorting.direction.')) {
        return key.split('.').pop();
      }
      return key;
    },
  }),
}));

describe('SortControl', () => {
  const defaultProps = {
    currentSort: {
      primary: {
        criteria: 'nextWatering',
        direction: 'asc',
      },
      secondary: null,
    } as SortConfig,
    onSortChange: jest.fn(),
    isRTL: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { getByTestId } = render(<SortControl {...defaultProps} />);
      expect(getByTestId('icon-button')).toBeTruthy();
    });

    it('should show menu on button press', () => {
      const { getByTestId, queryByText } = render(<SortControl {...defaultProps} />);
      
      fireEvent.press(getByTestId('icon-button'));
      
      expect(queryByText('sorting.primaryLabel')).toBeTruthy();
      expect(queryByText('sorting.secondaryLabel')).toBeTruthy();
    });

    it('should handle RTL layout', () => {
      const { container } = render(<SortControl {...defaultProps} isRTL={true} />);
      // Note: Actual RTL testing would require more sophisticated setup
      expect(container).toBeTruthy();
    });
  });

  describe('Sort Criteria Selection', () => {
    it('should call onSortChange when selecting primary criteria', () => {
      const { getByTestId } = render(<SortControl {...defaultProps} />);
      
      fireEvent.press(getByTestId('icon-button')); // Open menu
      fireEvent.press(getByTestId('menu-item-name')); // Select 'name' criteria
      
      expect(defaultProps.onSortChange).toHaveBeenCalledWith({
        primary: {
          criteria: 'name',
          direction: 'asc',
        },
        secondary: null,
      });
    });

    it('should call onSortChange when selecting secondary criteria', () => {
      const props = {
        ...defaultProps,
        currentSort: {
          primary: {
            criteria: 'nextWatering',
            direction: 'asc',
          },
          secondary: {
            criteria: 'moisture',
            direction: 'asc',
          },
        },
      };

      const { getByTestId } = render(<SortControl {...props} />);
      
      fireEvent.press(getByTestId('icon-button')); // Open menu
      fireEvent.press(getByTestId('menu-item-name')); // Select 'name' as secondary
      
      expect(props.onSortChange).toHaveBeenCalledWith({
        primary: {
          criteria: 'nextWatering',
          direction: 'asc',
        },
        secondary: {
          criteria: 'name',
          direction: 'asc',
        },
      });
    });
  });

  describe('Direction Toggle', () => {
    it('should toggle primary sort direction', () => {
      const { getByTestId } = render(<SortControl {...defaultProps} />);
      
      fireEvent.press(getByTestId('icon-button')); // Open menu
      fireEvent.press(getByTestId('direction-toggle-primary')); // Toggle direction
      
      expect(defaultProps.onSortChange).toHaveBeenCalledWith({
        primary: {
          criteria: 'nextWatering',
          direction: 'desc',
        },
        secondary: null,
      });
    });

    it('should toggle secondary sort direction', () => {
      const props = {
        ...defaultProps,
        currentSort: {
          primary: {
            criteria: 'nextWatering',
            direction: 'asc',
          },
          secondary: {
            criteria: 'name',
            direction: 'asc',
          },
        },
      };

      const { getByTestId } = render(<SortControl {...props} />);
      
      fireEvent.press(getByTestId('icon-button')); // Open menu
      fireEvent.press(getByTestId('direction-toggle-secondary')); // Toggle direction
      
      expect(props.onSortChange).toHaveBeenCalledWith({
        primary: {
          criteria: 'nextWatering',
          direction: 'asc',
        },
        secondary: {
          criteria: 'name',
          direction: 'desc',
        },
      });
    });
  });

  describe('Accessibility', () => {
    it('should provide accessible labels', () => {
      const { getByTestId } = render(<SortControl {...defaultProps} />);
      const button = getByTestId('icon-button');
      
      expect(button.props.accessibilityLabel).toBeTruthy();
      expect(button.props.accessibilityHint).toBeTruthy();
    });

    it('should update accessibility labels on sort change', () => {
      const { getByTestId, rerender } = render(<SortControl {...defaultProps} />);
      
      const newProps = {
        ...defaultProps,
        currentSort: {
          primary: {
            criteria: 'name',
            direction: 'desc',
          },
          secondary: null,
        },
      };
      
      rerender(<SortControl {...newProps} />);
      
      const button = getByTestId('icon-button');
      expect(button.props.accessibilityLabel).toContain('name');
    });
  });
}); 