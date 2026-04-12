# SOS-Wind Project Memory: The Source of Truth

This document is the **Primary Knowledge Base** for the SOS-Wind project. Every developer (human or AI) must read this file first to understand the project's architecture, design philosophy, and technical state.

## 🌟 App Vision & Philosophy
**SOS-Wind** is a premium, high-fidelity fashion and wardrobe management application. 
- **Core Aesthetic**: Minimalist, sleek, and high-performance. Avoid generic UI; prioritize "Apple-like" premium finish.
- **Goal**: 100% pixel-perfect conversion from Figma designs to production-ready React Native code.

---

## 🛠 Tech Stack & Infrastructure

### Core Frameworks
- **Platform**: Expo (SDK 54) with React Native 0.81.
- **Language**: Strict TypeScript.
- **Performance**: High-performance animations using `react-native-reanimated` and `react-native-worklets`.
- **Navigation**: React Navigation 7.x (Native Stack and Bottom Tabs).
- **Design System**: Vanilla CSS-in-JS (StyleSheet) with centralized themes.

### Key Dependencies
- `expo-blur`: Used for premium glassmorphism and depth effects.
- `expo-camera` & `expo-image-picker`: Core wardrobe digitization tools.
- `@expo/vector-icons`: Specifically `Ionicons` for a clean, consistent icon set.

---

## 🏗 Technical Architecture

### MVVM Pattern (Model-View-ViewModel)
- **Models** (`src/models/`): Typed data structures (User, Profile, Outfit).
- **ViewModels** (`src/viewmodels/`): Encapsulated business logic and UI state hooks (e.g., `useOTPViewModel.ts`).
- **State** (`src/store/`): React Context providers for global persistence (Auth, User, Outfit contexts).

### Navigation Flow
1. **AuthNavigator**: Controls the onboarding entry (`First`, `Welcome`, `SignIn`, `OTP`).
2. **MainTabNavigator**: Manages the core app experience (Home, Wardrobe, Stylist, Calendar, Search).
3. **RootNavigator**: Orchestrates the top-level transition based on `isOnboarded` state.

---

## 🎨 Design System Standards

#### [2026-04-11] - Dynamic Marquee Background Refinement
- **1:1 Aspect Ratio**: Standardized all mosaic images to square dimensions to prevent squeezing.
- **Velocity Adjustment**: Significantly reduced animation speed (80s+ durations) for enhanced subtleness.
- **Layout Calibration**: Updated `MarqueeRow` to handle uniform image scaling across all rows.

#### [2026-04-11] - Global Typography & OTP Refactor
The application has been **globalized** to use **Albert Sans** exclusively.
- **Source of Truth**: `src/theme/fonts.ts`.
- **Mapping**: `fontNames` and `kyivFontNames` both resolve to Albert Sans variants.
- **Rule**: Never use hardcoded font family strings. Always use `typography` styles or `fontNames` constants.

### UI Tokens & Constraints
- **Primary Buttons**: Black (`#0A0A0A`), Height: 58, Radius: 14.
- **Card Aesthetics**:
  - **Primary**: Pill-shaped (`borderRadius: 30`), Black (`#000000`) background, White text.
  - **Secondary**: Pill-shaped, White (`#FFFFFF`) background, Dark border (`#EAEAEA`), Black text.
  - **Camera Area**: Dynamically responsive layout (`flex: 1`, `height: '100%'`), `24px` radius, `marginHorizontal: 21`, enclosed with a subtle `1px` border (`rgba(0,0,0,0.1)`). Does not use a locked aspect ratio to maximize screen real estate.
  - **Camera Controls Bar**: Bottom layout uses a Light Grey Pill (`#EAEAEA`, `borderRadius: 50`) aligned compactly to the bottom.
  - **Camera Icons**: Exclusively uses custom PNG assets (`GalleryIcon.png`, `CaptureIcon.png`, `CameraIcon.png`) integrated via `<Image>` components instead of vector fonts.
