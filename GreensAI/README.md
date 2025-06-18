# 🌱 GreensAI

A comprehensive plant care and hydroponics management application with integrated in-app purchases.

## 🏗 Project Structure

```
GreensAI/
├── backend/           # IAP Validation Server
│   ├── api/          # API endpoints
│   └── services/     # Business logic
└── mobile/           # React Native mobile app
```

## 🚀 Backend Services

The backend provides:
- In-App Purchase validation for iOS and Android
- Secure receipt verification
- Purchase history tracking
- Analytics integration

### 🔑 Environment Setup

Required environment variables for the backend:

```bash
# Vercel Deployment
VERCEL_TOKEN=           # Vercel API token
VERCEL_ORG_ID=         # Vercel organization ID
VERCEL_PROJECT_ID=     # Vercel project ID

# Supabase
SUPABASE_URL=          # Supabase project URL
SUPABASE_ANON_KEY=     # Supabase anonymous key

# Analytics
MIXPANEL_TOKEN=        # Mixpanel project token

# Apple IAP
APPLE_SHARED_SECRET=   # App Store Connect shared secret

# Google Play
GOOGLE_CLIENT_EMAIL=   # Google Cloud service account email
GOOGLE_PRIVATE_KEY=    # Google Cloud service account private key
```

### 📦 Deployment

The backend is automatically deployed to Vercel through GitHub Actions when changes are pushed to `main`.

#### Manual Deployment

```bash
cd backend
npm install
vercel --prod
```

### 🧪 Testing

Test the API endpoints using the provided Postman collection in `backend/tests/GreensAI.postman_collection.json`

Example API call:

```bash
# iOS Receipt Validation
curl -X POST https://greensai.vercel.app/api/validate-receipt \
  -H "Content-Type: application/json" \
  -d '{
    "receipt": "base64_receipt_data",
    "platform": "ios"
  }'
```

## 📱 Mobile App Integration

The mobile app connects to the backend for purchase validation:

```typescript
const VALIDATION_SERVER_URL = 'https://greensai.vercel.app';

// Validate purchase
const validateReceipt = async (receipt: string, platform: 'ios' | 'android') => {
  const response = await fetch(`${VALIDATION_SERVER_URL}/api/validate-receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receipt, platform }),
  });
  return response.json();
};
```

## 🔒 Security

- All sensitive data is stored in GitHub Secrets and Vercel Environment Variables
- HTTPS-only endpoints
- Rate limiting implemented
- Request validation and sanitization

## 📊 Monitoring

- Deployment status: [Vercel Dashboard](https://vercel.com/dashboard)
- Logs: Available in Supabase and Vercel
- Analytics: Mixpanel integration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 