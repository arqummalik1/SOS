# SOS Onboarding API Validation Checklist

Use this checklist during real-device QA to verify API calls, navigation, and rendered data are aligned.

## Preconditions

- Install latest APK build.
- Login with a test account that can complete onboarding.
- Open Metro / device logs and filter for: `[SOS_API]`, `[SOS_ONBOARDING]`, `[SOS_STYLE_PREF]`, `[SOS_AUTH]`.

## 1) Profile Image (POST + render)

- Screen: `ProfileSetupHubScreen` / `ProfilePictureScreen`
- Action: Upload/capture profile image and continue.
- Required API success:
  - `POST /onboarding/profile-image` -> 2xx
- Required app behavior:
  - Success toast shown.
  - Navigate to `ProfileSetup`.
  - Image is rendered in `ProfileSetup` preview.

## 2) Basic Details (PATCH + render)

- Screen: `ProfileSetupScreen`
- Action: Enter name/height/weight/dob and tap Next.
- Required API success:
  - `PATCH /onboarding/basic-details` -> 2xx
- Required app behavior:
  - Success toast shown.
  - Navigate to `FullBodyPhoto`.
  - Entered values included in forward navigation profile payload.

## 3) Full Body Image (POST + render)

- Screens: `FullBodyCameraScreen` -> `FullBodyPhotoPreviewScreen`
- Action: Capture/upload full-body photo, then tap "Look's Good".
- Required API success:
  - `POST /onboarding/full-body-image` -> 2xx
- Required app behavior:
  - No white/blank preview screen.
  - Success toast shown.
  - Navigate to `BodyMeasurements`.

## 4) Body Shape (PATCH + render)

- Screen: `BodyMeasurementsScreen`
- Action: Select shape / custom text and tap Continue.
- Required API success:
  - `PATCH /onboarding/body-shape` -> 2xx
- Required app behavior:
  - Success toast shown.
  - Navigate to `StylePreferences`.

## 5) Skin Tone + Style (PATCH) + Onboarding Complete (POST) + Status (GET)

- Screen: `StylePreferencesScreen`
- Action: Choose skin tone + style(s), tap Continue.
- Required API success sequence:
  1. `PATCH /onboarding/skin-tone-style` -> 2xx
  2. `POST /onboarding/complete` -> 2xx
  3. `GET /onboarding/status` -> `is_onboarding_complete=true`
- Required app behavior:
  - Only after the above sequence succeeds, app routes to `Main` (dashboard).
  - If any call fails, app stays on onboarding with error message (no forced home navigation).

## 6) Re-login Consistency (GET-driven routing)

- Action: Logout, login again with the same account.
- Required API success:
  - `GET /onboarding/status` returns true for completed accounts.
- Required app behavior:
  - Completed account -> starts in `Main`.
  - Incomplete account -> starts at the correct onboarding entry route.

## 7) Profile GET/PUT loop sanity

- Screen: `SettingsScreen` -> `EditProfileScreen`
- Action: open edit/profile settings and wait 10-15 seconds.
- Required API behavior:
  - No nonstop `GET /profile` loop.
  - One focus refresh is acceptable.
- Update check:
  - Save profile fields -> `PUT /profile` 2xx.
  - Re-open settings -> `GET /profile` data reflects updated values.