- **Backgrounds**:
  - **OnboardingMosaic**:
  - **Marquee Effect**: Rows of images move in a slow-motion horizontal loop.
  - **Directions**: Row 1 (Left), Row 2 (Right), Row 3 (Left).
  - **Technology**: Built with `react-native-reanimated` using infinite linear animations (`withRepeat`).
  - **Standardized Size**: All images are **1:1 square** (`width * 0.45`).
  - **Slower Pace**: Durations increased to 80s-100s for a more subtle, premium feel.
  - **Seamless Looping**: Implementation uses mirrored content duplication to prevent gaps.
- **Input Fields**:
  - **Phone**: Dual-pill (Black/White).
  - **OTP**: 6 boxes, responsive `flex` scaling with `aspectRatio: 0.8`.
- **Keyboard Management & Layering**:
  - **Layered Architecture**: `OnboardingMosaic` is set to `zIndex: -1` and `pointerEvents="none"` to prevent touch interception. The interactive card is wrapped in a `KeyboardAvoidingView` + `ScrollView` (`zIndex: 1`) to ensure inputs are accessible.
  - **Hit-Testing**: Input bars in `PhoneInput` must have the `TextInput` fill the entire width (`flex: 1`) to ensure edge-to-edge clickability.
- **UX Patterns**:
  - **Form Validation**: Verification buttons remain enabled even if "Terms" are unchecked, allowing the fallback `Alert` logic to guide the user instead of "blocking" without feedback.

---

## 📝 Changelog & Achievement Log

#### [2026-04-12] - Profile Setup Architecture Overhaul
- **Layout Alignment**: Completely replaced the generic form layout in `ProfileSetupScreen` with the standard Onboarding `<OnboardingMosaic>` & `bottomCard` architecture.
- **Action Hierarchy**: Replicated exact UI buttons: "Live capture" (Primary Black), "Upload image" (Secondary White with outline), and "Skip for now" (underlined link), mirroring the `ProfileSetup.png` Figma asset exactly.

#### [2026-04-12] - Custom Media Assets & Fluid Views
- **Fluid Camera Architecture**: Shifted the fixed `399x536` layout to a dynamic `flex: 1` approach to maximize viewport usage consistently across devices while retaining exact lateral padding.
- **Icon Hotswap**: Entirely replaced legacy `<Ionicons>` vectors with bespoke `.png` `<Image>` icon instances (`GalleryIcon`, `CaptureIcon`, `CameraIcon`) native to the `assets/camera` path to securely mirror Figma assets.

#### [2026-04-12] - Exact Layout Adherence & Dimensions
- **Profile Camera Pixel-Match**: Strict integration of Figma screenshot proportions (`399x536` center preview, `21px` margins, `24px` radius). Reverted the `ProfilePictureScreen` UI back to the official "Grey Pill" (`#EAEAEA`) style for controls.

#### [2026-04-12] - Dev Environment Troubleshooting
- **Path Resolution Protocol**: Enforced strict validation of relative paths for local assets. A `500 Internal Server Error` Metro Bundler crash identified that `src/screens/onboarding/` files must traverse down exactly 3 levels (`../../../assets/camera/`) to successfully resolve image modules.
- **Component Resolution Mapping**: Encountered another isolated `500 Server Error` on `ProfileSetupScreen`. Remedied by correcting the internal component import path for `<OnboardingMosaic>` to `/components/layout/` instead of `/components/visuals/`. 
- **Deprecation Cleanups**:
  - **`tintColor`**: Migrated from `style` object to direct prop for `<Image />` components to resolve React Native core warnings.
  - **`pointerEvents`**: Migrated from property prop to `style` object property (`style={{ pointerEvents: 'none' }}`) for legacy views during refactoring.

#### [2026-04-12] - Onboarding UX & Rendering Refinement
- **Functional OTP Resend Timer**: Implemented a 30-second backward countdown timer in the OTP screen.
  - **Auto-start**: Initiates immediately on screen focus.
  - **Logic**: Prevents "Resend code" interaction until the timer reaches zero.
  - **Memory Safety**: Integrated `useRef` and `useEffect` cleanup to manage intervals across component lifecycles.
