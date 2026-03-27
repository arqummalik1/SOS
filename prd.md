Based on the screenshots and the component/navigation specs you provided, here is the complete PRD and MVVM Architecture document for **SOS – Style On Spot**.

***

# 📋 Product Requirements Document (PRD)
## SOS – Style On Spot
**Version:** 1.0.0 | **Platform:** Expo (React Native) | **Design System:** Apple Liquid Glass

***

## 1. 🎯 Product Overview

**SOS (Style On Spot)** is a fashion-focused mobile application that helps users discover, browse, and save outfit inspirations personalized to their body type and style preferences. The tagline — *"Where Elegance Meets Everyday Dressing"* — communicates its core value proposition.

**Target Users:** Fashion-conscious individuals (primarily women) aged 18–35 in India.

**Platform:** iOS & Android via Expo (React Native + TypeScript). Frontend-only, no backend. All data is mocked/local.

***

## 2. 📱 App Screens & Flow

The app has **6 core screens** visible in your screenshots:

### Screen 1 — Splash / Onboarding
**File ref:** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/17785741/fafe8bbe-44dd-4f28-9125-23a679667ad1/1.jpg?AWSAccessKeyId=ASIA2F3EMEYE2A2XD4SU&Signature=t3OdMpZbr33SPhgUrQsTZE7e%2Bas%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEAIaCXVzLWVhc3QtMSJHMEUCIQD7otCX7%2BHanS08NC9Si0zx3WqlVsV3t%2BSttPLqgaz7%2BgIgQqi21adxwUKgTsiM8H5e5vxyg%2F6BlOFzQCayFL2G61wq%2FAQIy%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDBTGtMMwviK8igdWnyrQBAeBYylOT9Iy7zx21bbPLgnAW0ODl3aJANa3lyYCG%2BrOLa9q0JkPCn00wOpm8FSDcX6eBORwSwcbm%2BhABrYBkPdCM6Vmysled487%2BdxsYwY3MB%2BsQdLsvNboM9xoPX1KuPEq6OGRVj1g3Nkh%2FSHQapjn%2FE8avgKCNhEKDYV3qIXy0a596VMi1dn81WIneeRw0kXHTxtKbFJ4GoSlQPAtlPeKaf%2ByZbQdKB1LQVWPyJvaY4%2FtrBaQn1Y6q1Lone2bCqNsebNH7Fdym%2F7cUCrkmlHYQHN0n14%2FzyVbysPzQK%2Fo0vCU8j5VvytrqS8e6%2BJYOKIr9VhXI5rNQruUfZwh%2BQmPc270rVOHEOdVj1tOb9PXH0QTSVEd0yF4oLGo4vdM1R4M7ZhDJlH%2BR4wZHi1qD5pY0zeMEYJOlU8uFQRXcX1hX3b3FqqtWdwqcxke0FtsDs5GrQy5OHooQZCDzr%2B1Mh4XAQ2T0f41zZ1970Zx8szvuMj5XlSJi8OhbDPpCVJN8YtkJWN4yfeSKaWXuGygZ0jQ5Wz9di2SIc4ZNfO74qWVDcfJcNHAZrzjBobTlv6G96vOhKqgE9tBhBx9mkuWMo9uAfP5RVXpvbew%2BVgXGzaMSm2qBXGVpOMqJ18Gnpa8sG05%2Fz1BufJfZrFOZ%2Bo9vHp8BVFnqVgnQlFRGQjrsyjmlASgSDBKdrfaG0Q88LtUN%2FS4grlj2R2gS8bz99%2BtzQQPVy930ZaYXj7S72HUoF7erZSbfgc2peaXwectz79Oj5%2FgDl0rEhxLrSn9m0Hqpl0wgueVzgY6mAGpr5DVBGjr4hyTqUp059ZanqCfkED2IYV%2Flxy3ZZUT1%2BEQHHUt2RD4vTVonsuZZS4OjEnjP7TRDO8bZrZN%2FuQTTRAaq2umQzP94W7JfAX5cfKBsWDmOHXN%2FMD81gOiCuALX%2B6Bg8dEZPnnht7vBWLKMy8jM5DO2rbUkOvBdROMP490XujvgdpqIYVXd1loDH4eEwE11YeBjg%3D%3D&Expires=1774548568)

- Full-screen collage background (fashion images in a mosaic/grid)
- Frosted glass bottom sheet overlay with:
  - App logo: `SOS` (large bold serif) + `Style On Spot` subtitle
  - Tagline: *"Where Elegance Meets Everyday Dressing."*
  - Primary CTA: **"Get Started"** button (black, full-width, rounded)
  - Secondary: **"Already have an account? Login"** text link

