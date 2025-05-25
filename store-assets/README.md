# Plantify Store Assets Generator

This directory contains tools and assets for generating App Store and Play Store listings for Plantify.

## Directory Structure

```
store-assets/
├── screenshots/
│   ├── ios/        # iOS screenshots (1242x2688)
│   └── android/    # Android screenshots (1080x1920)
├── app-metadata.json
├── app-store-description.txt
├── short-description.txt
├── keywords.txt
├── app-name.txt
├── store-submission-checklist.md
├── mockup-generator.tsx
├── generate-screenshots.ts
├── package.json
└── tsconfig.json
```

## Screenshots

The generator creates screenshots for the following screens:

1. Home Screen (Welcome + Plant Overview)
2. Growth Timeline
3. Health Analysis
4. Journal Entry
5. Reminders Dashboard
6. Admin Analytics (Pro feature)

## Requirements

- Node.js 16+
- npm or yarn
- TypeScript

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate screenshots:
   ```bash
   npm run generate
   ```

## Customization

### Themes

The mockup generator supports both light and dark themes. You can toggle between them using the theme button in the UI.

### Device Frames

The generator includes device frames for:
- iPhone X+ (iOS)
- Pixel 6 (Android)

### Localization

To add localized text to screenshots:
1. Edit the screen components in `mockup-generator.tsx`
2. Update the text content
3. Regenerate the screenshots

## Store Submission

Before submitting to the stores:

1. Review all generated assets
2. Check the submission checklist
3. Verify metadata in `app-metadata.json`
4. Test screenshots on different devices
5. Ensure all text is readable
6. Verify dark/light mode appearance

## Notes

- Screenshots are generated at the highest quality
- All UI elements are properly scaled
- Accessibility features are visible
- Dark mode support is included
- Device frames are optional 