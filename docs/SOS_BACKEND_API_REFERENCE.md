# SOS backend API reference (Mobile API v1)

**Source of truth:** exported Hoppscotch collection in `docs/completeAPIDocumentation.html` (same as online viewer).
**App implementation:** `sos-app/src/api/endpoints.ts`, `client.ts`, `services/*`.
**Human flow guide:** `docs/API_INTEGRATION_GUIDE.md`.

---

## 1. Environment and base URL

| Variable | Example | Notes |
|----------|---------|-------|
| `EXPO_PUBLIC_API_BASE_URL` | `https://app.styleonspot.com/api/v1` | Must include `/api/v1`; paths in `endpoints.ts` are relative (no second `/v1`). |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | `15000` | Optional; used by `apiClient`. |
| `EXPO_PUBLIC_STORAGE_BASE_URL` | CDN / storage host | Optional; resolves relative `/storage/...` URLs for images. |

---

## 2. Headers and authentication

### 2.1 Public routes (no Bearer)

- `POST /auth/send-otp` — JSON `{"phone":"+91..."}`
- `POST /auth/verify-otp` — JSON `{"phone","otp","name"?}` — response includes **access** + **refresh** tokens (shape normalized in `authService`).

### 2.2 Authenticated routes

- `Authorization: Bearer <access_token>` on every call except public auth and refresh body-only refresh call uses its own body.
- `Accept: application/json`
- JSON bodies: `Content-Type: application/json`
- Multipart: **do not** force JSON content-type; `apiClient` sends `FormData` without overriding.

### 2.3 Refresh (implemented in app, often omitted from static HTML export)

| Method | Path | Body |
|--------|------|------|
| POST | `/auth/refresh-token` | `{ "refreshToken": "..." }` (see `tokenManager` / `client.ts`) |

### 2.4 Standard success envelope (typical)

```json
{ "success": true, "data": { }, "message": "..." }
```

Errors: `success: false` and/or HTTP status; normalized to `ApiError` in `sos-app/src/api/errors.ts`.

---

## 3. App integration status (this repo)

| Integration | Meaning |
|-------------|---------|
| **integrated** | Called from `services/*` and wired to a screen or context. |
| **partial** | Service exists or route partially used; main UI missing or not calling API. |
| **not_integrated** | Documented in export; no `endpoints.ts` + service + UI path yet. |

### 3.1 UI exists but API not wired (or only service)

- **Wardrobe filters** (`WardrobeFiltersScreen.tsx`) — static chips; **`GET /wardrobe/search`** available as `wardrobeItemService.searchItems`.
- **Virtual try-on history** — **`GET /virtual-tryon`** implemented as `listVirtualTryOns`; no list UI.
- **Subscription / payments** — `paymentService` + `endpoints.ts` payment routes; **checkout UI not fully wired** to those POSTs.
- **Sessions** — doc lists **`GET /sessions`**, **`DELETE /sessions/:id`**; app uses **`POST /logout`** instead; no device list screen.

---

## 4. Endpoint catalog (extracted from HTML export)

Below: **Hoppscotch title(s)**, method, path, auth, content-type, request sample or cURL where extracted. Numeric IDs in paths (e.g. `/wardrobe/items/1`) are **examples** — use real ids from list responses.

### `POST /auth/send-otp`

- **Doc title(s):** Resend OTP, Send OTP (User Login)
- **App status:** **integrated** — authService + SignIn/OTP; Resend uses same path with fallback on 404
- **Auth:** None (public)
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "phone": "<<test_phone>>"
}
```
- **cURL (from doc):**
```bash
curl --request POST \
  --url https://app.styleonspot.com/api/v1/auth/send-otp \
  --header 'Content-Type: application/json' \
  --data '{"phone":"+919876543210"}'