- **Profile Setup Hub Integration**: 
  - Created `ProfileSetupHubScreen.tsx` (Selection gateway for Camera/Upload/Skip).
  - **Figma-Exact Layout**: Title → Subtitle ("This information helps us deliver…") → Section label ("Upload your photo", centered) → White pill ("Live Capture", shadow-only, no border) → Black pill ("Upload Image") → "Skip for now" underlined link.
  - **Button Tokens**: Width `75%` (centered), height `54px`, `borderRadius: 16`. White button uses subtle shadow (`shadowOpacity: 0.08`, `elevation: 3`) instead of border. Black button uses standard dark shadow (`shadowOpacity: 0.12`, `elevation: 4`).
- **Restored "Profile setup 1.png" Design**:
  - Restored the detailed input form (Name, DOB, Weight, Height) in `ProfileSetupScreen.tsx`.
  - Integrated it with the camera capture flow; it successfully displays the captured photo URI in the profile preview circle.
- **Real-Device Rendering Optimizations**:
  - Resolved "Invisible Marquee" issue on real device renderers.
  - **Standardized Pattern**: Removed `zIndex: -1` from background layers. Set parent container backgrounds to `#F7F7F7` (matching mosaic background) or `transparent` to ensure the layer renders correctly behind content.
- **Path Resolution Protocol**: 
  - Enforced strict validation of relative paths for local assets. A `500 Internal Server Error` Metro Bundler crash identified that `src/screens/onboarding/` files must traverse down exactly 3 levels (`../../../assets/camera/`) to successfully resolve image modules.
- **Profile Setup Form Functionality**:
  - Rewrote `ProfileSetupScreen.tsx` to be fully interactive.
  - **Dropdown Pattern**: Implemented `DropdownModal` using a standard bottom-sheet pattern (sliding modal + `FlatList`).
  - **Ranges**: Height (100-300cm), Weight (30-200kg), Day (1-31), Month (Jan-Dec), Year (1949-2024).
  - **TextInput Sanitation**: Explicitly removed default borders/outlines on `TextInput` (`outlineStyle: 'none'`, `underlineColorAndroid: 'transparent'`) to maintain the clean pill look even under focus.
  - **Shadow UI Alignment**: Maintained "top shadows" (`shadowOffset: { height: -2 }`) on all input pills and dropdown triggers.
  - **Next Button Geometry**: Updated `borderRadius` to `15` for the "Next" button on the `ProfileSetupScreen` as per latest brand adjustment.
- **Camera Focus Management**: 
  - Integrated `useIsFocused` from `@react-navigation/native` to ensure the camera hardware is gracefully released when the user navigates away. 
  - **Rule**: Always wrap `CameraView` with an `isFocused` check to prevent background battery/resource drain.