### Screen 2 — Sign In
**File ref:** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/17785741/cf676d98-1c21-46e5-bbdc-30de19427f6f/3.jpg?AWSAccessKeyId=ASIA2F3EMEYE2A2XD4SU&Signature=7WRVmuU2Z16RjZ2H9jl%2BmzGL%2BRo%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEAIaCXVzLWVhc3QtMSJHMEUCIQD7otCX7%2BHanS08NC9Si0zx3WqlVsV3t%2BSttPLqgaz7%2BgIgQqi21adxwUKgTsiM8H5e5vxyg%2F6BlOFzQCayFL2G61wq%2FAQIy%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDBTGtMMwviK8igdWnyrQBAeBYylOT9Iy7zx21bbPLgnAW0ODl3aJANa3lyYCG%2BrOLa9q0JkPCn00wOpm8FSDcX6eBORwSwcbm%2BhABrYBkPdCM6Vmysled487%2BdxsYwY3MB%2BsQdLsvNboM9xoPX1KuPEq6OGRVj1g3Nkh%2FSHQapjn%2FE8avgKCNhEKDYV3qIXy0a596VMi1dn81WIneeRw0kXHTxtKbFJ4GoSlQPAtlPeKaf%2ByZbQdKB1LQVWPyJvaY4%2FtrBaQn1Y6q1Lone2bCqNsebNH7Fdym%2F7cUCrkmlHYQHN0n14%2FzyVbysPzQK%2Fo0vCU8j5VvytrqS8e6%2BJYOKIr9VhXI5rNQruUfZwh%2BQmPc270rVOHEOdVj1tOb9PXH0QTSVEd0yF4oLGo4vdM1R4M7ZhDJlH%2BR4wZHi1qD5pY0zeMEYJOlU8uFQRXcX1hX3b3FqqtWdwqcxke0FtsDs5GrQy5OHooQZCDzr%2B1Mh4XAQ2T0f41zZ1970Zx8szvuMj5XlSJi8OhbDPpCVJN8YtkJWN4yfeSKaWXuGygZ0jQ5Wz9di2SIc4ZNfO74qWVDcfJcNHAZrzjBobTlv6G96vOhKqgE9tBhBx9mkuWMo9uAfP5RVXpvbew%2BVgXGzaMSm2qBXGVpOMqJ18Gnpa8sG05%2Fz1BufJfZrFOZ%2Bo9vHp8BVFnqVgnQlFRGQjrsyjmlASgSDBKdrfaG0Q88LtUN%2FS4grlj2R2gS8bz99%2BtzQQPVy930ZaYXj7S72HUoF7erZSbfgc2peaXwectz79Oj5%2FgDl0rEhxLrSn9m0Hqpl0wgueVzgY6mAGpr5DVBGjr4hyTqUp059ZanqCfkED2IYV%2Flxy3ZZUT1%2BEQHHUt2RD4vTVonsuZZS4OjEnjP7TRDO8bZrZN%2FuQTTRAaq2umQzP94W7JfAX5cfKBsWDmOHXN%2FMD81gOiCuALX%2B6Bg8dEZPnnht7vBWLKMy8jM5DO2rbUkOvBdROMP490XujvgdpqIYVXd1loDH4eEwE11YeBjg%3D%3D&Expires=1774548568)

- Same mosaic background (blurred)
- Bottom sheet (liquid glass card):
  - Title: **"Sign in"**, subtitle: *"Enter Your Phone Number"*
  - Phone input with `+91` country code dropdown and masked number field (e.g., `98XX XX89`)
  - **"Login"** button (black, full-width)
  - Terms & Privacy checkbox/link row

