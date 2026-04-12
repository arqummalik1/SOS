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

#### [2026-04-12] - Custom Media Assets & Fluid Views
- **Fluid Camera Architecture**: Shifted the fixed `399x536` layout to a dynamic `flex: 1` approach to maximize viewport usage consistently across devices while retaining exact lateral padding.
- **Icon Hotswap**: Entirely replaced legacy `<Ionicons>` vectors with bespoke `.png` `<Image>` icon instances (`GalleryIcon`, `CaptureIcon`, `CameraIcon`) native to the `assets/camera` path to securely mirror Figma assets.

#### [2026-04-12] - Exact Layout Adherence & Dimensions
- **Profile Camera Pixel-Match**: Strict integration of Figma screenshot proportions (`399x536` center preview, `21px` margins, `24px` radius). Reverted the `ProfilePictureScreen` UI back to the official "Grey Pill" (`#EAEAEA`) style for controls.

#### [2026-04-12] - Dev Environment Troubleshooting
- **Path Resolution Protocol**: Enforced strict validation of relative paths for local assets. A `500 Internal Server Error` Metro Bundler crash identified that `src/screens/onboarding/` files must traverse down exactly 3 levels (`../../../assets/camera/`) to successfully resolve image modules.
- **Deprecation Cleanups**:
  - **`tintColor`**: Migrated from `style` object to direct prop for `<Image />` components to resolve React Native core warnings.
  - **`pointerEvents`**: Migrated from property prop to `style` object property (`style={{ pointerEvents: 'none' }}`) for legacy views during refactoring.
  - **Missing Imports**: Resolved `ReferenceError` for `Ionicons` in `ProfilePictureScreen` after global asset cleanup; restored for camera placeholder stability.

#### [2026-04-11] - Robustness & Architecture Refinement
- **Pixel-Perfect Profile Camera Refactoring**: Replicated the initially inferred `Capture image.png` Figma layout.
- **Layered UI fix**: Resolved "unclickable" inputs by moving `OnboardingMosaic` to a background layer (`zIndex: -1`) and refactoring and onboarding screens to use a `ScrollView` inside a `KeyboardAvoidingView`.
- **Keyboard Awareness**: Integrated `KeyboardAvoidingView` into `SignInScreen` and `OTPScreen` for seamless entry.
- **Agreement Feedback Loop**: Fixed button logic to remain enabled for feedback alerts.
- **OTP Responsive Fix**: Switched `OTPInput` boxes to `flex` scaling.

---

## 🤖 Instructions for AI Assistants (Windsurf, Cursor, Claude)
When working on this project, you **MUST**:
1.  **Read this file (`memory.md`) first**. It contains the latest design tokens and architectural decisions.
2.  **Avoid hardcoding**. Use the theme files in `src/theme/`.
3.  **Update this file** after implementing any new feature, changing typography/theme, or adding a screen.
4.  **Preserve the MVVM structure**. Keep business logic in ViewModels.
5.  **Aim for Perfection**. If the design requires a specific shadow or radius, implement it exactly as per the Figma PNGs in `SOS-FigmaDesigns/`.

---
*Last Updated: 2026-04-11 19:50:48*
