#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting GreensAI rebuild process...${NC}\n"

# Clean the project
echo -e "${GREEN}Cleaning project...${NC}"
rm -rf ios android
rm -rf .expo
npm run clean

# Install dependencies
echo -e "\n${GREEN}Installing dependencies...${NC}"
npm install

# Prebuild
echo -e "\n${GREEN}Running prebuild...${NC}"
npx expo prebuild --clean

# Build iOS
echo -e "\n${GREEN}Building iOS...${NC}"
eas build --platform ios --profile production

# Build Android
echo -e "\n${GREEN}Building Android...${NC}"
eas build --platform android --profile production

echo -e "\n${BLUE}Rebuild process complete!${NC}"
echo -e "${GREEN}Next steps:${NC}"
echo "1. Submit builds to App Store and Play Store"
echo "2. Update store listings with new GreensAI branding"
echo "3. Test the production builds thoroughly" 