### Screen 3 — OTP Verification
**File ref:** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/17785741/bf8cfa78-fb06-4822-9246-e09db131e269/2.jpg?AWSAccessKeyId=ASIA2F3EMEYE2A2XD4SU&Signature=rwT9lpMElyaPU54MBkyOr0d5Y3g%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEAIaCXVzLWVhc3QtMSJHMEUCIQD7otCX7%2BHanS08NC9Si0zx3WqlVsV3t%2BSttPLqgaz7%2BgIgQqi21adxwUKgTsiM8H5e5vxyg%2F6BlOFzQCayFL2G61wq%2FAQIy%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDBTGtMMwviK8igdWnyrQBAeBYylOT9Iy7zx21bbPLgnAW0ODl3aJANa3lyYCG%2BrOLa9q0JkPCn00wOpm8FSDcX6eBORwSwcbm%2BhABrYBkPdCM6Vmysled487%2BdxsYwY3MB%2BsQdLsvNboM9xoPX1KuPEq6OGRVj1g3Nkh%2FSHQapjn%2FE8avgKCNhEKDYV3qIXy0a596VMi1dn81WIneeRw0kXHTxtKbFJ4GoSlQPAtlPeKaf%2ByZbQdKB1LQVWPyJvaY4%2FtrBaQn1Y6q1Lone2bCqNsebNH7Fdym%2F7cUCrkmlHYQHN0n14%2FzyVbysPzQK%2Fo0vCU8j5VvytrqS8e6%2BJYOKIr9VhXI5rNQruUfZwh%2BQmPc270rVOHEOdVj1tOb9PXH0QTSVEd0yF4oLGo4vdM1R4M7ZhDJlH%2BR4wZHi1qD5pY0zeMEYJOlU8uFQRXcX1hX3b3FqqtWdwqcxke0FtsDs5GrQy5OHooQZCDzr%2B1Mh4XAQ2T0f41zZ1970Zx8szvuMj5XlSJi8OhbDPpCVJN8YtkJWN4yfeSKaWXuGygZ0jQ5Wz9di2SIc4ZNfO74qWVDcfJcNHAZrzjBobTlv6G96vOhKqgE9tBhBx9mkuWMo9uAfP5RVXpvbew%2BVgXGzaMSm2qBXGVpOMqJ18Gnpa8sG05%2Fz1BufJfZrFOZ%2Bo9vHp8BVFnqVgnQlFRGQjrsyjmlASgSDBKdrfaG0Q88LtUN%2FS4grlj2R2gS8bz99%2BtzQQPVy930ZaYXj7S72HUoF7erZSbfgc2peaXwectz79Oj5%2FgDl0rEhxLrSn9m0Hqpl0wgueVzgY6mAGpr5DVBGjr4hyTqUp059ZanqCfkED2IYV%2Flxy3ZZUT1%2BEQHHUt2RD4vTVonsuZZS4OjEnjP7TRDO8bZrZN%2FuQTTRAaq2umQzP94W7JfAX5cfKBsWDmOHXN%2FMD81gOiCuALX%2B6Bg8dEZPnnht7vBWLKMy8jM5DO2rbUkOvBdROMP490XujvgdpqIYVXd1loDH4eEwE11YeBjg%3D%3D&Expires=1774548568)

- Same mosaic background
- Bottom glass sheet:
  - Title: **"OTP"**, subtitle: *"Please enter the 6-digit code"*
  - 6 individual OTP input boxes (each showing `X` placeholder)
  - **"Verify"** button (black, full-width)
  - Terms & Privacy row

### Screen 4 — Profile Picture Capture
**File ref:** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/17785741/6ea0ca59-0715-41f3-b415-867d63107289/4.jpg?AWSAccessKeyId=ASIA2F3EMEYE2A2XD4SU&Signature=RAQ66JpdSomij%2FrwBex0yuf%2Bz6Y%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEAIaCXVzLWVhc3QtMSJHMEUCIQD7otCX7%2BHanS08NC9Si0zx3WqlVsV3t%2BSttPLqgaz7%2BgIgQqi21adxwUKgTsiM8H5e5vxyg%2F6BlOFzQCayFL2G61wq%2FAQIy%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDBTGtMMwviK8igdWnyrQBAeBYylOT9Iy7zx21bbPLgnAW0ODl3aJANa3lyYCG%2BrOLa9q0JkPCn00wOpm8FSDcX6eBORwSwcbm%2BhABrYBkPdCM6Vmysled487%2BdxsYwY3MB%2BsQdLsvNboM9xoPX1KuPEq6OGRVj1g3Nkh%2FSHQapjn%2FE8avgKCNhEKDYV3qIXy0a596VMi1dn81WIneeRw0kXHTxtKbFJ4GoSlQPAtlPeKaf%2ByZbQdKB1LQVWPyJvaY4%2FtrBaQn1Y6q1Lone2bCqNsebNH7Fdym%2F7cUCrkmlHYQHN0n14%2FzyVbysPzQK%2Fo0vCU8j5VvytrqS8e6%2BJYOKIr9VhXI5rNQruUfZwh%2BQmPc270rVOHEOdVj1tOb9PXH0QTSVEd0yF4oLGo4vdM1R4M7ZhDJlH%2BR4wZHi1qD5pY0zeMEYJOlU8uFQRXcX1hX3b3FqqtWdwqcxke0FtsDs5GrQy5OHooQZCDzr%2B1Mh4XAQ2T0f41zZ1970Zx8szvuMj5XlSJi8OhbDPpCVJN8YtkJWN4yfeSKaWXuGygZ0jQ5Wz9di2SIc4ZNfO74qWVDcfJcNHAZrzjBobTlv6G96vOhKqgE9tBhBx9mkuWMo9uAfP5RVXpvbew%2BVgXGzaMSm2qBXGVpOMqJ18Gnpa8sG05%2Fz1BufJfZrFOZ%2Bo9vHp8BVFnqVgnQlFRGQjrsyjmlASgSDBKdrfaG0Q88LtUN%2FS4grlj2R2gS8bz99%2BtzQQPVy930ZaYXj7S72HUoF7erZSbfgc2peaXwectz79Oj5%2FgDl0rEhxLrSn9m0Hqpl0wgueVzgY6mAGpr5DVBGjr4hyTqUp059ZanqCfkED2IYV%2Flxy3ZZUT1%2BEQHHUt2RD4vTVonsuZZS4OjEnjP7TRDO8bZrZN%2FuQTTRAaq2umQzP94W7JfAX5cfKBsWDmOHXN%2FMD81gOiCuALX%2B6Bg8dEZPnnht7vBWLKMy8jM5DO2rbUkOvBdROMP490XujvgdpqIYVXd1loDH4eEwE11YeBjg%3D%3D&Expires=1774548568)

