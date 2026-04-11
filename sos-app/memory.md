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
  - **Radius**: Large 50px radius for top corners of bottom cards.
  - **Shadows**: Subtle, multi-layered shadows for a "premium" depth effect.
- **Dynamic Background (OnboardingMosaic)**:
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

#### [2026-04-11] - Robustness & Architecture Refinement
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
