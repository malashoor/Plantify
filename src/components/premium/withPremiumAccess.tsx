import React from 'react';
import { usePremiumAccess, type PremiumFeatureId } from '../../hooks/usePremiumAccess';
import PremiumBanner from './PremiumBanner';

interface WithPremiumAccessProps {
  featureId: PremiumFeatureId;
  variant?: 'inline' | 'overlay' | 'minimal';
  onUpgrade?: () => void;
}

export function withPremiumAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithPremiumAccessProps
) {
  return function WithPremiumAccessComponent(props: P) {
    const { hasAccess, getFeatureStatus } = usePremiumAccess();
    const featureStatus = getFeatureStatus(options.featureId);

    if (featureStatus.isLoading) {
      return null; // Or a loading spinner
    }

    if (!hasAccess(options.featureId)) {
      return (
        <PremiumBanner
          feature={featureStatus}
          variant={options.variant}
          onUpgrade={options.onUpgrade}
        />
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Usage example:
// const ProtectedFeature = withPremiumAccess(YourComponent, {
//   featureId: 'advancedCalculator',
//   variant: 'overlay',
// }); 