```

### `POST /auth/verify-otp`

- **Doc title(s):** Verify OTP
- **App status:** **integrated** — authService + OTPScreen / AuthContext
- **Auth:** None (public)
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "phone": "<<test_phone>>",
  "otp": "123456",
  "name": "Ananya Gupta"
}
```
- **cURL (from doc):**
```bash
curl --request POST \
  --url https://app.styleonspot.com/api/v1/auth/verify-otp \
  --header 'Content-Type: application/json' \
  --data '{"phone":"+919876543210","otp":"123456","name":"Ananya Gupta"}'
```

### `POST /logout`

- **Doc title(s):** Logout
- **App status:** **integrated** — authService.logout + AuthContext
- **Auth:** Bearer access token
- **Request body:** Optional empty JSON `{}` or no body (Hoppscotch); the block below is a **response** sample, not the request payload:
```
{
  "success": true,
  "data": [],
  "message": "User logged out successfully"
}
```

### `PATCH /onboarding/basic-details`

- **Doc title(s):** Step 2: Basic Details
- **App status:** **integrated** — userService + ProfileSetupScreen
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "name": "Ananya Gupta",
  "height": "160",
  "weight": "58",
  "date_of_birth": "2000-01-01"
}
```
- **cURL (from doc):**
```bash
curl --request PATCH \
  --url https://app.styleonspot.com/api/v1/onboarding/basic-details \
  --header 'content-type: application/json' \
  --data '{"name":"Ananya Gupta","height":"160","weight":"58","date_of_birth":"2000-01-01"}'
```

### `PATCH /onboarding/body-shape`

- **Doc title(s):** Step 4: Body Shape
- **App status:** **integrated** — userService + BodyMeasurementsScreen
- **Auth:** Bearer access token
- **Request content-type:** multipart/form-data
- **Request body (sample from doc):**
```
[
  {
    "key": "body_shape",
    "active": true,
    "isFile": false,
    "value": "apple"
  },
  {
    "key": "custom_body_shape",
    "active": false,
    "isFile": false,
    "value": ""
  }
]
```
- **cURL (from doc):**
```bash
curl --request PATCH \
  --url https://app.styleonspot.com/api/v1/onboarding/body-shape \
  --header 'content-type: multipart/form-data' \
  --form body_shape=apple \
  --form custom_body_shape=
```

### `POST /onboarding/complete`

- **Doc title(s):** Step 6: Onboarding complete
- **App status:** **integrated** — userService.markOnboardingComplete + AuthContext / StylePreferences
- **Auth:** Bearer access token

### `POST /onboarding/full-body-image`

- **Doc title(s):** Step 3: Full Body Image
- **App status:** **integrated** — userService + onboarding screens
- **Auth:** Bearer access token
- **Request content-type:** multipart/form-data
- **Request body (sample from doc):**
```
[
  {
    "key": "full_body_image",
    "active": true,
    "isFile": false,
    "value": ""
  }
]
```
- **cURL (from doc):**
```bash
curl --request POST \
  --url https://app.styleonspot.com/api/v1/onboarding/full-body-image \
  --header 'content-type: multipart/form-data' \
  --form full_body_image=
```

### `GET /onboarding/options`

- **Doc title(s):** Onboarding Options
- **App status:** **not_integrated** — Static onboarding UI; no GET options yet
- **Auth:** Bearer access token
- **cURL (from doc):**
```bash
curl --request GET \
  --url https://app.styleonspot.com/api/v1/onboarding/options
```

### `POST /onboarding/profile-image`

- **Doc title(s):** Step 1: Upload Profile Image
- **App status:** **integrated** — userService + onboarding screens
- **Auth:** Bearer access token
- **Request content-type:** multipart/form-data
- **Request body (sample from doc):**
```
[
  {
    "key": "profile_image",
    "active": true,
    "isFile": false,
    "value": ""
  }
]
```
- **cURL (from doc):**
```bash
curl --request POST \
  --url https://app.styleonspot.com/api/v1/onboarding/profile-image \
  --header 'content-type: multipart/form-data' \
  --form profile_image=
