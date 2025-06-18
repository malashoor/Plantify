import { useCallback } from 'react';
import { router } from 'expo-router';
import { usePremiumAccess, type PremiumFeatureId } from './usePremiumAccess';

interface UseProtectedFeatureOptions {
  featureId: PremiumFeatureId;
  onUpgrade?: () => void;
  redirectToUpgrade?: boolean;
}

export function useProtectedFeature({
  featureId,
  onUpgrade,
  redirectToUpgrade = true,
}: UseProtectedFeatureOptions) {
  const { hasAccess, getFeatureStatus } = usePremiumAccess();

  const handleProtectedAction = useCallback(
    async <T extends (...args: any[]) => any>(
      action: T,
      ...args: Parameters<T>
    ): Promise<ReturnType<T> | void> => {
      if (!hasAccess(featureId)) {
        if (onUpgrade) {
          onUpgrade();
        } else if (redirectToUpgrade) {
          router.push('/premium');
        }
        return;
      }

      return action(...args);
    },
    [featureId, hasAccess, onUpgrade, redirectToUpgrade]
  );

  return {
    isAllowed: hasAccess(featureId),
    featureStatus: getFeatureStatus(featureId),
    protectedAction: handleProtectedAction,
  };
}

// Usage example:
// const { protectedAction, isAllowed } = useProtectedFeature({
//   featureId: 'advancedCalculator',
// });
//
// const handleCalculate = protectedAction(async () => {
//   // Your premium feature logic here
// }); 