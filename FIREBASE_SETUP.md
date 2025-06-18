# Firebase Setup Guide for GreensAI

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project details:
   - Project name: `GreensAI`
   - Enable Google Analytics: Yes
   - Analytics location: Your preferred region

## 2. iOS Setup

1. In Firebase Console, click "Add app" and select iOS
2. Enter iOS app details:
   - Bundle ID: `com.greensai.app`
   - App nickname: `GreensAI`
   - App Store ID: (leave blank for now)

3. Download `GoogleService-Info.plist`
4. Place it in the `ios/GreensAI` directory
5. Add to Xcode project:
   - Open Xcode
   - Right-click on GreensAI in the navigator
   - Select "Add Files to GreensAI"
   - Choose `GoogleService-Info.plist`

## 3. Android Setup

1. In Firebase Console, click "Add app" and select Android
2. Enter Android app details:
   - Package name: `com.greensai.app`
   - App nickname: `GreensAI`
   - Debug signing certificate SHA-1: (optional for now)

3. Download `google-services.json`
4. Place it in the `android/app` directory

## 4. Enable Services

### 4.1 Analytics
1. Go to Analytics in Firebase Console
2. Enable Google Analytics
3. Set up custom events:
   - `plant_identified`
   - `care_reminder_set`
   - `plant_health_updated`

### 4.2 Cloud Messaging
1. Go to Cloud Messaging
2. Enable FCM
3. Configure APNs for iOS:
   - Upload your APNs key
   - Set up notification channels

### 4.3 Crashlytics
1. Go to Crashlytics
2. Enable for both platforms
3. Add SDK to your project

## 5. Update App Configuration

### 5.1 iOS (app.config.js)
```javascript
ios: {
  googleServicesFile: "./GoogleService-Info.plist",
  // ... other iOS config
}
```

### 5.2 Android (app.config.js)
```javascript
android: {
  googleServicesFile: "./google-services.json",
  // ... other Android config
}
```

## 6. Test Firebase Integration

1. Run the app in development
2. Verify analytics events are being sent
3. Test push notifications
4. Check crash reporting

## 7. Production Setup

1. Update Firebase project settings:
   - Set up production environment
   - Configure security rules
   - Set up monitoring alerts

2. Add Firebase configuration to CI/CD:
   - Store credentials securely
   - Update build scripts

## 8. Troubleshooting

### Common Issues
1. Analytics not showing data:
   - Check bundle ID matches
   - Verify GoogleService-Info.plist is included in build

2. Push notifications not working:
   - Verify APNs key is valid
   - Check notification permissions

3. Crashlytics not reporting:
   - Ensure SDK is properly initialized
   - Check build configuration

## 9. Security Rules

### 9.1 Analytics
```javascript
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### 9.2 Cloud Messaging
```javascript
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 10. Maintenance

1. Regular tasks:
   - Monitor Firebase usage
   - Review security rules
   - Update SDK versions
   - Check for deprecated features

2. Backup:
   - Export Firebase configuration
   - Document all custom events
   - Keep credentials secure

## Support

For Firebase-related issues:
- Email: support@greensai.app
- Firebase Support: https://firebase.google.com/support 