```

### `PATCH /onboarding/skin-tone-style`

- **Doc title(s):** Step 5: Skin tone and Style Preference
- **App status:** **integrated** — userService + StylePreferencesScreen
- **Auth:** Bearer access token
- **Request content-type:** multipart/form-data
- **Request body (sample from doc):**
```
[
  {
    "key": "skin_tone",
    "active": true,
    "isFile": false,
    "value": "#F5D0A9"
  },
  {
    "key": "style_preferences[]",
    "active": true,
    "isFile": false,
    "value": "formal"
  },
  {
    "key": "style_preferences[]",
    "active": true,
    "isFile": false,
    "value": "casual"
  }
]
```

### `GET /onboarding/status`

- **Doc title(s):** Get Onboarding Status
- **App status:** **integrated** — authService + AuthContext boot
- **Auth:** Bearer access token
- **Request body:** None (GET).
- **Response sample (from doc):**
```
{
  "success": true,
  "data": {
    "is_onboarding_complete": false,
    "steps": {
      "profile_image": false,
      "basic_details": false,
      "full_body_image": false,
      "body_shape": true,
      "skin_tone_style": true
    }
  },
  "message": "Onboarding status retrieved"
}
```
- **cURL (from doc):**
```bash
curl --request GET \
  --url https://app.styleonspot.com/api/v1/onboarding/status
```

### `GET /profile`

- **Doc title(s):** Get Profile
- **App status:** **integrated** — userService GET/PUT + UserContext + EditProfile
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{}
```

### `PUT /profile`

- **Doc title(s):** Update Profile
- **App status:** **integrated** — userService GET/PUT + UserContext + EditProfile
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "name": "Mohd Akram"
}
```

### `GET /sessions`

- **Doc title(s):** Sessions
- **App status:** **not_integrated** — No session list UI
- **Auth:** Bearer access token
- **Request body (sample from doc):**
```
{
  "success": true,
  "data": [
    {
      "id": 9,
      "name": "SOS-Admin",
      "created_at": "2 minutes ago",
      "last_used_at": "0 seconds ago",
      "is_current": true
    }
  ],
  "message": "Active sessions retrieved"
}
```
- **cURL (from doc):**
```bash
curl --request GET \
  --url https://app.styleonspot.com/api/v1/sessions
```

### `DELETE /sessions/9`

- **Doc title(s):** Delete session
- **App status:** **not_integrated** — No revoke-session UI
- **Auth:** Bearer access token
- **Request body (sample from doc):**
```
{
  "success": true,
  "data": [],
  "message": "Session revoked successfully."
}
```
- **cURL (from doc):**
```bash
curl --request DELETE \
  --url https://app.styleonspot.com/api/v1/sessions/9
```

### `GET /virtual-tryon`

- **Doc title(s):** List Virtual try-ons
- **App status:** **partial** — virtualTryOnService.listVirtualTryOns — no history list UI
- **Auth:** Bearer access token

### `POST /virtual-tryon`

- **Doc title(s):** Initiate Virtual try-on
- **App status:** **integrated** — VirtualTryOnScreen initiate
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  // "outfit_id": "",
  "wardrobe_item_id": 3,
  // "garment_image": "", // Direct garment upload (e.g., inspiration photo)
  // "category": "tops", // tops,bottoms,one-piece,auto (defaults: auto)
  // "mode": "", // balanced,quality (defaults: balanced)
}
```

### `DELETE /virtual-tryon/1`

- **Doc title(s):** Delete: Virtual try-on
- **App status:** **integrated** — VirtualTryOnScreen long-press
- **Auth:** Bearer access token
- **Request body (sample from doc):**
```
{
  "success": true,
  "data": [],
  "message": "Try-on deleted successfully."
}
```

### `POST /virtual-tryon/1/lookbook`

- **Doc title(s):** Save to Lookbook: Virtual try-on
- **App status:** **integrated** — VirtualTryOnScreen bookmark
- **Auth:** Bearer access token

