# GreensAI - Plant Identification App with Supabase Integration

This is a React Native Expo application for plant identification, care, and hydroponic gardening support with Supabase integration for backend services.

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server with a clean cache
npm run clean

# If you encounter persistent issues, use the reset command
npm run reset
```

## Troubleshooting Common Issues

If you encounter errors related to Expo or dependencies:

1. **Clear cache and restart:**

   ```bash
   npm run clean
   ```

2. **Reset the entire project:**

   ```bash
   npm run reset
   ```

3. **Manual cache clearing:**

   - Remove the `.expo` folder
   - Remove `node_modules/.cache`
   - Run `npm install` again

4. **Supabase connection issues:**
   - Verify your environment variables in `.env`
   - Check Supabase project status in the dashboard
   - Try the connection test in the Profile tab

## Supabase Setup Instructions

The application is configured with the following Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://olgxhameijbqxjafrvxz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ3hoYW1laWpicXhqYWZydnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzQzOTgsImV4cCI6MjA1NjQxMDM5OH0.ldF_a9ccd8odjpBtrACmo85RqMpJaoeXVLaVuBKVhkE
```

## Database Schema

The application uses the following tables:

- **plants**: Stores information about user's plants
- **care_tasks**: Tracks care tasks for plants
- **plant_identifications**: Records plant identification history

## Features

- Plant identification using AI
- Plant care tracking and reminders
- Hydroponic gardening support
- Multilingual support (English and Arabic)
- Dark mode support

## Environment Variables

### Required Variables

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://olgxhameijbqxjafrvxz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ3hoYW1laWpicXhqYWZydnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzQzOTgsImV4cCI6MjA1NjQxMDM5OH0.ldF_a9ccd8odjpBtrACmo85RqMpJaoeXVLaVuBKVhkE

# Storage Configuration
EXPO_PUBLIC_STORAGE_URL=your_storage_url
EXPO_PUBLIC_STORAGE_BUCKET=your_storage_bucket

# API Keys
EXPO_PUBLIC_PLANT_ID_API_KEY=your_plant_id_key
EXPO_PUBLIC_GOOGLE_CLOUD_VISION_KEY=your_vision_key
EXPO_PUBLIC_SENSORPUSH_API_KEY=your_sensorpush_key
EXPO_PUBLIC_NETATMO_CLIENT_ID=your_netatmo_id
EXPO_PUBLIC_NETATMO_CLIENT_SECRET=your_netatmo_secret
EXPO_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_id

# Feature Flags
EXPO_PUBLIC_ENABLE_VOICE_COMMANDS=true
EXPO_PUBLIC_ENABLE_DARK_MODE=true
EXPO_PUBLIC_ENABLE_OFFLINE_MODE=true
```

### Security Notes

- All API keys are stored in secure environment variables
- Keys are rotated every 90 days
- Access is restricted to production environment
- Never commit `.env` files to version control
- Use `.env.example` as a template

### Development Setup

1. Copy `.env.example` to `.env`
2. Fill in the required variables
3. Install dependencies: `npm install`
4. Start the development server: `npm start`

### Production Deployment

1. Set up environment variables in your hosting platform
2. Configure CI/CD pipeline with secure variable injection
3. Enable automatic key rotation
4. Set up monitoring and alerts for key usage

## Privacy and Security

- All data is encrypted at rest and in transit
- User data is protected by Row Level Security (RLS)
- Regular security audits and penetration testing
- GDPR and CCPA compliant
- Regular backups and disaster recovery

## Accessibility

- Voice command support
- Dark mode support
- Screen reader compatibility
- High contrast mode
- Adjustable text sizes

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authentication Setup

### 1. Environment Variables

The application is configured with the following environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=https://olgxhameijbqxjafrvxz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ3hoYW1laWpicXhqYWZydnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzQzOTgsImV4cCI6MjA1NjQxMDM5OH0.ldF_a9ccd8odjpBtrACmo85RqMpJaoeXVLaVuBKVhkE
EXPO_PUBLIC_APP_URL=greensai://
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id
```

