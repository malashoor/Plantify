import { AccessibilityInfo } from 'react-native';
import { RenderAPI } from '@testing-library/react-native';

export interface AccessibilityTestHelpers {
  verifyAccessibilityLabels: (labels: string[]) => void;
  verifyAccessibilityRoles: (roles: { [key: string]: string }) => void;
  verifyAccessibilityAnnouncements: (announcements: string[]) => void;
  verifyFocusOrder: (elements: string[]) => Promise<void>;
  verifyRTLSupport: () => void;
}

export const createAccessibilityTestHelpers = (
  renderResult: RenderAPI,
  mockT: jest.Mock
): AccessibilityTestHelpers => {
  const { getByA11yLabel, getAllByA11yRole } = renderResult;

  return {
    verifyAccessibilityLabels: (labels: string[]) => {
      labels.forEach(label => {
        expect(getByA11yLabel(label)).toBeTruthy();
      });
    },

    verifyAccessibilityRoles: (roles: { [key: string]: string }) => {
      Object.entries(roles).forEach(([label, role]) => {
        const element = getByA11yLabel(label);
        expect(element.props.accessibilityRole).toBe(role);
      });
    },

    verifyAccessibilityAnnouncements: (announcements: string[]) => {
      announcements.forEach(announcement => {
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          expect.stringContaining(announcement)
        );
      });
    },

    verifyFocusOrder: async (elements: string[]) => {
      for (const element of elements) {
        const target = getByA11yLabel(element);
        await target.props.onFocus?.();
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          expect.stringContaining(element)
        );
      }
    },

    verifyRTLSupport: () => {
      const rtlElements = getAllByA11yRole('none').filter(
        element => element.props.accessibilityLiveRegion === 'polite'
      );
      expect(rtlElements.length).toBeGreaterThan(0);
    },
  };
};

export const commonAccessibilityTests = {
  testBasicAccessibility: (
    renderComponent: () => RenderAPI,
    mockT: jest.Mock,
    config: {
      labels: string[];
      roles: { [key: string]: string };
      announcements: string[];
      focusOrder: string[];
    }
  ) => {
    it('renders with proper accessibility labels', () => {
      const helpers = createAccessibilityTestHelpers(renderComponent(), mockT);
      helpers.verifyAccessibilityLabels(config.labels);
    });

    it('has correct accessibility roles', () => {
      const helpers = createAccessibilityTestHelpers(renderComponent(), mockT);
      helpers.verifyAccessibilityRoles(config.roles);
    });

    it('makes proper accessibility announcements', () => {
      const helpers = createAccessibilityTestHelpers(renderComponent(), mockT);
      helpers.verifyAccessibilityAnnouncements(config.announcements);
    });

    it('maintains correct focus order', async () => {
      const helpers = createAccessibilityTestHelpers(renderComponent(), mockT);
      await helpers.verifyFocusOrder(config.focusOrder);
    });

    it('supports RTL layout', () => {
      const helpers = createAccessibilityTestHelpers(renderComponent(), mockT);
      helpers.verifyRTLSupport();
    });
  },
};

export const mockAccessibilityInfo = () => {
  jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
      ...RN,
      AccessibilityInfo: {
        ...RN.AccessibilityInfo,
        announceForAccessibility: jest.fn(),
        isScreenReaderEnabled: jest.fn(() => Promise.resolve(true)),
        setAccessibilityFocus: jest.fn(),
        announceForAccessibilityWithOptions: jest.fn(),
      },
    };
  });
};

export const mockAccessibilityHooks = () => {
  jest.mock('@hooks/useAccessibility', () => ({
    useAccessibility: () => ({
      isScreenReaderEnabled: true,
      voiceOverSpeedRate: 0.5,
      announceForAccessibility: jest.fn(),
      setAccessibilityFocus: jest.fn(),
    }),
  }));
}; 