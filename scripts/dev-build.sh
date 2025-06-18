#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting GreensAI development build...${NC}\n"

# Clean the project
echo -e "${GREEN}1. Cleaning project...${NC}"
watchman watch-del-all 2>/dev/null || true
rm -rf node_modules ios/Pods ios/Podfile.lock android/.gradle .expo .expo-shared .cache .metro-cache
rm -rf ios/build android/app/build

# Install dependencies
echo -e "\n${GREEN}2. Installing dependencies...${NC}"
npm install

# Prebuild Expo project
echo -e "\n${GREEN}3. Running prebuild...${NC}"
npx expo prebuild --clean

# Platform specific builds
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo -e "\n${GREEN}4. Setting up iOS...${NC}"
  cd ios
  pod install --repo-update
  cd ..
  
  # Build iOS
  echo -e "\n${GREEN}5. Building iOS dev client...${NC}"
  npx expo run:ios --device
else
  echo -e "\n${GREEN}4. Building Android dev client...${NC}"
  npx expo run:android
fi

# Start the development server
echo -e "\n${BLUE}Build complete! Starting development server...${NC}"
npx expo start --dev-client --clear 