### 2. Supabase Configuration

1. Create a new project in [Supabase](https://supabase.com)
2. Enable Email/Password authentication in Authentication → Providers
3. Configure OAuth providers:

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application type)
5. Add authorized redirect URIs:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - `greensai://auth/callback`
6. Copy the Client ID and Client Secret
7. Add them to your Supabase project in Authentication → Providers → Google

#### Apple Sign In Setup
1. Go to [Apple Developer Console](https://developer.apple.com)
2. Register your app and create a Service ID
3. Configure Sign In with Apple:
   - Add `greensai://auth/callback` as a return URL
   - Add `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback` as a return URL
4. Generate a key and download it
5. Add the key and Service ID to your Supabase project in Authentication → Providers → Apple

### 3. Testing the Authentication Flow

1. Email/Password Authentication:
   ```bash
   # Start the development server
   npx expo start
   ```
   - Test sign up with a new email
   - Verify email confirmation (if enabled)
   - Test login with credentials
   - Verify session persistence

2. Password Reset:
   - Request password reset
   - Check email for reset link
   - Set new password
   - Verify login with new password

3. Social Login:
   - Test Google Sign In
   - Test Apple Sign In
   - Verify redirect to dashboard
   - Check session persistence

### 4. Troubleshooting

- If social login fails, verify your OAuth configuration in both Supabase and the provider's console
- For deep linking issues, ensure your app's scheme is properly configured in `app.config.js`
- If session persistence isn't working, check AsyncStorage implementation
- For TypeScript errors, ensure all type definitions are properly imported

## Development

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

# 🌱 Plantify v1.0

## 🚀 Production-Ready Launch Instructions

### 🔐 Security & Auth
- Ensure your `.env` contains valid Supabase credentials:
  - `EXPO_PUBLIC_SUPABASE_URL=https://olgxhameijbqxjafrvxz.supabase.co`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ3hoYW1laWpicXhqYWZydnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzQzOTgsImV4cCI6MjA1NjQxMDM5OH0.ldF_a9ccd8odjpBtrACmo85RqMpJaoeXVLaVuBKVhkE`
- The Supabase client (`app/lib/supabase.ts`) is imported across all screens.
- Auth guards (`useProtectedRoute`) are used on all protected screens.
- Forgot password logic is implemented and verified with Supabase email.

### 🌱 Core Features
- Registration flow works with new account creation.
- Login with existing account is confirmed.
- Dashboard loads with dynamic data from Supabase or mock fallback.
- Logout clears session and redirects to onboarding/login.

### 🧭 Navigation
- Tab-based routing (expo-router) works end-to-end.
- Back navigation functions on web and device.
- Links between login ↔ register ↔ forgot password are functional.
- Dashboard quick actions route to the correct screens.

### 🌐 Internationalization
- Language toggle visually updates the onboarding screen.
- [Optional] i18n setup for translations using `react-i18next`.
- [Optional] RTL mirrored layout confirmation.

### 🧪 Manual Testing
- Test on web: `npx expo start` then press `w`.
- Test on Android device: press `a` or scan QR with Expo Go.
- Test on iOS simulator: press `i` or scan QR with Expo Go.
- [Optional] Use TestFlight/internal testing for iOS.
- [Optional] Use Play Console closed testing for Android.

---

## 📦 Build & Deployment

### 🛠 Build Commands (Expo EAS)
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

### 🔑 Apple + Google Accounts
- Apple Developer Account ready
- Google Play Console account set up
- App icons and splash screen uploaded
- App name and description finalized

---

## 🗃️ Environment Setup

1. **Create a `.env` file in your project root:**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://olgxhameijbqxjafrvxz.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ3hoYW1laWpicXhqYWZydnh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzQzOTgsImV4cCI6MjA1NjQxMDM5OH0.ldF_a9ccd8odjpBtrACmo85RqMpJaoeXVLaVuBKVhkE
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   APP_ENV=production
   ```