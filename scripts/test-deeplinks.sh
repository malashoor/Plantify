#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing Deep Links for GreensAI...${NC}\n"

# Test iOS deep links
echo -e "${GREEN}Testing iOS Deep Links:${NC}"
echo "Testing dashboard..."
npx uri-scheme open greensai://dashboard --ios
sleep 2

echo "Testing profile..."
npx uri-scheme open greensai://profile --ios
sleep 2

echo "Testing settings..."
npx uri-scheme open greensai://settings --ios
sleep 2

# Test Android deep links
echo -e "\n${GREEN}Testing Android Deep Links:${NC}"
echo "Testing dashboard..."
npx uri-scheme open greensai://dashboard --android
sleep 2

echo "Testing profile..."
npx uri-scheme open greensai://profile --android
sleep 2

echo "Testing settings..."
npx uri-scheme open greensai://settings --android

echo -e "\n${BLUE}Deep link testing complete!${NC}" 