- Clean white screen
- Title: **"Profile picture"**, subtitle: *"Capture your profile image on a plain background"*
- Large black rounded camera viewfinder (with 3×3 grid overlay for framing)
- Bottom bar: gallery icon | capture button (large white circle) | flip camera icon

### Screen 5 — Profile Setup
**File ref:**  *(Step 1 of a multi-step form — 4 progress dots shown)* [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/17785741/f10a6d0a-826e-48cc-90b8-a2c7f14557ac/5.jpg?AWSAccessKeyId=ASIA2F3EMEYE2A2XD4SU&Signature=Rrkig40XOtJuunFZizUUJv%2FOVOc%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEAIaCXVzLWVhc3QtMSJHMEUCIQD7otCX7%2BHanS08NC9Si0zx3WqlVsV3t%2BSttPLqgaz7%2BgIgQqi21adxwUKgTsiM8H5e5vxyg%2F6BlOFzQCayFL2G61wq%2FAQIy%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDBTGtMMwviK8igdWnyrQBAeBYylOT9Iy7zx21bbPLgnAW0ODl3aJANa3lyYCG%2BrOLa9q0JkPCn00wOpm8FSDcX6eBORwSwcbm%2BhABrYBkPdCM6Vmysled487%2BdxsYwY3MB%2BsQdLsvNboM9xoPX1KuPEq6OGRVj1g3Nkh%2FSHQapjn%2FE8avgKCNhEKDYV3qIXy0a596VMi1dn81WIneeRw0kXHTxtKbFJ4GoSlQPAtlPeKaf%2ByZbQdKB1LQVWPyJvaY4%2FtrBaQn1Y6q1Lone2bCqNsebNH7Fdym%2F7cUCrkmlHYQHN0n14%2FzyVbysPzQK%2Fo0vCU8j5VvytrqS8e6%2BJYOKIr9VhXI5rNQruUfZwh%2BQmPc270rVOHEOdVj1tOb9PXH0QTSVEd0yF4oLGo4vdM1R4M7ZhDJlH%2BR4wZHi1qD5pY0zeMEYJOlU8uFQRXcX1hX3b3FqqtWdwqcxke0FtsDs5GrQy5OHooQZCDzr%2B1Mh4XAQ2T0f41zZ1970Zx8szvuMj5XlSJi8OhbDPpCVJN8YtkJWN4yfeSKaWXuGygZ0jQ5Wz9di2SIc4ZNfO74qWVDcfJcNHAZrzjBobTlv6G96vOhKqgE9tBhBx9mkuWMo9uAfP5RVXpvbew%2BVgXGzaMSm2qBXGVpOMqJ18Gnpa8sG05%2Fz1BufJfZrFOZ%2Bo9vHp8BVFnqVgnQlFRGQjrsyjmlASgSDBKdrfaG0Q88LtUN%2FS4grlj2R2gS8bz99%2BtzQQPVy930ZaYXj7S72HUoF7erZSbfgc2peaXwectz79Oj5%2FgDl0rEhxLrSn9m0Hqpl0wgueVzgY6mAGpr5DVBGjr4hyTqUp059ZanqCfkED2IYV%2Flxy3ZZUT1%2BEQHHUt2RD4vTVonsuZZS4OjEnjP7TRDO8bZrZN%2FuQTTRAaq2umQzP94W7JfAX5cfKBsWDmOHXN%2FMD81gOiCuALX%2B6Bg8dEZPnnht7vBWLKMy8jM5DO2rbUkOvBdROMP490XujvgdpqIYVXd1loDH4eEwE11YeBjg%3D%3D&Expires=1774548568)

