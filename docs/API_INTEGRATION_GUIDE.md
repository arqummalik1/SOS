# SOS (Style On Spot) — API integration guide (plain English)

**Purpose:** Explain **what each integrated API does**, **why the app calls it**, **how** it is called in this repo (method, layer, typical screens), and how pieces **flow together**.

**Official API documentation (human / authenticated):**  
[https://api.styleonspot.com/view/f2fb9ef4-e921-404c-949d-4daf9f445155/CURRENT](https://api.styleonspot.com/view/f2fb9ef4-e921-404c-949d-4daf9f445155/CURRENT)

> **Note for engineers:** That viewer may require a login. This guide is built from **`sos-app` source** (`endpoints.ts`, `services/*`, `memory.md`). When the official doc differs, **trust the deployed contract** after verification, then update this file and `endpoints.ts`.

**Runtime base URL:** `EXPO_PUBLIC_API_BASE_URL` (must end with `/api/v1`, e.g. `https://app.styleonspot.com/api/v1`). All paths below are **relative** to that root.

---

## Part A — How every API call works in this app

### What is `apiClient`?

**What:** One shared HTTP layer (`sos-app/src/api/client.ts`).

**Why:** So every screen gets the same behavior: timeouts, JSON vs multipart, errors shaped as `ApiError`, and **automatic refresh** if the access token expired (401).

**How:** Screens and features **do not** call `fetch` directly for app APIs. They call **`src/services/*`**, which calls **`apiClient.get|post|put|patch|delete`**. Headers include **`Authorization: Bearer <token>`** when `skipAuth` is not set (see `tokenManager`).

### What happens on 401?

**Why:** Access tokens are short-lived; the user should not have to log in again for every expired call.

**How:** `apiClient` tries **`POST /auth/refresh-token`** with the stored refresh token, saves new tokens, and **retries the original request once**.

### Where are routes defined?

**What:** `sos-app/src/api/endpoints.ts` — single map of path strings.

**Why:** Avoid duplicated string paths and `/v1` doubled by mistake.

### How are errors shown to users?

**Why:** Production rule: never fail silently.

**How:** Services throw **`ApiError`** (`sos-app/src/api/errors.ts`). Screens use **`notify()`** (`utils/notify.ts`) and loading/disabled buttons. Some flows also use **`logSosError`** for structured console logs.

---

## Part B — User journeys and which APIs run (high level)

### Journey 1: Sign in with phone (OTP)

1. User enters phone → app calls **send OTP**.
2. User enters code → app calls **verify OTP** → server returns **access + refresh tokens** → app stores them.
3. App may call **onboarding status** to know if the user must finish setup or can enter the main app.

### Journey 2: Onboarding (first-time setup)

1. Optional **status** check.
2. User adds profile photo → **profile image** upload (multipart, resized client-side).
3. User enters name/height/weight/DOB → **basic details** (PATCH).
4. User adds full-body photo → **full body image** upload (multipart, cropped/resized).
5. User picks body shape → **body shape** (PATCH, multipart fields).
6. User picks skin tone + styles → **skin tone + style** (PATCH, multipart).
7. User finishes → **complete onboarding** (POST, often no body) so the backend marks the account ready.

### Journey 3: Day-to-day profile

- **GET profile** loads the signed-in user’s profile card.
- **PUT profile** saves edits (name, preferences, etc., depending on what the UI collects).

### Journey 4: Sign out

- Preferred: **POST `/logout`** (session) with Bearer only.
- Fallback/legacy: **POST `/auth/logout`** if the session route fails (see `authService`).

### Journey 5: Wardrobe folders

- **GET folders** — list cards on “My Wardrobe”.
- **POST folders** — create folder (JSON body; backend must accept defaults for image-related DB columns).
- **GET folder/:id** — folder detail + sometimes embedded items (parser tolerant).
- **PUT folder/:id** — rename/recolor/reorder.
- **DELETE folder/:id** — remove folder (backend rules for items apply).

### Journey 6: Wardrobe items

- **GET items** (+ query filters) — grid inside a folder; app prefers this list when non-empty.
- **GET items/:id** — single item for detail/edit screens.
- **POST items** — create item (**multipart**: name, category, brand, price, folder, seasons[], occasions[], image file).
- **PUT items/:id** — update fields and optionally new image (**multipart**).
- **POST items/:id/image** — replace only the image (**multipart**, field `image`).
- **DELETE items/:id** — remove item.
- **GET wardrobe/search** — text search (`query`, optional `per_page`).

### Journey 7: Outfits (partial / may 404)

- **GET outfits**, **GET saved outfits**, save/unsave — implemented in `wardrobeService`; some environments return 404; app degrades to empty lists where coded.

### Journey 8: Payments

- **POST** UPI verify/pay, card, net banking, PayPal charge — `paymentService`; wire to checkout UI when that flow is built.

---

## Part C — Endpoint-by-endpoint reference (integrated in repo)

Each block: **Path** · **HTTP** · **What** · **Why** · **How (service + notes)** · **Typical UI**

---

### Auth — `/auth/send-otp`

| | |
|---|---|
| **Method** | POST |
| **What** | Asks the server to send an SMS/WhatsApp (etc.) OTP to the phone number. |
| **Why** | Passwordless login; starts the auth session flow. |
| **How** | `authService.requestOtp` → `apiClient.post` JSON body with phone. |
| **UI** | Sign-in screen. |

---

### Auth — `/auth/resend-otp`

| | |
|---|---|
| **Method** | POST |
| **What** | Sends another OTP if the first expired or the user did not receive it. |
| **Why** | UX recovery without starting over. |
| **How** | `authService.resendOtp` → `apiClient.post`. |
| **UI** | OTP screen. |

---

### Auth — `/auth/verify-otp`

| | |
|---|---|
| **Method** | POST |
| **What** | Validates the code; returns **tokens** and usually onboarding flags. |
| **Why** | Proves phone ownership; establishes authenticated session. |
| **How** | `authService.verifyOtp` → `apiClient.post`; `tokenManager.setTokens`. |
| **UI** | OTP screen → navigates into onboarding or main app. |

---

### Auth — `/auth/refresh-token`

| | |
|---|---|
| **Method** | POST |
| **What** | Exchanges refresh token for a new access token (and possibly new refresh). |
| **Why** | Keeps the user signed in without re-entering OTP. |
| **How** | **Internal** — `apiClient` `refreshAccessToken` (not called directly from screens). |
| **UI** | None (automatic). |

---

### Auth — `/auth/logout` (legacy)

| | |
|---|---|
| **Method** | POST |
| **What** | Older logout route on some deployments. |
| **Why** | Backward compatibility if `/logout` is missing. |
| **How** | `authService.logout` tries **`/logout` first**, then may call this. |
| **UI** | Settings / sign-out. |

---

### Session — `/logout`

| | |
|---|---|
| **Method** | POST |
| **What** | Ends the server session for the current access token. |
| **Why** | Clean sign-out; invalidate server-side session if used. |
| **How** | `authService.logout` → `apiClient.post` with **Bearer only**, empty/no body. |
| **UI** | Sign-out flow; contexts clear local state. |

---

### Onboarding — `/onboarding/status`

| | |
|---|---|
| **Method** | GET |
| **What** | Returns how far onboarding has progressed on the server. |
| **Why** | Resume onboarding after kill/reinstall; gate main app. |
| **How** | `authService.fetchOnboardingStatus` (or equivalent) → `apiClient.get`. |
| **UI** | Auth / resume flows. |

---

### Onboarding — `/onboarding/profile-image`

| | |
|---|---|
| **Method** | POST (**multipart/form-data**) |
| **What** | Uploads the user’s face/profile photo for the profile. |
| **Why** | Personalization and downstream styling features. |
| **How** | `userService.uploadProfileImage` → **`prepareProfileImageForUpload`** (resize/compress) → `FormData` field **`profile_image`** → `apiClient.post`. |
| **UI** | Profile picture onboarding screen. |

---

### Onboarding — `/onboarding/basic-details`

| | |
|---|---|
| **Method** | PATCH (JSON) |
| **What** | Saves name, height, weight, date of birth, etc. |
| **Why** | Core profile fields for sizing and recommendations. |
| **How** | `userService.saveOnboardingBasicDetails` → `apiClient.patch` with mapped body. |
| **UI** | Profile setup (basic details) screen. |

---

### Onboarding — `/onboarding/full-body-image`

| | |
|---|---|
| **Method** | POST (**multipart/form-data**) |
| **What** | Uploads full-body photo for try-on / body context. |
| **Why** | Needed for virtual try-on and similar features. |
| **How** | `userService.uploadFullBodyImage` → **`prepareFullBodyImageForUpload`** (9:16 crop, size cap) → field **`full_body_image`** → `apiClient.post`. |
| **UI** | Full-body camera → preview → confirm. |

---

### Onboarding — `/onboarding/body-shape`

| | |
|---|---|
| **Method** | PATCH (**multipart**) |
| **What** | Saves selected body shape id and optional custom text. |
| **Why** | Fit and styling recommendations. |
| **How** | `userService.saveOnboardingBodyShape` → multipart parts **`body_shape`**, **`custom_body_shape`** when needed → `apiClient.patch`. |
| **UI** | Body measurements screen. |

---

### Onboarding — `/onboarding/skin-tone-style`

| | |
|---|---|
| **Method** | PATCH (**multipart**) |
| **What** | Saves skin tone (e.g. hex) and **repeated** `style_preferences[]` entries. |
| **Why** | Personalizes palette and style feed. |
| **How** | `userService.saveOnboardingSkinToneStyle` → `apiClient.patch`. |
| **UI** | Style preferences screen. |

---

### Onboarding — `/onboarding/complete`

| | |
|---|---|
| **Method** | POST |
| **What** | Marks onboarding finished on the server (often **no body**). |
| **Why** | Unlocks main app; backend stops treating user as “incomplete”. |
| **How** | `userService.completeOnboarding` → `apiClient.post` with Bearer. |
| **UI** | Final step of onboarding / skip paths that still need server completion. |

---

### User — `/users/me/profile-setup`

| | |
|---|---|
| **Method** | POST |
| **What** | Legacy “profile setup” aggregate endpoint on some backends. |
| **Why** | Historical compatibility. |
| **How** | `userService.saveProfileSetup` → `apiClient.post`. |
| **UI** | Rare / legacy paths; prefer `/profile` where possible. |

---

### Profile — `/profile`

| | |
|---|---|
| **Method** | GET |
| **What** | Loads the current user profile envelope (`data.user` shape handled in service). |
| **Why** | Home/profile tabs need fresh server state after login. |
| **How** | `userService.getProfile` → `apiClient.get`; maps to app `User` model. |
| **UI** | `UserContext` hydration, profile screen. |

| | |
|---|---|
| **Method** | PUT |
| **What** | Updates allowed profile fields returned by the API contract. |
| **Why** | User edits profile from settings/edit profile. |
| **How** | `userService.updateProfile` → `buildPutProfileBody` → `apiClient.put`; may refetch on partial response. |
| **UI** | Edit profile / settings flows. |

---

### Wardrobe — `/wardrobe/folders`

| | |
|---|---|
| **Method** | GET |
| **What** | Lists all wardrobe folders (cards). |
| **Why** | “My Wardrobe” main grid. |
| **How** | `wardrobeFolderService.listFolders` → `apiClient.get`; maps `order`, colors, counts. |
| **UI** | `MyWardrobeScreen`. |

| | |
|---|---|
| **Method** | POST (JSON) |
| **What** | Creates a folder (name, description, color, order, plus client-sent defaults for image-related fields). |
| **Why** | User organizes clothes into virtual closets. |
| **How** | `wardrobeFolderService.createFolder` → `apiClient.post`. **If 500:** backend must set NOT NULL columns (see `memory.md`). |
| **UI** | `CreateFolderModal`. |

---

### Wardrobe — `/wardrobe/folders/:id`

| | |
|---|---|
| **Method** | GET |
| **What** | Folder metadata and sometimes embedded items (response shape parsed flexibly). |
| **Why** | Folder header + fallback item list if items API empty. |
| **How** | `wardrobeFolderService.getFolderDetails` → `apiClient.get`. |
| **UI** | `FolderDetailScreen`. |

| | |
|---|---|
| **Method** | PUT (JSON) |
| **What** | Updates folder name, description, color, sort order. |
| **Why** | User edits folder from detail screen. |
| **How** | `wardrobeFolderService.updateFolder` → `apiClient.put`. |
| **UI** | Folder detail edit modal. |

| | |
|---|---|
| **Method** | DELETE |
| **What** | Deletes folder (server decides item behavior). |
| **Why** | User removes a closet they no longer want. |
| **How** | `wardrobeFolderService.deleteFolder` → `apiClient.delete`. |
| **UI** | Folder detail delete confirmation. |

---

### Wardrobe — `/wardrobe/items`

| | |
|---|---|
| **Method** | GET (query: `search`, `folder_id`, `category`, `season`, `occasion`, `is_favorite`, `color`, `brand`, …) |
| **What** | Lists clothing items with filters. |
| **Why** | Folder grid should reflect server truth; filters for browse/search UIs. |
| **How** | `wardrobeItemService.listItems` → `apiClient.get` with `query` object. |
| **UI** | `FolderDetailScreen` (with `folder_id`). |

| | |
|---|---|
| **Method** | POST (**multipart**) |
| **What** | Creates an item with image + metadata. |
| **Why** | User adds a garment to a folder. |
| **How** | `wardrobeItemService.createItem` → `prepareProfileImageForUpload` on image URI → `FormData` → `apiClient.post`. |
| **UI** | `EditItemDetailsScreen` (create mode). |

---

### Wardrobe — `/wardrobe/items/:id`

| | |
|---|---|
| **Method** | GET |
| **What** | Fetches one item for detail/edit. |
| **Why** | Refresh details after navigation; ensure latest fields. |
| **How** | `wardrobeItemService.getItem` → `apiClient.get`. |
| **UI** | `ItemDetailsViewScreen`, `EditItemDetailsScreen` (edit mode). |

| | |
|---|---|
| **Method** | PUT (**multipart**) |
| **What** | Updates item fields and optionally replaces image. |
| **Why** | User edits metadata or photo. |
| **How** | `wardrobeItemService.updateItem` → `apiClient.put` + optional file in `FormData`. |
| **UI** | `EditItemDetailsScreen` (edit mode). |

| | |
|---|---|
| **Method** | DELETE |
| **What** | Deletes the item. |
| **Why** | User removes a piece from wardrobe. |
| **How** | `wardrobeItemService.deleteItem` → `apiClient.delete`. |
| **UI** | Item details / edit delete flows. |

---

### Wardrobe — `/wardrobe/items/:id/image`

| | |
|---|---|
| **Method** | POST (**multipart**) |
| **What** | Updates only the item’s image. |
| **Why** | Smaller payload when only the photo changes. |
| **How** | `wardrobeItemService.updateItemImage` → `FormData` field **`image`**. |
| **UI** | Can be wired from edit flow (combined update also supported). |

---

### Wardrobe — `/wardrobe/search`

| | |
|---|---|
| **Method** | GET (`query`, optional `per_page`) |
| **What** | Server-side wardrobe search. |
| **Why** | Global search across items. |
| **How** | `wardrobeItemService.searchItems` → `apiClient.get`. |
| **UI** | Ready for search UI; wire when product requires. |

---

### Wardrobe — `/wardrobe/outfits` and `/wardrobe/saved-outfits`

| | |
|---|---|
| **Method** | GET / POST / DELETE (see `wardrobeService.ts`) |
| **What** | List outfits, list saved outfits, save, unsave. |
| **Why** | Outfit builder / saved looks. |
| **How** | `wardrobeService` → `apiClient`. |
| **UI** | Outfit-related screens; **may 404** on some servers — handle empty states. |

---

### Payments — `/payments/...`

| | |
|---|---|
| **What** | UPI verify/pay, card charge, net banking, PayPal. |
| **Why** | Checkout when enabled. |
| **How** | `paymentService` → `apiClient.post` per method. |
| **UI** | Payment flows when integrated end-to-end. |

---

## Part D — Quick “if you change the backend” checklist

1. Update **official doc** (linked at top) and share with mobile team.  
2. Update **`sos-app/src/api/endpoints.ts`** if paths change.  
3. Update the matching **`src/services/*.ts`** mapper / types.  
4. Update **`docs/API_INTEGRATION_GUIDE.md`** and **`memory.md`**.  
5. Add/adjust UI: loading, disabled submit, **`notify`** on errors.

---

## Part E — Document history

| Date | Change |
|------|--------|
| 2026-04-18 | Initial guide from repo + `memory.md`. Official Style On Spot API viewer URL recorded in Cursor rules. Automated fetch to viewer returned **401**; content not imported verbatim from that URL. |