- **Full Body Photo Sub-Flow (Profile Setup 1.1 → 1.2 → 2.0)**:
  - **Corrected Navigation Chain**: `ProfileSetup` → (Next) → `FullBodyPhoto` (1.1) → (Live Capture) → `FullBodyCamera` → (capture) → `FullBodyPhotoPreview` (1.2) → (Look's Good) → `BodyMeasurements` (2.0) → (Continue) → `StylePreferences`.
  - **Data Flow**: Name, height, weight, dob, profileImage, fullBodyImage, and bodyshape are accumulated and forwarded through the navigation chain.
  - **FullBodyPhotoScreen (1.1)**: Blurred profile image background + bottom white card. Buttons for Live Capture (white, shadow-only) and Upload Image (black).
  - **FullBodyCameraScreen**: Exact clone of `ProfilePictureScreen` with heading "Full body photo".
  - **FullBodyPhotoPreviewScreen (1.2)**: 3-segment progress indicator (1st active). Tall portrait photo preview with dynamic dimensions calculated via `useWindowDimensions` (width - 40, 10% height reduction from Figma ratio).
  - **BodyMeasurementsScreen (2.0)**: 3-segment progress indicator (2nd active/black). 2-column grid selection cards using **official silhouettes**. Selection is handled professionally via **elevation and subtle background tint** instead of a black border. Each card, the custom input bar, and the **Square Back Button** all feature a **top-oriented shadow** (`shadowOffset: { height: -4 }`) for a consistent depth aesthetic. Footer contains a Square Back Button + Black Continue button (borderRadius: 15, width: flex-1).
  - **SkinTonePreferences (Upcoming)**: 3-segment progress indicator (3rd active).

### 📐 Complete Navigation Flow
```
First → Welcome → SignIn → OTP → ProfileSetupHub → ProfilePicture (Camera)
  → ProfileSetup (Form: Name, Height, Weight, DOB)
  → FullBodyPhoto (1.1 — Blurred card overlay)
  → FullBodyCamera (Same as ProfilePicture, heading: "Full body photo")
  → FullBodyPhotoPreview (1.2 — Preview + "Look's Good")
  → BodyMeasurements (2.0 — Bodyshape selection + Custom input)
  → StylePreferences → BodyMeasurements (Final Stats/Summary)
```

---

## 🤖 Instructions for AI Assistants (Windsurf, Cursor, Claude)

### 🧱 CORE PRINCIPLE & RULES
You are a senior software architect. You **MUST** adhere to these rules without exception:
1.  **MVVM Architecture**: UI layer (Screens) → Logic layer (ViewModels) → Data layer (Models/Services). **NO** business logic in UI files.
2.  **Strict Repository Pattern**: Direct API calls from components are forbidden. Use Services for external connectivity.
3.  **No Placeholders**: Use `generate_image` for realistic demos. Never keep dummy text like "Lorem Ipsum".
4.  **Pixel-Perfect Figma Adherence**: If a Figma PNG exists in `SOS-FigmaDesigns/`, the code **MUST** match it exactly in dimensions, colors, and shadows.
5.  **Dynamic Responsiveness**: No hardcoded widths/heights unless absolute constants (like icons). Use percentages or flex for layout containers.
6.  **Centralised Constants**: Use `src/theme/` and `src/constants/`. **NO** magic strings.

### 🏗️ Technical Context & Gotchas
1.  **Background Layering**: When using `<OnboardingMosaic />`, **NEVER** use `zIndex: -1` on the parent view if the top-level container has a background color. This hides the mosaic on real devices.
2.  **Image Tinting**: Use the `tintColor` prop directly on the `<Image />` component, **NOT** within the `style` object.
3.  **Input Border Removal**: To achieve the clean pill design, always set `borderWidth: 0` and `outlineStyle: 'none'` (for web) on `TextInput` to prevent default focus rectangles.
4.  **Path Resolution**: `src/screens/onboarding/` files must traverse down exactly 3 levels (`../../../assets/`) to resolve local image modules.
5.  **Typography**: Use **Albert Sans** exclusively via `src/theme/fonts.ts`. Never hardcode `fontFamily`.
6.  **Camera Management**: Always wrap `CameraView` with `isFocused` check (`useIsFocused` from `@react-navigation/native`) to prevent background battery drain.
7.  **Button Design Tokens**: White pill = shadow-only, no border, `borderRadius: 15`. Black pill = `#0A0A0A`, `borderRadius: 15`. Width: `75%` unless full-width is required in a row.
6.  **Camera Management**: Always wrap `CameraView` with `isFocused` check (`useIsFocused` from `@react-navigation/native`) to prevent background battery drain.
7.  **Button Design Tokens**: White pill = shadow-only, no border, `borderRadius: 15`. Black pill = `#0A0A0A`, `borderRadius: 15`. Width: `75%` unless full-width is required.

### 📐 Complete Navigation Flow
```
First → Welcome → SignIn → OTP → ProfileSetupHub → ProfilePicture (Camera)
  → ProfileSetup (Form: Name, Height, Weight, DOB)
  → FullBodyPhoto (1.1 — Blurred card overlay)
  → FullBodyCamera (Same as ProfilePicture, heading: "Full body photo")
  → FullBodyPhotoPreview (1.2 — Preview + "Look's Good")
  → StylePreferences → BodyMeasurements
```

---
*Last Updated: 2026-04-12 18:30:00*
