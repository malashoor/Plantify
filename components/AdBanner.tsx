import { AdMobBanner } from 'expo-ads-admob';

import { AD_CONFIG } from '@/constants/pricing';
import { View, StyleSheet, Platform } from 'react-native';


interface Props {
  size?:
    | 'banner'
    | 'largeBanner'
    | 'mediumRectangle'
    | 'fullBanner'
    | 'leaderboard'
    | 'smartBannerPortrait'
    | 'smartBannerLandscape';
}

export default function AdBanner({ size = 'banner' }: Props) {
  const bannerUnitId = __DEV__
    ? Platform.select({
        ios: 'ca-app-pub-3940256099942544/2934735716', // Test ID
        android: 'ca-app-pub-3940256099942544/6300978111', // Test ID
        default: 'ca-app-pub-3940256099942544/6300978111',
      })
    : Platform.select({
        ios: AD_CONFIG.banner.unitId.ios,
        android: AD_CONFIG.banner.unitId.android,
        default: AD_CONFIG.banner.unitId.android,
      });

  if (!bannerUnitId) return null;

  return (
    <View style={styles.container}>
      <AdMobBanner
        bannerSize={size}
        adUnitID={bannerUnitId}
        servePersonalizedAds={true}
        onDidFailToReceiveAdWithError={(error) => console.error(error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
