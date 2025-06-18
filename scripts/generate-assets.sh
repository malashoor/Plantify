#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

set -e

ICON_MASTER="assets/icons/app-icon/icon.png"
SPLASH_MASTER="assets/splash/splash.png"
LOTTIE_SRC="assets/splash/animation/greensai.json"

# Check for ImageMagick
if ! command -v convert &> /dev/null; then
  echo -e "${BLUE}ImageMagick not found. Please install it for automatic resizing.\n${NC}"
  exit 1
fi

echo -e "${BLUE}Generating GreensAI assets...${NC}\n"

# Create temporary directory for processing
TEMP_DIR="temp_assets"
mkdir -p $TEMP_DIR

# Generate iOS app icons
IOS_DIR="assets/icons/app-icon/ios"
echo -e "${GREEN}Generating iOS app icons...${NC}"
mkdir -p $IOS_DIR
convert $ICON_MASTER -resize 180x180 $IOS_DIR/icon@3x.png
convert $ICON_MASTER -resize 120x120 $IOS_DIR/icon@2x.png
convert $ICON_MASTER -resize 60x60 $IOS_DIR/icon.png

# Generate Android app icons
ANDROID_DIR="assets/icons/app-icon/android"
echo -e "${GREEN}Generating Android app icons...${NC}"
mkdir -p $ANDROID_DIR
convert $ICON_MASTER -resize 192x192 $ANDROID_DIR/ic_launcher-xxxhdpi.png
convert $ICON_MASTER -resize 144x144 $ANDROID_DIR/ic_launcher-xxhdpi.png
convert $ICON_MASTER -resize 96x96 $ANDROID_DIR/ic_launcher-xhdpi.png
convert $ICON_MASTER -resize 72x72 $ANDROID_DIR/ic_launcher-hdpi.png
convert $ICON_MASTER -resize 48x48 $ANDROID_DIR/ic_launcher-mdpi.png

# Generate splash screen
SPLASH_DIR="assets/splash/static"
echo -e "${GREEN}Generating splash screen...${NC}"
mkdir -p $SPLASH_DIR
convert $SPLASH_MASTER -resize 1242x2436 $SPLASH_DIR/splash.png

# Copy Lottie animation
LOTTIE_DIR="assets/splash/animation"
echo -e "${GREEN}Copying Lottie animation...${NC}"
mkdir -p $LOTTIE_DIR
cp $LOTTIE_SRC $LOTTIE_DIR/greensai.json

# Clean up
echo -e "${GREEN}Cleaning up...${NC}"
rm -rf $TEMP_DIR

echo -e "\n${BLUE}Asset generation complete!${NC}"
echo -e "${GREEN}Next steps:${NC}"
echo "1. Review the generated assets in assets/icons and assets/splash"
echo "2. Update app.config.js if needed"
echo "3. Test the assets in development build" 