### `POST /virtual-tryon/1/rate`

- **Doc title(s):** Rate: Virtual try-on
- **App status:** **integrated** — VirtualTryOnScreen star
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "rating": 5 //nullable|integer|min:1|max:5 (null clears the rating)
}
```

### `POST /virtual-tryon/1/react`

- **Doc title(s):** React: Virtual try-on
- **App status:** **integrated** — VirtualTryOnScreen heart/thumbs
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "reaction": "liked" //nullable|in:liked,disliked (null means no reaction)
}
```

### `POST /virtual-tryon/1/regenerate`

- **Doc title(s):** Regenerate: Virtual try-on
- **App status:** **integrated** — VirtualTryOnScreen shuffle
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  // "category": "", // nullable|in:tops,bottoms,one-piece,auto
  // "mode": "" // nullable|in:balanced,quality
}
```

### `POST /virtual-tryon/1/schedule`

- **Doc title(s):** Schedule: Virtual try-on
- **App status:** **integrated** — VirtualTryOnScreen calendar
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "scheduled_for": "2026-03-22 10:00:00" // nullable|date|after_or_equal:today
}
```

### `GET /virtual-tryon/94`

- **Doc title(s):** Status: Virtual try-on
- **App status:** **integrated** — Polling getVirtualTryOn
- **Auth:** Bearer access token

### `GET /wardrobe/analytics`

- **Doc title(s):** Wardrobe Items Analytics
- **App status:** **not_integrated** — No analytics dashboard
- **Auth:** Bearer access token

### `GET /wardrobe/folders`

- **Doc title(s):** List Folders
- **App status:** **integrated** — wardrobeFolderService + MyWardrobeScreen
- **Auth:** Bearer access token

### `POST /wardrobe/folders`

- **Doc title(s):** Create folder
- **App status:** **integrated** — CreateFolderModal
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "name": "Work Outfits",
  "description": "Professional clothes for office",
  "color_code": "#2563eb"
}
```

### `GET /wardrobe/folders/1`

- **Doc title(s):** Get Folder Details
- **App status:** **integrated** — FolderDetailScreen
- **Auth:** Bearer access token

### `PUT /wardrobe/folders/1`

- **Doc title(s):** Update Folder
- **App status:** **integrated** — FolderDetailScreen
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "name": "Work Outfits",
  "description": "Professional clothes for office",
  "color_code": "#2563eb",
  "order": 0 // default to 0
}
```

### `DELETE /wardrobe/folders/2`

- **Doc title(s):** Delete Folder
- **App status:** **integrated** — FolderDetailScreen
- **Auth:** Bearer access token
- **Request content-type:** text/plain
- **Request body (sample from doc):**
```
{
  "name": "Work Outfits",
  "description": "Professional clothes for office",
  "color_code": "#2563eb",
  "order": 0 // default to 0
}
```

### `POST /wardrobe/folders/reorder`

- **Doc title(s):** Reorder Folders (Single/Bulk)
- **App status:** **not_integrated** — No reorder UI wired
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "folders": [
    {
        "id": 1,
        "order": 0
    }
  ]
}
// {
//   "folders": [
//     {
//         "id": 1,
//         "order": 1
//     },
//     {
//         "id": 2,
//         "order": 0
//     }
//   ]
// }
```

### `GET /wardrobe/items`

- **Doc title(s):** List all items with filters
- **App status:** **integrated** — wardrobeItemService.listItems + FolderDetail
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{}
```

### `POST /wardrobe/items`