- Title: **"Profile setup"**
- Subtitle: *"This information helps us deliver a better, more personalized experience for you."*
- Progress indicator: 4 steps (step 1 filled black)
- Profile photo preview (editable with edit icon overlay)
- Fields:
  - **Your name** — text input (placeholder: *Jane Doe*)
  - **Height** — dropdown (e.g., 160cm)
  - **Weight** — dropdown (e.g., 60kg)
  - **Date of Birth** — 3 dropdowns (Day, Month, Year)
- **"Next"** button (black, full-width)

### Screen 6 — Home (Implied from mosaic background)
The repeated fashion collage is the home/discovery feed, a **masonry/grid layout** of outfit photos.

***

## 3. 🗺️ Navigation Architecture

```
Root Navigator (Stack)
├── AuthStack (Stack)
│   ├── SplashScreen
│   ├── SignInScreen
│   ├── OTPScreen
│   └── ProfileSetupStack (Stack)
│       ├── ProfilePictureScreen
│       └── ProfileSetupScreen (multi-step: Step 1–4)
└── MainApp (Bottom Tabs)
    ├── HomeTab
    │   └── OutfitDetailScreen (modal stack)
    ├── SearchTab
    └── ProfileTab
```

***

## 4. 🏗️ MVVM Architecture

The app follows a strict **Model → ViewModel → View** separation, using React Context + custom hooks as the ViewModel layer.

### Layer Diagram

```
┌─────────────────────────────────────┐
│              VIEW LAYER             │
│   (Screens + UI Components)         │
│   screens/, components/             │
└────────────────┬────────────────────┘
                 │ consumes
┌────────────────▼────────────────────┐
│           VIEWMODEL LAYER           │
│   (Custom Hooks + Context)          │
│   viewmodels/, context/             │
└────────────────┬────────────────────┘
                 │ reads/writes
┌────────────────▼────────────────────┐
│            MODEL LAYER              │
│   (Types, Mock Data, Local State)   │
│   models/, data/, store/            │
└─────────────────────────────────────┘
```

***

## 5. 📁 Scalable Project Structure

```
sos-app/
├── app/                          # Expo Router (if using) OR
├── src/
│   ├── models/                   # Data types & interfaces
│   │   ├── User.model.ts
│   │   ├── Outfit.model.ts
│   │   └── Profile.model.ts
│   │
│   ├── data/                     # Mock/static data (no backend)
│   │   ├── outfits.mock.ts
│   │   └── categories.mock.ts
│   │
│   ├── store/                    # Global state (Context + useReducer)
│   │   ├── AuthContext.tsx
│   │   ├── UserContext.tsx
│   │   └── OutfitContext.tsx
│   │
│   ├── viewmodels/               # Business logic hooks (ViewModel)
│   │   ├── useAuthViewModel.ts
│   │   ├── useOTPViewModel.ts
│   │   ├── useProfileSetupViewModel.ts
│   │   ├── useHomeViewModel.ts
│   │   └── useSearchViewModel.ts
│   │
│   ├── screens/                  # View layer — screens only
│   │   ├── auth/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── SignInScreen.tsx
│   │   │   └── OTPScreen.tsx
│   │   ├── onboarding/
│   │   │   ├── ProfilePictureScreen.tsx
│   │   │   └── ProfileSetupScreen.tsx
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   └── OutfitDetailScreen.tsx
│   │   ├── search/
│   │   │   └── SearchScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   │
│   ├── components/               # Reusable UI components
│   │   ├── ui/
│   │   │   ├── GlassCard.tsx
│   │   │   ├── GlassButton.tsx
│   │   │   ├── GlassInput.tsx
│   │   │   ├── OTPInput.tsx
│   │   │   ├── PhoneInput.tsx
│   │   │   └── ProgressDots.tsx
│   │   ├── typography/
│   │   │   ├── Heading.tsx
│   │   │   ├── BodyText.tsx
│   │   │   └── Caption.tsx
│   │   ├── icons/
│   │   │   ├── Icon.tsx
│   │   │   └── ActionIcon.tsx
│   │   ├── inputs/
│   │   │   └── SearchInput.tsx
│   │   └── layout/
│   │       ├── MosaicBackground.tsx
│   │       └── SafeContainer.tsx
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── ProfileSetupNavigator.tsx
│   │
│   ├── theme/
│   │   ├── colors.ts             # Liquid Glass color tokens
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── glass.ts              # Glass effect style presets
│   │
│   └── utils/
│       ├── validators.ts         # Phone, OTP validation
│       └── formatters.ts
│
├── assets/
│   ├── images/                   # Outfit mock images
│   └── fonts/
├── app.json
├── tsconfig.json
└── package.json
```

