import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Grassp Driver App',
  slug: 'GrasspDriverApp',
  extra: {
    stagingURL: 'https://api.staging.grasspit.com/',
    prodURL: 'https://api.grassp.it/',
  },
  version: '1.0.0',
  sdkVersion: '38.0.0',
  platforms: ['ios', 'android'],
  orientation: 'portrait',
  icon: './assets/grasspLogo1024.png',
  splash: {
    image: './assets/iphoneplus_splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  privacy: 'unlisted',
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: 'com.GrasspDriver.app',
    buildNumber: '1.0.0',
    supportsTablet: true,
    infoPlist: {
      UIBackgroundModes: ['location', 'fetch'],
    },
  },
  android: {
    package: 'com.GrasspHealth.DriverApp',
    googleServicesFile: './google-services.json',
    config: {
      googleMaps: {
        apiKey: 'AIzaSyD9DqhXUVHI6Z9RlFK8EBW1kRFmzqlyW5c',
      },
    },
    versionCode: 1,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  description: 'A mobile app for Grassp Health dispensary drivers.',
});
