# GreensAI Branding Guide

## Brand Identity

### Core Concept
GreensAI combines artificial intelligence with plant care expertise, creating a unique fusion of technology and nature.

### Brand Colors
- Primary: #45B36B (Eco Green)
- Secondary: #2D3047 (Deep Navy)
- Accent: #00D4FF (Tech Blue)
- Background: #F8F9FA (Light Gray)
- Dark Mode: #121212 (Dark Background)

### Typography
- Primary Font: Poppins
- Secondary Font: Inter
- Monospace: JetBrains Mono (for AI/tech elements)

## App Icon Design

### Concept
A minimalist leaf shape with a neural network pattern overlay, creating a fusion of organic and technological elements.

### Specifications
- iOS: 1024x1024px
- Android: 512x512px
- Adaptive Icon: 432x432px (with padding)
- Format: PNG with transparency

### Design Elements
1. Base: Stylized leaf shape in #45B36B
2. Overlay: Neural network pattern in #00D4FF
3. Glow: Subtle gradient from #45B36B to #00D4FF
4. Background: Gradient from #2D3047 to #121212

## Splash Screen

### Design
- Animated leaf that transforms into a neural network
- GreensAI logo with tech-inspired typography
- Subtle particle effects in brand colors

### Animation Sequence
1. Leaf appears (0.5s)
2. Neural network overlay fades in (0.3s)
3. Logo appears with glow effect (0.4s)
4. Particles animate (continuous)

## UI Elements

### Buttons
- Primary: Rounded rectangle with gradient
- Secondary: Outlined with tech pattern
- Icon: Circular with neural network background

### Cards
- Subtle neural network pattern in background
- Rounded corners with tech-inspired shadows
- Gradient borders in brand colors

### Typography Hierarchy
1. Headings: Poppins Bold
2. Body: Inter Regular
3. Tech Elements: JetBrains Mono
4. Numbers/Stats: Poppins Medium

## Marketing Materials

### App Store Screenshots
1. Hero: "AI-Powered Plant Care"
2. Feature 1: "Instant Plant Identification"
3. Feature 2: "Smart Care Recommendations"
4. Feature 3: "Health Monitoring"
5. Feature 4: "Expert Tips & Community"

### Social Media
- Profile Picture: App icon
- Cover Photo: Tech-nature fusion illustration
- Post Templates: Neural network grid with brand colors

## Implementation Guidelines

### Icons
- Use SF Symbols (iOS) and Material Icons (Android)
- Custom icons should follow the tech-nature fusion style
- Maintain consistent stroke width

### Animations
- Smooth transitions (0.3s duration)
- Tech-inspired loading animations
- Particle effects for important actions

### Accessibility
- Maintain 4.5:1 contrast ratio
- Support dynamic type
- Include dark mode variants

## File Structure
```
assets/
├── icons/
│   ├── app-icon/
│   │   ├── ios/
│   │   └── android/
│   └── ui/
├── splash/
│   ├── animation/
│   └── static/
└── marketing/
    ├── app-store/
    └── social/
```

## Usage Examples

### App Icon
```jsx
<Image
  source={require('../assets/icons/app-icon/ios/icon.png')}
  style={styles.icon}
/>
```

### Splash Screen
```jsx
<View style={styles.splash}>
  <AnimatedLeaf />
  <NeuralNetworkOverlay />
  <Logo />
  <ParticleEffect />
</View>
```

## Resources

### Design Files
- Figma: [GreensAI Design System]
- Icons: [Icon Set]
- Animations: [Lottie Files]

### Development
- React Native Components
- Animation Libraries
- Icon Sets

## Contact

For branding inquiries:
- Email: brand@greensai.app
- Design Lead: [Name]
- Developer: [Name] 