***

## 6. 🔗 ViewModel Contracts

Each ViewModel hook exposes **state + actions** to the screen:

### `useAuthViewModel`
```typescript
interface AuthViewModel {
  phone: string;
  countryCode: string;
  isValid: boolean;
  isLoading: boolean;
  setPhone: (val: string) => void;
  setCountryCode: (val: string) => void;
  handleLogin: () => void;           // navigates to OTP
}
```

### `useOTPViewModel`
```typescript
interface OTPViewModel {
  otp: string[];
  isComplete: boolean;
  handleChange: (index: number, val: string) => void;
  handleVerify: () => void;          // navigates to ProfilePicture
  handleResend: () => void;
}
```

### `useProfileSetupViewModel`
```typescript
interface ProfileSetupViewModel {
  step: number;                      // 1–4
  name: string;
  height: string;
  weight: string;
  dob: { day: string; month: string; year: string };
  profileImage: string | null;
  setField: (key: string, value: string) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleComplete: () => void;        // navigates to MainApp
}
```

### `useHomeViewModel`
```typescript
interface HomeViewModel {
  outfits: Outfit[];
  featured: Outfit[];
  savedIds: string[];
  handleSave: (id: string) => void;
  handleSelect: (outfit: Outfit) => void;
}
```

### `useSearchViewModel`
```typescript
interface SearchViewModel {
  query: string;
  results: Outfit[];
  setQuery: (val: string) => void;
  clearQuery: () => void;
}
```

***

## 7. 🎨 Apple Liquid Glass Design System

### Color Tokens (`theme/colors.ts`)
```typescript
export const colors = {
  background: {
    primary: '#0A0015',       // Deep purple-black
    gradient: ['#1A0533', '#0D1B4B'],
  },
  glass: {
    light: 'rgba(255,255,255,0.12)',
    medium: 'rgba(255,255,255,0.18)',
    heavy: 'rgba(255,255,255,0.28)',
    border: 'rgba(255,255,255,0.25)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.7)',
    muted: 'rgba(255,255,255,0.45)',
  },
  accent: {
    purple: '#BF5AF2',
    blue: '#0A84FF',
    pink: '#FF375F',
  },
  button: {
    primary: '#000000',       // As seen in screenshots
    primaryText: '#FFFFFF',
  },
}
```

### Glass Presets (`theme/glass.ts`)
```typescript
export const glassStyles = {
  card: {
    backgroundColor: colors.glass.medium,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: 24,
    // Use expo-blur BlurView wrapper
    blurAmount: 20,
  },
  bottomSheet: {
    backgroundColor: 'rgba(255,255,255,0.95)',  // White sheet (per screenshots)
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  input: {
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120,120,128,0.2)',
  },
}
```

***

## 8. 📦 Models

### `User.model.ts`
```typescript
export interface User {
  id: string;
  phone: string;
  name: string;
  profileImage: string | null;
  height: string;
  weight: string;
  dob: string;
  savedOutfits: string[];
}
```

### `Outfit.model.ts`
```typescript
export interface Outfit {
  id: string;
  imageUrl: string;
  title: string;
  category: string;
  tags: string[];
  isTrending: boolean;
  isFeatured: boolean;
}
```

***

