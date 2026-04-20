# SOS-Wind / SOS app — full context handoff

**Use this file when opening a new tab:** read top-to-bottom once, then jump to “Where we left off” and “Key files.”  
**Agents:** keep this file **accurate** after meaningful changes (see `.cursor/rules/sos-production-engineering.mdc`).

---

## 1. What this repo is

| Item | Detail |
|------|--------|
| **Product** | **SOS** mobile app (“Style On Spot”) — React Native / **Expo SDK 54** (`sos-app/`) |
| **Backend** | Production API host used in app: **`https://app.styleonspot.com/api/v1`** (override with env) |
| **Workspace** | `SOS-Wind/` contains **`sos-app/`** (the app), **`.cursor/rules/`**, and this **`memory.md`** |

---

## 2. Cursor rules (always read)

| Rule | Path | What it enforces |
|------|------|------------------|
| **UI + API UX** | `.cursor/rules/ui-visual-style.mdc` | No random borders; top shadows; `useWindowDimensions`; **typography** tokens; **gradient** tokens from theme; inputs fully tappable; **every API**: loading, disabled submit, success/error feedback, user-safe messages |
| **Production + memory** | `.cursor/rules/sos-production-engineering.mdc` | **Scalable** production RN; **no blind guesses**—ask user when ambiguous; **clarify → plan → build**; **todos** for multi-step work; **`src/api` + `src/services` only`** for HTTP; read/update **`memory.md`**; **Mermaid flowcharts only** for **in-app user flows** (not tiny refactors); **honest** trade-offs |
| **Official API doc + flows** | **`docs/SOS_BACKEND_API_REFERENCE.md`** + `.cursor/rules/sos-backend-api-reference.mdc` + `.cursor/rules/styleonspot-api-spec.mdc` + **`docs/API_INTEGRATION_GUIDE.md`** + **`docs/completeAPIDocumentation.html`** | Full **endpoint catalog** (bodies, auth, cURL, integration status) + Cursor rule summary + plain-English guide + offline Hoppscotch HTML |

---

## 3. App architecture (`sos-app/src/`)

```
api/          → config, client, endpoints, errors, tokenManager, types (single HTTP layer)
services/     → authService, userService, wardrobeService, wardrobeFolderService, wardrobeItemService, virtualTryOnService, paymentService (typed API calls)
store/        → AuthContext, UserContext, OutfitContext (+ others as added)
screens/      → auth/*, onboarding/*, home/*, wardrobe/*, tryon/*
navigation/   → RootNavigator, AuthNavigator, WardrobeStackNavigator, …
utils/        → notify, prepareProfileImageForUpload, prepareFullBodyImageForUpload
theme/        → fonts, typography, gradients
```

- **`apiClient`** (`client.ts`): injects Bearer token, timeout, JSON vs **FormData** (no forced JSON Content-Type for multipart), refresh on 401, **`[SOS_API]`** logs (→ ✓ / ✗) and **resolved base URL** on load.
- **`buildApiUrl`**: base URL must **already** include `/api/v1`; paths in **`endpoints.ts`** must **not** start with `/v1/...` (avoids `/api/v1/v1/...` → 404).
- **Errors** (`errors.ts`): `ApiError` + codes; **413** → `PAYLOAD_TOO_LARGE` + parse nginx HTML when needed.

---

## 4. Environment

| Variable | Purpose |
|----------|---------|
| **`EXPO_PUBLIC_API_BASE_URL`** | Full API root, e.g. `https://app.styleonspot.com/api/v1` (no trailing slash issues — normalized in code) |
| **`EXPO_PUBLIC_API_TIMEOUT_MS`** | Optional; default 15000 in config |

Template: `sos-app/.env.example`

---

## 5. Auth & onboarding (actual screen order)

**Auth stack** is `AuthNavigator` (`sos-app/src/navigation/AuthNavigator.tsx`). **UX order** (how users move) is **not** the same as the `<Stack.Screen>` list order in the file.

### 5.1 Linear onboarding / profile setup flow

1. **First → Welcome → Splash → SignIn → OTP** — OTP via `authService`; tokens in **`tokenManager`** (AsyncStorage); **`AuthContext`** holds `isAuthenticated`, `isOnboarded`, `phone`.
2. **ProfileSetupHub** — entry to profile picture or resume.
3. **ProfilePicture** — camera/gallery → **`POST /onboarding/profile-image`** field **`profile_image`** (multipart). Uses **`prepareProfileImageForUpload`** (resize max long edge **1280**, JPEG **~0.78**) to avoid **nginx 413**.
4. **ProfileSetup** — name/height/weight/DOB → **`PATCH /onboarding/basic-details`** (JSON via existing `userService.saveOnboardingBasicDetails`).
5. **FullBodyPhoto** → **FullBodyCamera** (or gallery) → **FullBodyPhotoPreview** — preview → **“Look’s Good”** uploads **`POST /onboarding/full-body-image`** field **`full_body_image`**. Uses **`prepareFullBodyImageForUpload`** (center crop **9:16**, then size cap + JPEG).
6. **BodyMeasurements** — body shape cards + custom text → **`PATCH /onboarding/body-shape`** multipart: **`body_shape`** (selected id, e.g. `pear`), **`custom_body_shape`** (only if user text differs from card label). **Skip** goes to next screen **without** PATCH.
7. **StylePreferences** — skin tone hex + style carousel → **`PATCH /onboarding/skin-tone-style`** multipart: **`skin_tone`**, repeated **`style_preferences[]`** (currently one id, e.g. `casual`). Then **`updateProfile`** + **`completeOnboarding()`** → **`POST /onboarding/complete`** (Bearer only, **no body**). **Skip** completes without skin PATCH but still calls **`POST /onboarding/complete`** after local profile update.

### 5.2 `profileData` bag

Route params often carry **`profileData`** (`any` in navigator types) through FullBody → BodyMeasurements → StylePreferences — holds merged fields (`profileImage`, `fullBodyImage`, `fullBodyImageUrl`, `bodyshape`, etc.).

---

## 6. API endpoint map (`src/api/endpoints.ts`)

All paths are **relative to** `EXPO_PUBLIC_API_BASE_URL` (must end with `/api/v1`).

| Area | Paths |
|------|--------|
| **Auth** | `/auth/send-otp`, `resend-otp`, `verify-otp`, `refresh-token`; session end **`POST /logout`** (doc); **`GET/DELETE /sessions`** in HTML export — **not** in `endpoints.ts` until product adds session management |
| **Onboarding** | **`GET /onboarding/options`** (in HTML export; not wired in app yet), `/onboarding/status`, `profile-image`, `full-body-image`, `basic-details`, **`body-shape`**, **`skin-tone-style`**, **`complete`** (`POST /onboarding/complete`, final step) |
| **User / profile** | **`GET` / `PUT` `/profile`** (Hoppscotch), `POST /logout` (session end), `.../users/me/profile-setup` (legacy setup POST) |
| **Wardrobe** | `/wardrobe/outfits`, `/wardrobe/saved-outfits`, **`/wardrobe/folders`** (GET list, POST create, GET/PUT/DELETE `.../folders/:id`), **`/wardrobe/items`** (GET list + filters, GET `.../items/:id`, POST multipart create, PUT multipart update, DELETE `.../items/:id`), **`POST .../items/:id/image`**, **`GET /wardrobe/search`** (`query`, `per_page`) |
| **Virtual try-on** | **`/virtual-tryon`** (GET list, POST initiate), **`/virtual-tryon/:id`** (GET status, DELETE), **`.../react`**, **`.../rate`**, **`.../regenerate`**, **`.../lookbook`**, **`.../schedule`** — see `virtualTryOnService.ts` + `VirtualTryOnScreen.tsx` |
| **Payment** | `/payments/...` (UPI, card, etc.) |

---

## 7. Context loading guards (important)

- **`UserContext`**: uses **`useAuth()`**. Loads **`GET /users/me`** only when **`isAuthenticated && isOnboarded`**. Otherwise hydrates from AsyncStorage. **403/NOT_FOUND** on profile → warn, keep local data.
- **`OutfitContext`**: wardrobe loads only when **`isAuthenticated && isOnboarded`**.
- **`wardrobeService`**: on **NOT_FOUND** or **FORBIDDEN** for list endpoints → returns **`[]`** + console warn (backend may not expose those routes yet).
- **`Wardrobe item category` (production):** validated enums are the **wardrobe** set (`top`, `bottom`, `outerwear`, `dress`, …) — **not** try-on plural values (`tops`, `bottoms`). **`wardrobeItemService.normalizeWardrobeItemCategory`** maps synonyms before POST/PUT. **`PUT /wardrobe/items/:id`** must mirror Hoppscotch: **`folder_id`**, **`subcategory`**, **`product_url`**, **`is_favorite`**, and **all** **`occasions[]` / `seasons[]`** from the server unless the user changes the dropdown (see `EditItemDetailsScreen` `editPutSnapshotRef`). **`notify`** uses **`window.alert` on web** for visible feedback.

---

## 8. Media, permissions, native builds

| Topic | Detail |
|-------|--------|
| **`expo-image-manipulator`** | Required for profile + full-body **before** upload; **rebuild dev client** after install (`eas build` or `expo run:ios/android`) |
| **`expo-dev-client`** | Dev builds; scripts: `npm run eas:build:dev:ios`, `...:android`, `...:ios-simulator`; run app with **`npm run start:dev`** |
| **`app.json` plugins** | `expo-dev-client`, `expo-font`, `expo-image-picker`, `expo-camera` (+ iOS photo library usage strings) |
| **Gallery** | `expo-image-picker`: permissions, **`mediaTypes: ['images']`**, Android **`getPendingResultAsync`** where implemented; profile picture uses iOS crop optional; full body often **`allowsEditing: false`** (crop in manipulator) |

---

## 9. Logging conventions

| Prefix | Where |
|--------|--------|
| **`[SOS_API]`** | Every HTTP in `api/client.ts` |
| **`[SOS_PROFILE_IMAGE]`** | Profile picture screen + `userService.uploadProfileImage` |
| **`[SOS_FULL_BODY_IMAGE]`** | Full body preview/upload + `uploadFullBodyImage` |
| **`[SOS_ONBOARDING]`** | Body shape / skin-tone-style PATCH + prep logs in `userService` |
| **`logSosError` / screen `LOG`** | `utils/logSosError.ts` — structured `console.error` / `console.warn` with `ApiError` `{ code, status, message }`; wardrobe screens use prefixes like `[SOS_FOLDER_DETAIL]`, `[SOS_ITEM_DETAILS]`, `[SOS_EDIT_ITEM_DETAILS]`, `[SOS_ADD_ITEM_CAMERA]` |

---

## 10. Known backend / infra notes

- **413** on large uploads was fixed **client-side** by resizing/compressing; nginx may still enforce low limits — if 413 persists, backend/nginx must raise **`client_max_body_size`**.
- **POST `/wardrobe/folders` 500** (`feature_image_ai_status` cannot be null): **server bug** — the INSERT must set defaults (or nullable columns) for `feature_image`, `processed_feature_image`, and `feature_image_ai_status`. The app sends `feature_image_ai_status: 'pending'` plus empty image fields; if the API ignores them, **Laravel** must assign defaults in the controller or model **`creating`** boot.
- **Wardrobe `/wardrobe/outfits`** (and saved outfits) returned **404** “route not found” at some point — may be undeployed routes vs app; app degrades gracefully.
- **`GET /users/me`** returned **403** “wrong roles” for users still in onboarding — addressed by **not calling** until onboarded.

---

## 11. Where we left off (snapshot: 2026-04-18)

- **Onboarding APIs implemented and wired:** profile image, basic details, full body image, **body shape**, **skin tone + style** — all through **`userService`** + **`apiClient`** with loading/toasts/logs where those screens were updated.
- **Style preferences hardening (2026-04-20):** `StylePreferencesScreen` now loads **`GET /onboarding/options`** via `userService.getOnboardingOptions`, supports **multi-select** style keys, and uses API option keys directly for `PATCH /onboarding/skin-tone-style` (`style_preferences[]`).
- **Save failure fix (2026-04-20):** style save and onboarding completion are now handled as separate steps in UI logic, so `/onboarding/complete` failures no longer surface as “failed to save preferences”.
- **Selection UI refresh (2026-04-20):** skin tone/style selected states now use elevation/shadow emphasis (no black selection borders), and custom skin tone uses a color wheel picker with hex fallback input.
- **Backend-driven onboarding routing (2026-04-20):** OTP success now resolves next onboarding screen from **`GET /onboarding/status`** using `resolveNextOnboardingRoute` (`ProfileSetupHub`/`ProfileSetup`/`FullBodyPhoto`/`BodyMeasurements`/`StylePreferences`), instead of a fixed post-OTP jump.
- **Onboarding options expansion (2026-04-20):** `userService.getOnboardingOptions` now parses **`body_shapes`** (including `icon_url`) and `BodyMeasurementsScreen` consumes API body-shape options while preserving local image fallback; onboarding camera/gallery permission errors now use `notify` toast flow (no silent/native-only alerts).
- **Second-pass state hardening (2026-04-20):** auth state now stores `onboardingEntryRoute`; session restore and OTP verification map backend `GET /onboarding/status` to an exact auth-stack entry route. `AuthNavigator` uses this backend-derived initial route, and `RootNavigator` now auto-resets between `Auth`/`Main` when auth/onboarding flags change so resumed sessions land in the correct flow without static first-screen assumptions.
- **Onboarding completion truth-gate (2026-04-20):** `AuthContext.completeOnboarding` no longer applies optimistic completion. It now requires server confirmation (`POST /onboarding/complete` + `GET /onboarding/status` returning complete) before setting `isOnboarded=true`; failed confirmation keeps onboarding false and throws for UI retry handling.
- **Screen-level API success gating (2026-04-20):** onboarding screens now explicitly block navigation unless API responses report success (`ProfileSetupHub`, `ProfilePicture`, `ProfileSetup`, `FullBodyPhotoPreview`, `BodyMeasurements`, `StylePreferences`).
- **Profile GET loop fix (2026-04-20):** `EditProfileScreen` removed `user` from focus refresh dependencies; profile fetch now runs once on focus while local fields sync via `useEffect`, preventing nonstop `GET /profile`.
- **Onboarding QA runbook (2026-04-20):** added `docs/ONBOARDING_API_VALIDATION_CHECKLIST.md` for real-device API flow validation (POST/PATCH/GET + render + navigation acceptance checks).
- **Dashboard route noise fix (2026-04-20):** disabled remote wardrobe aggregate outfit routes (`/wardrobe/outfits`, `/wardrobe/saved-outfits`) in `api/config.ts` because they are not present in `docs/completeAPIDocumentation.html`; `wardrobeService` now also auto-disables those routes after `NOT_FOUND/FORBIDDEN` fallback.
- **Image pipeline:** `prepareProfileImageForUpload.ts`, `prepareFullBodyImageForUpload.ts` (9:16).
- **Rules:** `sos-production-engineering.mdc` + `ui-visual-style.mdc`; flowcharts only for **flow** work; **`memory.md`** is the handoff doc.
- **Outstanding / not guaranteed:** payment + wardrobe **endpoints** exist in code but may not match live backend; **`profileData` typing** is still loose (`any` in navigator); optional hardening: tighten `AuthStackParamList`, success navigation after onboarding to main app (verify `RootNavigator` / post-login route).

---

## 12. Key files (bookmark)

| Concern | File(s) |
|---------|---------|
| Endpoints | `sos-app/src/api/endpoints.ts` |
| Backend API catalog (bodies, headers, tokens, status) | **`docs/SOS_BACKEND_API_REFERENCE.md`** |
| API integration narrative | **`docs/API_INTEGRATION_GUIDE.md`** |
| Onboarding API QA checklist | **`docs/ONBOARDING_API_VALIDATION_CHECKLIST.md`** |
| Cursor API rules | **`.cursor/rules/sos-backend-api-reference.mdc`**, **`.cursor/rules/styleonspot-api-spec.mdc`** |
| HTTP client | `sos-app/src/api/client.ts`, `errors.ts`, `config.ts` |
| User + onboarding HTTP | `sos-app/src/services/userService.ts` |
| Wardrobe items HTTP | `sos-app/src/services/wardrobeItemService.ts` (item `imageUrl` prefers **processed** image fields) |
| Wardrobe folders HTTP | `sos-app/src/services/wardrobeFolderService.ts` (folder cover + nested items prefer **processed** URLs) |
| Virtual try-on HTTP | `sos-app/src/services/virtualTryOnService.ts`, `VirtualTryOnScreen.tsx`, `virtualTryOnRouteParams.ts` |
| Auth HTTP | `sos-app/src/services/authService.ts` |
| Auth state | `sos-app/src/store/AuthContext.tsx` |
| User / outfit fetch gates | `sos-app/src/store/UserContext.tsx`, `OutfitContext.tsx` |
| Profile picture UI | `sos-app/src/screens/onboarding/ProfilePictureScreen.tsx` |
| Full body UI + upload on continue | `FullBodyPhotoScreen.tsx`, `FullBodyCameraScreen.tsx`, `FullBodyPhotoPreviewScreen.tsx` |
| Body shape UI | `BodyMeasurementsScreen.tsx` |
| Skin + style UI | `StylePreferencesScreen.tsx` |
| Basic details | `ProfileSetupScreen.tsx` |
| Toasts | `sos-app/src/utils/notify.ts` |
| **App navigation (route names + Mermaid)** | **`docs/NAVIGATION_FLOWCHART.md`** |

---

## 13. Quick commands

```bash
cd sos-app
cp .env.example .env   # then set EXPO_PUBLIC_API_BASE_URL
npm install
npm run start            # or npm run start:dev with dev client installed
```

---

**Last updated:** 2026-04-20 — onboarding completion now requires backend-confirmed status (no optimistic completion), onboarding screens gate navigation on API success flags, profile refresh loop in Edit Profile is fixed, and `docs/ONBOARDING_API_VALIDATION_CHECKLIST.md` documents real-device POST/PATCH/GET validation flow.