- **Doc title(s):** Create new wardrobe item
- **App status:** **integrated** — EditItemDetailsScreen create
- **Auth:** Bearer access token
- **Request content-type:** multipart/form-data
- **Request body (sample from doc):**
```
[
  {
    "key": "name",
    "active": true,
    "isFile": false,
    "value": "Red Overcoat"
  },
  {
    "key": "category",
    "active": true,
    "isFile": false,
    "value": "top"
  },
  {
    "key": "brand",
    "active": true,
    "isFile": false,
    "value": "Gucci"
  },
  {
    "key": "purchase_price",
    "active": true,
    "isFile": false,
    "value": "15000"
  },
  {
    "key": "folder_id",
    "active": true,
    "isFile": false,
    "value": "1"
  },
  {
    "key": "seasons[]",
    "active": true,
    "isFile": false,
    "value": "winter"
  },
  {
    "key": "occasions[]",
    "active": true,
    "isFile": false,
    "value": "work"
  },
  {
    "key": "occasions[]",
    "active": true,
    "isFile": false,
    "value": "formal"
  },
  {
    "key": "image",
    "active": true,
    "isFile": false,
    "value": ""
  }
]
```

### `GET /wardrobe/items-usage/summary`

- **Doc title(s):** All Items Usage Summary
- **App status:** **not_integrated** — No usage history UI
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "from_date": "2026-02-01",
  "to_date": "2026-02-28"
}
```

### `GET /wardrobe/items-usage/usage/11`

- **Doc title(s):** Item Usage
- **App status:** **not_integrated** — No usage history UI
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "from_date": "2026-02-28",
  "to_date": "2026-02-28",
  "occasion": null
}
```

### `DELETE /wardrobe/items-usage/usage/2`