## 9. 📦 Complete Dependencies

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react": "18.3.2",
    "react-native": "0.76.x",
    "typescript": "^5.3.0",
    "@react-navigation/native": "^7.x",
    "@react-navigation/native-stack": "^7.x",
    "@react-navigation/bottom-tabs": "^7.x",
    "react-native-screens": "^4.x",
    "react-native-safe-area-context": "^5.x",
    "expo-blur": "~14.x",
    "expo-linear-gradient": "~14.x",
    "react-native-reanimated": "~3.x",
    "@expo/vector-icons": "^14.x",
    "expo-image-picker": "~16.x",
    "expo-camera": "~16.x",
    "react-native-web": "^0.19.x",
    "react-dom": "^18.x"
  }
}
```

***

## 10. 🚀 Multi-Step Profile Setup Flow

The profile setup has **4 steps** (indicated by the 4-dot progress bar in ): [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/17785741/f10a6d0a-826e-48cc-90b8-a2c7f14557ac/5.jpg?AWSAccessKeyId=ASIA2F3EMEYE2A2XD4SU&Signature=Rrkig40XOtJuunFZizUUJv%2FOVOc%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEAIaCXVzLWVhc3QtMSJHMEUCIQD7otCX7%2BHanS08NC9Si0zx3WqlVsV3t%2BSttPLqgaz7%2BgIgQqi21adxwUKgTsiM8H5e5vxyg%2F6BlOFzQCayFL2G61wq%2FAQIy%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDBTGtMMwviK8igdWnyrQBAeBYylOT9Iy7zx21bbPLgnAW0ODl3aJANa3lyYCG%2BrOLa9q0JkPCn00wOpm8FSDcX6eBORwSwcbm%2BhABrYBkPdCM6Vmysled487%2BdxsYwY3MB%2BsQdLsvNboM9xoPX1KuPEq6OGRVj1g3Nkh%2FSHQapjn%2FE8avgKCNhEKDYV3qIXy0a596VMi1dn81WIneeRw0kXHTxtKbFJ4GoSlQPAtlPeKaf%2ByZbQdKB1LQVWPyJvaY4%2FtrBaQn1Y6q1Lone2bCqNsebNH7Fdym%2F7cUCrkmlHYQHN0n14%2FzyVbysPzQK%2Fo0vCU8j5VvytrqS8e6%2BJYOKIr9VhXI5rNQruUfZwh%2BQmPc270rVOHEOdVj1tOb9PXH0QTSVEd0yF4oLGo4vdM1R4M7ZhDJlH%2BR4wZHi1qD5pY0zeMEYJOlU8uFQRXcX1hX3b3FqqtWdwqcxke0FtsDs5GrQy5OHooQZCDzr%2B1Mh4XAQ2T0f41zZ1970Zx8szvuMj5XlSJi8OhbDPpCVJN8YtkJWN4yfeSKaWXuGygZ0jQ5Wz9di2SIc4ZNfO74qWVDcfJcNHAZrzjBobTlv6G96vOhKqgE9tBhBx9mkuWMo9uAfP5RVXpvbew%2BVgXGzaMSm2qBXGVpOMqJ18Gnpa8sG05%2Fz1BufJfZrFOZ%2Bo9vHp8BVFnqVgnQlFRGQjrsyjmlASgSDBKdrfaG0Q88LtUN%2FS4grlj2R2gS8bz99%2BtzQQPVy930ZaYXj7S72HUoF7erZSbfgc2peaXwectz79Oj5%2FgDl0rEhxLrSn9m0Hqpl0wgueVzgY6mAGpr5DVBGjr4hyTqUp059ZanqCfkED2IYV%2Flxy3ZZUT1%2BEQHHUt2RD4vTVonsuZZS4OjEnjP7TRDO8bZrZN%2FuQTTRAaq2umQzP94W7JfAX5cfKBsWDmOHXN%2FMD81gOiCuALX%2B6Bg8dEZPnnht7vBWLKMy8jM5DO2rbUkOvBdROMP490XujvgdpqIYVXd1loDH4eEwE11YeBjg%3D%3D&Expires=1774548568)

| Step | Screen | Fields |
|------|--------|--------|
| 1 | Basic Info | Name, Height, Weight, Date of Birth, Profile Photo |
| 2 | Style Preferences | Preferred styles (Casual, Formal, Boho, etc.) |
| 3 | Color Palette | Preferred color families |
| 4 | Budget Range | Shopping budget preferences |

Each step is a separate component rendered inside `ProfileSetupScreen.tsx`, controlled by `useProfileSetupViewModel`'s `step` state.

***

## 11. ✅ MVP Feature Checklist

| Feature | Screen | Priority |
|---|---|---|
| Splash/onboarding | SplashScreen | P0 |
| Phone login (mocked) | SignInScreen | P0 |
| OTP verification (mocked, any 6-digit) | OTPScreen | P0 |
| Profile photo capture | ProfilePictureScreen | P0 |
| Profile setup (4 steps) | ProfileSetupScreen | P0 |
| Fashion collage home feed | HomeScreen | P0 |
| Outfit detail modal | OutfitDetailScreen | P1 |
| Outfit save/favorite | HomeScreen | P1 |
| Search outfits | SearchScreen | P1 |
| User profile view | ProfileScreen | P1 |

***

## 12. 🔒 State Persistence

Since there is no backend, use **`AsyncStorage`** (`@react-native-async-storage/async-storage`) to persist:
- `user` — profile data after onboarding
- `savedOutfits` — array of saved outfit IDs
- `isOnboarded` — boolean flag to skip onboarding on relaunch

The `AuthContext` reads `isOnboarded` on app launch and routes to either `AuthStack` or `MainApp` accordingly.

***

## 13. 🧪 Getting Started

```bash
# Setup
npx create-expo-app SOS --template blank-typescript
cd SOS
npm install @react-navigation/native @react-navigation/native-stack \
  @react-navigation/bottom-tabs react-native-screens \
  react-native-safe-area-context expo-blur expo-linear-gradient \
  react-native-reanimated @expo/vector-icons expo-image-picker \
  expo-camera @react-native-async-storage/async-storage

