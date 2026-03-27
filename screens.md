Here is your **Master Prompt** — engineered to produce a 99.9% Apple Liquid Glass faithful implementation of SOS in Expo.

***

# 🧠 MASTER PROMPT — SOS: Style On Spot
## Apple Liquid Glass Design · Expo · TypeScript · MVVM · Frontend Only

***

````
You are an expert React Native / Expo engineer and Apple-level UI designer.
Your task is to build the complete "SOS – Style On Spot" fashion app from scratch.
Follow every instruction below with zero deviation. This is a FRONTEND-ONLY app.
No backend. No API calls. All data is mocked locally.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🍎 DESIGN SYSTEM — APPLE LIQUID GLASS (STRICT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the MOST important section. Every single UI element must follow
Apple's iOS 26 Liquid Glass aesthetic. No flat design. No Material UI.
No generic card styles. Pure Apple Liquid Glass only.

### What is Apple Liquid Glass?
Apple Liquid Glass is the design language introduced in iOS 26 where:
- UI surfaces appear as frosted, translucent glass floating over content
- Elements have real-time blur of the content behind them (BlurView)
- Glass has a subtle white specular highlight on top edge (like light hitting glass)
- Glass has a very soft inner shadow at the bottom edge
- Borders are ultra-thin (0.5–1px) white at ~25–35% opacity
- Glass layers stack with increasing opacity (light → medium → heavy)
- Everything floats — no hard backgrounds, no opaque surfaces (except bottom sheets)
- Buttons look like frosted pill-shaped glass, not flat rectangles
- Inputs are inset glass wells with inner shadow
- Background is always visible THROUGH every element
- Colors: deep purple-to-blue gradients (#0A0015 → #1A0533 → #0D1B4B)
- Accent: Electric purple #BF5AF2, iOS blue #0A84FF, coral #FF375F
- Typography: SF Pro Display (use System font with fontWeight variations)
- Animations: Spring physics (not linear/ease), mass=1, damping=15, stiffness=150

### Glass Utility Component (BUILD THIS FIRST — used everywhere)
```typescript
// src/components/ui/GlassView.tsx
import { BlurView } from 'expo-blur';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GlassIntensity = 'ultraThin' | 'thin' | 'regular' | 'thick' | 'chromatic';

interface GlassViewProps {
  intensity?: GlassIntensity;
  children: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
  hasSpecularHighlight?: boolean;  // top white sheen
  hasBorder?: boolean;
}

const intensityMap = {
  ultraThin: { blur: 10, bg: 'rgba(255,255,255,0.05)' },
  thin:      { blur: 20, bg: 'rgba(255,255,255,0.10)' },
  regular:   { blur: 30, bg: 'rgba(255,255,255,0.15)' },
  thick:     { blur: 50, bg: 'rgba(255,255,255,0.22)' },
  chromatic: { blur: 80, bg: 'rgba(255,255,255,0.30)' },
};

export const GlassView = ({
  intensity = 'regular',
  children,
  style,
  borderRadius = 20,
  hasSpecularHighlight = true,
  hasBorder = true,
}: GlassViewProps) => {
  const config = intensityMap[intensity];
  return (
    <View style={[{ borderRadius, overflow: 'hidden' }, style]}>
      <BlurView intensity={config.blur} tint="dark" style={StyleSheet.absoluteFill} />
      {/* Base glass tint */}
      <View style={[StyleSheet.absoluteFill, {
        backgroundColor: config.bg,
        borderRadius,
      }]} />
      {/* Specular highlight — top edge white sheen */}
      {hasSpecularHighlight && (
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
          style={[StyleSheet.absoluteFill, { borderRadius, height: '40%' }]}
        />
      )}
      {/* Border */}
      {hasBorder && (
        <View style={[StyleSheet.absoluteFill, {
          borderRadius,
          borderWidth: 0.5,
          borderColor: 'rgba(255,255,255,0.30)',
        }]} />
      )}
      {/* Content */}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};
````

### Glass Button (MANDATORY — used for ALL buttons except primary CTA)
```typescript
// src/components/ui/GlassButton.tsx
// Pill-shaped frosted glass button with spring press animation
// On press: scale down to 0.95 with spring, opacity to 0.85
// Variants: 'glass' | 'solid' | 'ghost'
// 'solid' = black fill (used for primary CTA like "Get Started", "Login", "Verify", "Next")
// 'glass' = GlassView pill
// 'ghost' = no fill, just border
```

### Glass Input Field (MANDATORY)
```typescript
// src/components/ui/GlassInput.tsx
// Inset glass well — darker than surrounding glass
// backgroundColor: rgba(0,0,0,0.25)
// Inner shadow: subtle dark at top
// Border: rgba(255,255,255,0.15) 0.5px
// Focus state: border becomes rgba(191,90,242,0.8) — purple glow
// Placeholder color: rgba(255,255,255,0.35)
// Text color: #FFFFFF
// borderRadius: 14
```

### Glass Bottom Sheet (MANDATORY)
```typescript
// src/components/ui/GlassBottomSheet.tsx
// This is the modal overlay seen in Splash, SignIn, OTP screens
// NOT pure white — use frosted glass white:
// backgroundColor: rgba(255,255,255,0.88)
// BlurView intensity: 80, tint: 'light'
// Top corners radius: 32
// Top drag indicator: small gray pill (4px × 36px)
// Shadow: large soft shadow below (elevation 40)
// For dark screens: use dark glass variant
//   backgroundColor: rgba(15,0,30,0.85), tint: 'dark'
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 🎨 THEME CONSTANTS (Create these files first)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```typescript
// src/theme/colors.ts
export const colors = {
  // Backgrounds
  bg: {
    deepPurple: '#0A0015',
    gradient: ['#1A0533', '#0D1B4B', '#000D2E'] as const,
  },
  // Glass layers
  glass: {
    ultraThin: 'rgba(255,255,255,0.05)',
    thin:      'rgba(255,255,255,0.10)',
    regular:   'rgba(255,255,255,0.15)',
    thick:     'rgba(255,255,255,0.22)',
    border:    'rgba(255,255,255,0.28)',
    specular:  'rgba(255,255,255,0.18)',
    inset:     'rgba(0,0,0,0.25)',         // for inputs
  },
  // Accents
  accent: {
    purple:   '#BF5AF2',
    purpleSoft:'rgba(191,90,242,0.6)',
    blue:     '#0A84FF',
    coral:    '#FF375F',
    green:    '#32D74B',
    gold:     '#FFD60A',
  },
  // Text
  text: {
    primary:   '#FFFFFF',
    secondary: 'rgba(255,255,255,0.72)',
    tertiary:  'rgba(255,255,255,0.45)',
    inverse:   '#000000',
    onLight:   '#1C1C1E',
  },
  // Semantic
  solid: {
    black: '#000000',
    white: '#FFFFFF',
  },
};

// src/theme/typography.ts
export const typography = {
  largeTitle:  { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  title1:      { fontSize: 28, fontWeight: '700', letterSpacing: 0.36 },
  title2:      { fontSize: 22, fontWeight: '700', letterSpacing: 0.35 },
  title3:      { fontSize: 20, fontWeight: '600', letterSpacing: 0.38 },
  headline:    { fontSize: 17, fontWeight: '600', letterSpacing: -0.41 },
  body:        { fontSize: 17, fontWeight: '400', letterSpacing: -0.41 },
  callout:     { fontSize: 16, fontWeight: '400', letterSpacing: -0.32 },
  subheadline: { fontSize: 15, fontWeight: '400', letterSpacing: -0.24 },
  footnote:    { fontSize: 13, fontWeight: '400', letterSpacing: -0.08 },
  caption1:    { fontSize: 12, fontWeight: '400', letterSpacing: 0 },
  caption2:    { fontSize: 11, fontWeight: '400', letterSpacing: 0.07 },
};

// src/theme/glass.ts
export const glassPresets = {
  card: {
    blurIntensity: 30,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 0.5,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  pill: {
    blurIntensity: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.35)',
    borderWidth: 0.5,
    borderRadius: 100,
  },
  bottomSheet: {
    blurIntensity: 80,
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
};
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📂 PROJECT STRUCTURE (Scaffold exactly this)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
src/
├── models/
│   ├── User.model.ts
│   ├── Outfit.model.ts
│   └── Profile.model.ts
├── data/
│   ├── outfits.mock.ts       ← 20+ mock outfits with real Unsplash URLs
│   └── categories.mock.ts
├── store/
│   ├── AuthContext.tsx        ← isAuthenticated, isOnboarded
│   ├── UserContext.tsx        ← user profile state
│   └── OutfitContext.tsx      ← outfits, saved list
├── viewmodels/
│   ├── useAuthViewModel.ts
│   ├── useOTPViewModel.ts
│   ├── useProfileSetupViewModel.ts
│   ├── useHomeViewModel.ts
│   └── useSearchViewModel.ts
├── screens/
│   ├── auth/
│   │   ├── SplashScreen.tsx
│   │   ├── SignInScreen.tsx
│   │   └── OTPScreen.tsx
│   ├── onboarding/
│   │   ├── ProfilePictureScreen.tsx
│   │   └── ProfileSetupScreen.tsx
│   ├── home/
│   │   ├── HomeScreen.tsx
│   │   └── OutfitDetailScreen.tsx
│   ├── search/
│   │   └── SearchScreen.tsx
│   └── profile/
│       └── ProfileScreen.tsx
├── components/
│   ├── ui/
│   │   ├── GlassView.tsx        ← CORE — build first
│   │   ├── GlassButton.tsx
│   │   ├── GlassInput.tsx
│   │   ├── GlassBottomSheet.tsx
│   │   ├── GlassCard.tsx
│   │   └── GlassBadge.tsx
│   ├── typography/
│   │   ├── Heading.tsx
│   │   ├── BodyText.tsx
│   │   └── Caption.tsx
│   ├── icons/
│   │   ├── Icon.tsx
│   │   └── ActionIcon.tsx
│   ├── inputs/
│   │   ├── OTPInput.tsx
│   │   ├── PhoneInput.tsx
│   │   └── SearchInput.tsx
│   └── layout/
│       ├── MosaicBackground.tsx
│       ├── GradientBackground.tsx
│       └── SafeContainer.tsx
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── ProfileSetupNavigator.tsx
└── theme/
    ├── colors.ts
    ├── typography.ts
    ├── spacing.ts
    └── glass.ts
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 📱 SCREEN-BY-SCREEN IMPLEMENTATION GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### SCREEN 1: SplashScreen
```
Layout:
- Full screen: MosaicBackground (fashion image grid)
  → Images arranged in 2-column masonry grid, slightly animated (slow parallax scroll upward, infinite, speed: 0.3)
  → Each image: borderRadius 16, small gap between
  → Overlay: LinearGradient from transparent at top to rgba(0,0,0,0.6) at 60% down

- Bottom: GlassBottomSheet (light variant, height ~340px)
  → Drag indicator pill at top center
  → SOS logo: fontSize 52, fontWeight 800, letterSpacing -2, color #000
  → "Style On Spot": caption below logo, color #666
  → Divider: thin line rgba(0,0,0,0.1)
  → Tagline: "Where Elegance Meets Everyday Dressing." body text, #333, textAlign center
  → Spacing: 24px
  → "Get Started" button: solid black, borderRadius 16, height 56, full width
  → "Already have an account? Login" — footnote, center, #666, "Login" bold #000
```

### SCREEN 2: SignInScreen
```
Layout:
- SAME MosaicBackground (reuse component)
- Bottom GlassBottomSheet (light, height ~380px):
  → "Sign in" — title1, bold, #000
  → "Enter Your Phone Number" — subheadline, #666
  → PhoneInput component:
    - Left: GlassView pill showing "+91 ▾" (country code selector)
    - Right: GlassInput for phone number
    - Masked display: show first 2 digits + XX XX + last 2 digits while typing
  → "Login" button: solid black, full width, borderRadius 16, height 56
  → Terms row: checkbox (filled black when checked) + footnote text with hyperlink styling on "Terms & Conditions" and "Privacy Policy"
  → Validation: disable button + red border on input if phone < 10 digits
```

### SCREEN 3: OTPScreen
```
Layout:
- SAME MosaicBackground
- Bottom GlassBottomSheet (light, height ~360px):
  → "OTP" — title1, bold, #000
  → "Please enter the 6-digit code" — subheadline, #666
  → OTP Input Row:
    - 6 individual boxes, evenly spaced
    - Each box: width 46px, height 56px, borderRadius 14
    - Empty state: GlassInput style (inset), shows placeholder "–"
    - Filled state: borderColor purple accent rgba(191,90,242,0.8), white text on dark bg
    - Active box: pulsing purple border glow (Animated loop, opacity 0.5→1.0)
    - Auto-focus next on input, auto-submit on 6th digit
  → "Verify" button: solid black, full width, height 56, borderRadius 16
  → Terms row (same as SignIn)
  → Resend OTP link: footnote, gray, with 30s countdown timer
  → Mock: any 6-digit code navigates forward
```

### SCREEN 4: ProfilePictureScreen
```
Layout:
- Clean white/light background (NOT glass background)
- Top: back arrow (ActionIcon) + "Profile picture" title (centered)
- Subtitle: "Capture your profile image on a plain background"
- Camera Viewfinder:
  → Large rounded rectangle (borderRadius 24)
  → Black background (camera preview placeholder)
  → 3×3 rule-of-thirds grid overlay (thin white lines, opacity 0.3)
  → Animated subtle vignette overlay at edges
- Bottom bar (3 items, glass pill container):
  → Left: Gallery icon (ActionIcon) — opens ImagePicker
  → Center: Capture button — large white circle (72px), with glass ring around it
  → Right: Flip camera icon (ActionIcon)
- On photo captured: show preview with "Use Photo" / "Retake" options
```

### SCREEN 5: ProfileSetupScreen (Multi-step)
```
Layout:
- White background
- Progress Bar: 4 pills at top (filled = black, unfilled = rgba(0,0,0,0.15))
- "Profile setup" — title1, bold, #000
- Subtitle: "This information helps us deliver a better, more personalized experience for you."

STEP 1 — Basic Info:
  → Profile photo preview: 120×120px circle, borderRadius 60
    - If captured: shows photo with edit icon overlay (glass pill)
    - If not: shows placeholder avatar with camera icon
  → Name input: GlassInput (light variant, dark border) label "Your name:"
  → Height + Weight: side-by-side dropdowns (custom GlassDropdown component)
  → Date of Birth: 3 dropdowns side-by-side (Day | Month | Year)
  → "Next" button: solid black, full width, borderRadius 16

STEP 2 — Style Preferences:
  → Grid of style tags: Casual, Formal, Boho, Streetwear, Minimalist, Ethnic, Party, Sporty
  → Each tag: GlassView pill, on select: filled with purple gradient
  → Multi-select allowed (min 1)

STEP 3 — Color Palette:
  → Grid of color circles (12 colors)
  → On select: white checkmark overlay + scale 1.15 spring animation
  → Multi-select

STEP 4 — Budget Range:
  → Custom GlassSlider: single thumb, purple track
  → Labels: "₹500" to "₹10,000+"
  → Selected range displayed as GlassBadge above thumb
  → "Complete Setup" button: solid black
```

### SCREEN 6: HomeScreen
```
Layout:
- Background: LinearGradient (#1A0533 → #0D1B4B → #000D2E), full screen
- Top bar (glass pill):
  → Left: "SOS" logo small + greeting "Hi, [Name] 👋"
  → Right: notification bell ActionIcon (glass)
- Featured Section:
  → Horizontal ScrollView
  → Large cards (width: 280px, height: 380px)
  → Each card: GlassView, outfit image fills card, gradient overlay at bottom
  → Bottom of card: outfit title + category tag (GlassBadge pill)
  → Heart icon: ActionIcon top-right, glass bg, fills red on save
  → Animated entrance: slide up + fade in staggered per card
- Section Header: "Trending Now" with "See all" link
- Masonry Grid (2 columns):
  → Alternating card heights (220px / 280px)
  → Each: GlassCard with outfit image, category badge, save icon
- Bottom Tab Bar: GlassView pill floating above safe area
  → 3 tabs: Home (house), Search (magnifier), Profile (person)
  → Active: white icon + purple underline dot
  → Inactive: rgba(255,255,255,0.45)
  → Tab bar background: GlassView thick, borderRadius 32
```

### SCREEN 7: OutfitDetailScreen (Modal)
```
Presentation: slides up from bottom (modal stack)
Layout:
- Full screen outfit image (hero)
- Back button: GlassView pill (glass, top-left, safe area)
- Bottom sheet attached to image:
  → GlassView (thick, dark), borderRadius 32, padding 24
  → Outfit title (title2, white)
  → Tags row: GlassBadge pills (style, color, occasion)
  → Save button: full width, glass variant with heart icon + "Save Outfit"
  → Share button: ghost variant
```

### SCREEN 8: SearchScreen
```
Layout:
- Same gradient background as Home
- SearchInput (glass): large, top of screen, with magnifier icon
- Category filter pills: horizontal scroll, GlassView pills
- Results: same masonry grid as Home
- Empty state: centered glass card with search illustration + "No styles found"
```

### SCREEN 9: ProfileScreen
```
Layout:
- Gradient background (same as Home)
- Top: circular profile photo (120px) + name (title2, white) + style tags
- Stats row: 3 GlassView cards (Saved outfits | Styles | Following)
- Settings list: GlassCard with rows
  → Edit Profile, Notifications, Privacy, Help, Logout
  → Each row: label + chevron icon, separated by thin divider