- **Doc title(s):** Delete Item Usage
- **App status:** **not_integrated** — No usage history UI
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{}
```

### `GET /wardrobe/items-usage/usages`

- **Doc title(s):** All Items Usage
- **App status:** **not_integrated** — No usage history UI
- **Auth:** Bearer access token
- **Request content-type:** application/json
- **Request body (sample from doc):**
```
{
  "from_date": "2026-02-26",
  "to_date": "2026-02-28",
  "occasion": null
}
```

### `DELETE /wardrobe/items/1`

- **Doc title(s):** Delete Wardrobe item
- **App status:** **integrated** — EditItemDetails + ItemDetailsView
- **Auth:** Bearer access token

### `GET /wardrobe/items/1`

- **Doc title(s):** List Wardrobe item
- **App status:** **integrated** — ItemDetailsView + EditItemDetails
- **Auth:** Bearer access token
- **Request content-type:** text/plain

### `PUT /wardrobe/items/1`

- **Doc title(s):** Update wardrobe item
- **App status:** **integrated** — EditItemDetails + ItemDetailsView
- **Auth:** Bearer access token
- **Request content-type:** multipart/form-data
- **Request body (sample from doc):**
```
[
  {
    "key": "name",
    "active": true,
    "isFile": false,
    "value": "Red Overcoat"
  },
  {
    "key": "description",
    "active": true,
    "isFile": false,
    "value": ""
  },
  {
    "key": "category",
    "active": true,
    "isFile": false,
    "value": "top"
  },
  {
    "key": "subcategory",
    "active": true,
    "isFile": false,
    "value": ""
  },
  {
    "key": "color",
    "active": true,
    "isFile": false,
    "value": "#3e0e0e"
  },
  {
    "key": "brand",
    "active": true,
    "isFile": false,
    "value": "Gucci"
  },
  {
    "key": "material",
    "active": true,
    "isFile": false,
    "value": "woolen"
  },
  {
    "key": "size",
    "active": true,
    "isFile": false,
    "value": "XL"
  },
  {
    "key": "purchase_price",
    "active": true,
    "isFile": false,
    "value": "15000"
  },
  {
    "key": "folder_id",
    "active": true,
    "isFile": false,
    "value": "1"
  },
  {
    "key": "seasons[]",
    "active": true,
    "isFile": false,
    "value": "winter"
  },
  {
    "key": "occasions[]",
    "active": true,
    "isFile": false,
    "value": "work"
  },
  {
    "key": "occasions[]",
    "active": true,
    "isFile": false,
    "value": "formal"
  },
  {
    "key": "product_url",
    "active": true,
    "isFile": false,
    "value": ""
  },
  {
    "key": "is_favorite",
    "active": true,
    "isFile": false,
    "value": "1"
  },
  {
    "key": "image",
    "active": false,
    "isFile": false,
    "value": ""
  }
]
```

### `POST /wardrobe/items/1/image`

- **Doc title(s):** Update Item image
- **App status:** **integrated** — wardrobeItemService.updateItemImage
- **Auth:** Bearer access token
- **Request content-type:** multipart/form-data
- **Request body (sample from doc):**
```
[
  {
    "key": "image",
    "active": true,
    "isFile": false,
    "value": ""
  }
]
```

### `POST /wardrobe/items/1/track-usage`

- **Doc title(s):** Item Track Usage
- **App status:** **not_integrated** — No wear-tracking UI
- **Auth:** Bearer access token
- **Request content-type:** multipart/form-data
- **Request body (sample from doc):**
```
[
  {
    "key": "worn_date",
    "active": true,
    "isFile": false,
    "value": "2026-02-26"
  },
  {
    "key": "occasion",
    "active": true,
    "isFile": false,
    "value": "Meeting"
  },
  {
    "key": "outfit_id",
    "active": true,
    "isFile": false,
    "value": ""
  },
  {
    "key": "notes",
    "active": true,
    "isFile": false,
    "value": "Testing tracking usage"
  }
]
```

### `POST /wardrobe/items/bulk-delete`

- **Doc title(s):** Bulk Delete Wardrobe Items
- **App status:** **not_integrated** — No multi-select delete flow
- **Auth:** Bearer access token
- **Request content-type:** multipart/form-data
- **Request body (sample from doc):**
```
[
  {
    "key": "item_ids[]",
    "active": true,
    "isFile": false,
    "value": "2"
  },
  {
    "key": "item_ids[]",
    "active": true,
    "isFile": false,
    "value": "3"
  }
]
```

### `GET /wardrobe/search`

- **Doc title(s):** Search Item
- **App status:** **partial** — wardrobeItemService.searchItems — WardrobeFiltersScreen UI exists but does not call API
- **Auth:** Bearer access token
- **Request content-type:** multipart/form-data
- **Request body (sample from doc):**
```
[]
```

---

## 5. App-only routes (in `endpoints.ts`, not in Hoppscotch export)

| Path | Purpose |
|------|---------|
| `/auth/refresh-token` | Token refresh after 401 |
| `/auth/logout` | Legacy logout fallback |
| `/users/me/profile-setup` | Legacy profile setup POST |
| `/wardrobe/outfits` | Featured/trending outfits (`wardrobeService`) — **not deployed** on current production (404). App skips these calls unless `EXPO_PUBLIC_WARDROBE_OUTFIT_API_ENABLED=true`. |
| `/wardrobe/saved-outfits` | Saved outfit ids + save/unsave — same gate as above. |
| `/payments/upi/verify` | UPI verify |
| `/payments/upi/pay` | UPI pay |
| `/payments/card/charge` | Card |
| `/payments/net-banking/charge` | Net banking |
| `/payments/paypal/charge` | PayPal |

---

## 6. Multipart field names (quick reference)

| Endpoint | Fields |
|----------|--------|
| `POST /onboarding/profile-image` | `profile_image` (file) |
| `POST /onboarding/full-body-image` | `full_body_image` (file) |
| `PATCH /onboarding/body-shape` | `body_shape`, optional `custom_body_shape` |
| `PATCH /onboarding/skin-tone-style` | `skin_tone`, repeated `style_preferences[]` |
| `POST /wardrobe/items` | many + `image` — see Hoppscotch / `wardrobeItemService` |
| `PUT /wardrobe/items/:id` | partial multipart |
| `POST /wardrobe/items/:id/image` | `image` (file) |

---

## 7. Revision

| Date | Notes |
|------|-------|
| 2026-04-18 | Generated from `docs/completeAPIDocumentation.html` + manual integration map + app-only routes. |