# Start
npx expo start
```

***

This PRD covers all 6 screens visible in your mockups, uses a fully frontend-only architecture with mocked data, and follows MVVM with clean separation of concerns. You can now start scaffolding by creating the folder structure, then building from `AuthNavigator → SignInScreen → useAuthViewModel` outward. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/images/17785741/bf8cfa78-fb06-4822-9246-e09db131e269/2.jpg?AWSAccessKeyId=ASIA2F3EMEYE2A2XD4SU&Signature=rwT9lpMElyaPU54MBkyOr0d5Y3g%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEAIaCXVzLWVhc3QtMSJHMEUCIQD7otCX7%2BHanS08NC9Si0zx3WqlVsV3t%2BSttPLqgaz7%2BgIgQqi21adxwUKgTsiM8H5e5vxyg%2F6BlOFzQCayFL2G61wq%2FAQIy%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDBTGtMMwviK8igdWnyrQBAeBYylOT9Iy7zx21bbPLgnAW0ODl3aJANa3lyYCG%2BrOLa9q0JkPCn00wOpm8FSDcX6eBORwSwcbm%2BhABrYBkPdCM6Vmysled487%2BdxsYwY3MB%2BsQdLsvNboM9xoPX1KuPEq6OGRVj1g3Nkh%2FSHQapjn%2FE8avgKCNhEKDYV3qIXy0a596VMi1dn81WIneeRw0kXHTxtKbFJ4GoSlQPAtlPeKaf%2ByZbQdKB1LQVWPyJvaY4%2FtrBaQn1Y6q1Lone2bCqNsebNH7Fdym%2F7cUCrkmlHYQHN0n14%2FzyVbysPzQK%2Fo0vCU8j5VvytrqS8e6%2BJYOKIr9VhXI5rNQruUfZwh%2BQmPc270rVOHEOdVj1tOb9PXH0QTSVEd0yF4oLGo4vdM1R4M7ZhDJlH%2BR4wZHi1qD5pY0zeMEYJOlU8uFQRXcX1hX3b3FqqtWdwqcxke0FtsDs5GrQy5OHooQZCDzr%2B1Mh4XAQ2T0f41zZ1970Zx8szvuMj5XlSJi8OhbDPpCVJN8YtkJWN4yfeSKaWXuGygZ0jQ5Wz9di2SIc4ZNfO74qWVDcfJcNHAZrzjBobTlv6G96vOhKqgE9tBhBx9mkuWMo9uAfP5RVXpvbew%2BVgXGzaMSm2qBXGVpOMqJ18Gnpa8sG05%2Fz1BufJfZrFOZ%2Bo9vHp8BVFnqVgnQlFRGQjrsyjmlASgSDBKdrfaG0Q88LtUN%2FS4grlj2R2gS8bz99%2BtzQQPVy930ZaYXj7S72HUoF7erZSbfgc2peaXwectz79Oj5%2FgDl0rEhxLrSn9m0Hqpl0wgueVzgY6mAGpr5DVBGjr4hyTqUp059ZanqCfkED2IYV%2Flxy3ZZUT1%2BEQHHUt2RD4vTVonsuZZS4OjEnjP7TRDO8bZrZN%2FuQTTRAaq2umQzP94W7JfAX5cfKBsWDmOHXN%2FMD81gOiCuALX%2B6Bg8dEZPnnht7vBWLKMy8jM5DO2rbUkOvBdROMP490XujvgdpqIYVXd1loDH4eEwE11YeBjg%3D%3D&Expires=1774548568)