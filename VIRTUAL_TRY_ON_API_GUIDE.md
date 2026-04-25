# Virtual Try-On API Integration Guide

## Overview
Complete flow from clicking "Virtual Try-On" button to final image generation.

---

## API Endpoints

### 1. INITIATE Virtual Try-On (POST)
**Endpoint:** `POST /virtual-tryon`
**File:** `src/services/virtualTryOnService.ts:97`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

**Request Body (Wardrobe Item):**
```json
{
  "wardrobe_item_id": 123,
  "category": "tops",        // or "bottoms", "one-piece", "auto"
  "mode": "balanced"         // or "quality"
}
```

**Request Body (Outfit):**
```json
{
  "outfit_id": 456,
  "category": "auto",
  "mode": "balanced"
}
```

**Response (Success - 200):**
```json
{
  "data": {
    "id": "789",
    "status": "pending",              // pending → processing → completed/failed
    "wardrobe_item_id": 123,
    "outfit_id": null,
    "category": "tops",
    "mode": "balanced",
    "model_image_url": "https://cdn.example.com/models/model-001.png",
    "garment_image_url": "https://cdn.example.com/garments/item-123.png",
    "result_image_url": null,          // NULL until completed
    "processed_result_image_url": null, // NULL until completed
    "created_at": "2026-01-15T10:30:00Z"
  }
}
```

**Model Mapping:** (`mapRowToVirtualTryOn:32`)
- `result_image_url` → `resultImageUrl`
- `processed_result_image_url` → `processedResultImageUrl`
- `model_image_url` → `modelImageUrl` (ghost image during generation)

---

### 2. GET Virtual Try-On Status (GET)
**Endpoint:** `GET /virtual-tryon/:id`
**File:** `src/services/virtualTryOnService.ts:118`

**Headers:**
```
Authorization: Bearer <access_token>
Accept: application/json
```

**Response (Processing):**
```json
{
  "data": {
    "id": "789",
    "status": "processing",
    "result_image_url": null,
    "processed_result_image_url": null,
    "model_image_url": "https://cdn.example.com/models/model-001.png"
  }
}
```

**Response (Completed):**
```json
{
  "data": {
    "id": "789",
    "status": "completed",
    "result_image_url": "https://cdn.example.com/results/789-raw.png",
    "processed_result_image_url": "https://cdn.example.com/results/789-processed.png",
    "model_image_url": "https://cdn.example.com/models/model-001.png"
  }
}
```

---

### 3. Other Virtual Try-On APIs

| Action | Endpoint | Method | Body |
|--------|----------|--------|------|
| **List All** | `/virtual-tryon` | GET | - |
| **Delete** | `/virtual-tryon/:id` | DELETE | - |
| **React (Like)** | `/virtual-tryon/:id/react` | POST | `{ "reaction": "liked" \| "disliked" \| null }` |
| **Rate (Star)** | `/virtual-tryon/:id/rate` | POST | `{ "rating": 5 \| null }` |
| **Regenerate** | `/virtual-tryon/:id/regenerate` | POST | `{ "category": "tops", "mode": "balanced" }` |
| **Save to Lookbook** | `/virtual-tryon/:id/lookbook` | POST | `{}` |
| **Schedule** | `/virtual-tryon/:id/schedule` | POST | `{ "scheduled_for": "2026-01-20T14:00:00Z" }` |

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  USER clicks "Virtual Try-On" on Item Details Screen                     │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: NAVIGATION                                                      │
│  File: ItemDetailsViewScreen.tsx:213                                     │
│  Action: navigation.navigate('VirtualTryOn', { selectedItem: item })   │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: BOOTSTRAP EFFECT RUNS                                           │
│  File: VirtualTryOnScreen.tsx:234                                        │
│  Guard: Checks hasInitiatedRef / tryOn?.id to prevent re-initiation      │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: API CALL - INITIATE                                             │
│  File: VirtualTryOnScreen.tsx:264                                        │
│  API: POST /virtual-tryon                                                │
│  Body: { wardrobe_item_id: 123, category: "tops", mode: "balanced" }     │
│  Console Log: "[API - INITIATE] POST /virtual-try-on..."                 │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: SET INITIAL STATE                                               │
│  Status: "pending" or "processing"                                       │
│  showModelGhost: true (shows model_image_url as ghost overlay)          │
│  showAiOverlay: true (shows "AI is generating your look...")             │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: START POLLING (every 2200ms)                                    │
│  File: VirtualTryOnScreen.tsx:184                                        │
│  API: GET /virtual-tryon/:id                                             │
│  Console Log: "[API - POLLING] GET /virtual-try-on/:id..."               │
└─────────────────┬───────────────────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                 ▼
   ┌──────────┐      ┌──────────┐
   │COMPLETED │      │ FAILED   │
   └────┬─────┘      └────┬─────┘
        │                 │
        ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│STOP POLLING     │ │STOP POLLING     │
│showAiOverlay:   │ │showAiOverlay:   │
│  false          │ │  false          │
│                 │ │                 │
│Image Display:   │ │Image Display:   │
│result_image_url │ │garment_image_url│
│OR               │ │(fallback)       │
│processed_result │ │                 │
│_image_url       │ │                 │
└─────────────────┘ └─────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│ STEP 6: FINAL IMAGE DISPLAY                 │
│ Console Log: "[API - COMPLETED] Virtual      │
│  try-on generation COMPLETE -              │
│  Final Image URL: ..."                      │
│                                             │
│ Priority for display:                       │
│ 1. resultImageUrl (raw AI result)           │
│ 2. processedResultImageUrl (processed)      │
│ 3. garmentImageUrl (fallback)               │
│ 4. selectedItemUri (local image - last resort)
└─────────────────────────────────────────────┘
```

---

## Image URL Priority (Display Logic)

File: `VirtualTryOnScreen.tsx:115`

**When status is "completed":**
```javascript
const u = tryOn.resultImageUrl || 
          tryOn.processedResultImageUrl || 
          tryOn.garmentImageUrl || 
          selectedItemUri;
```

**Display Order:**
1. `resultImageUrl` (raw AI generated image)
2. `processedResultImageUrl` (post-processed/enhanced)
3. `garmentImageUrl` (original garment - fallback)
4. `selectedItemUri` (local image - last resort)

---

## Key Console Logs (Active)

| Log Pattern | When | Data Shown |
|-------------|------|------------|
| `[API - INITIATE]` | User clicks try-on | Item ID, Category, Item Name |
| `[API - POLLING]` | Every 2.2 seconds | Status, Result URL |
| `[API - COMPLETED]` | Generation done | **Final Image URL** |
| `[API - BOOTSTRAP]` | Loading existing | Status, Result URL |
| `[API - REGENERATE]` | Shuffle button | New ID, Status |
| `[GUARD]` | Prevented re-initiation | - |

---

## Full Body Image Upload Flow (Root Cause of Head/Feet Cutting)

### Flow Overview

Before virtual try-on can generate results, the user must upload a full body photo during onboarding. This photo is used as the `model_image_url` reference in virtual try-on generation.

**Flow:**
1. User captures/selects full body photo → `FullBodyCameraScreen.tsx`
2. Preview the photo → `FullBodyPhotoPreviewScreen.tsx`
3. Upload to backend → `userService.uploadFullBodyImage()`
4. Image processing → `prepareFullBodyImageForUpload.ts` ← **CROPPING WAS HERE**
5. Backend stores as `full_body_image_url` in user profile
6. Virtual try-on uses this as `model_image_url` reference

### Root Cause (FIXED)

**File:** `src/utils/prepareFullBodyImageForUpload.ts`

**The Problem (Before Fix):**
```javascript
// Center-crop to 9:16 aspect ratio
if (srcRatio > targetRatio) {
  cropH = h;
  cropW = Math.floor((h * ASPECT_W) / ASPECT_H);
  originX = Math.floor((w - cropW) / 2);
  originY = 0;
} else {
  cropW = w;
  cropH = Math.floor((w * ASPECT_H) / ASPECT_W);
  originX = 0;
  originY = Math.floor((h - cropH) / 2); // ← CUTS HEAD & FEET
}
```

When the user's photo was taller than 9:16, it cropped equally from top and bottom (`originY = (h - cropH) / 2`), which removed the head and feet before the image was even sent to the backend.

**The Fix (After Fix):**
```javascript
// Only resize to max dimensions - NO CROPPING to preserve head and feet
if (longEdge > MAX_LONG_EDGE) {
  if (w >= h) {
    actions.push({ resize: { width: MAX_LONG_EDGE } });
  } else {
    actions.push({ resize: { height: MAX_LONG_EDGE } });
  }
}
```

**What Changed:**
- ✅ Removed center crop logic entirely
- ✅ Only resize to max 1280px on longest edge
- ✅ Preserve original aspect ratio
- ✅ Head and feet are never cut
- ✅ Full size image sent to backend

**Console Log After Fix:**
```
[SOS_FULL_BODY_IMAGE] prepare: pipeline {
  sourceW: 1920,
  sourceH: 2560,
  aspectRatio: "1.33",
  resized: true,
  note: "NO CROPPING - preserving original aspect ratio to keep head and feet"
}
[SOS_FULL_BODY_IMAGE] prepare: encoded {
  width: 960,
  height: 1280,
  aspectRatio: "1.33",
  format: "jpeg",
  quality: 0.78
}
```

### Impact on Virtual Try-On

**Before Fix:**
- User uploads full body photo → cropped to 9:16 → head/feet cut
- Backend receives cropped image → uses as model reference
- Virtual try-on generates based on cropped reference → output also cropped

**After Fix:**
- User uploads full body photo → resized only → head/feet preserved
- Backend receives full image → uses as model reference
- Virtual try-on generates based on full reference → output should be full

### How to Verify the Fix

**1. Upload a new full body photo:**
- Go through onboarding or profile setup
- Capture/select a full body photo
- Check console for `[SOS_FULL_BODY_IMAGE] prepare: pipeline` log
- Verify `note: "NO CROPPING - preserving original aspect ratio to keep head and feet"`

**2. Generate a virtual try-on:**
- Select a wardrobe item
- Click "Virtual Try-On"
- Wait for generation to complete
- Check console for `[API - COMPLETED]` log with all image URLs

**3. Verify the output:**
- Copy the `processed_result_image_url` from console
- Open in browser
- Check if head and feet are visible

---

## Debugging Head/Feet Cutting Issue

### Checklist for Backend Developer:

**1. Check the RAW Image URL (from console logs):**
```
[API - COMPLETED] Virtual try-on generation COMPLETE -
Final Image URL: https://your-cdn.com/results/789-raw.png
```
Copy this URL and open in browser. Check if:
- ✅ Head is visible at top
- ✅ Feet are visible at bottom
- ✅ Full body portrait (not cropped)

**2. Check Processed Image URL:**
```
[API - POLLING] Response status: completed -
Result URL: https://your-cdn.com/results/789-raw.png
```
Also check `processed_result_image_url` if different from `result_image_url`.

**3. Response Fields to Verify:**
```json
{
  "result_image_url": "MUST_SHOW_FULL_BODY",
  "processed_result_image_url": "MUST_SHOW_FULL_BODY",
  "model_image_url": "FULL_BODY_MODEL_REFERENCE"
}
```

**4. Common Issues:**
| Issue | Backend Fix |
|-------|-------------|
| Image cropped at head | Return 2:3 or 9:16 aspect ratio image |
| Image cropped at feet | Add bottom padding in generation |
| Face not visible | Model positioning too high |
| Wrong proportions | Check model vs garment scaling |

---

## Frontend Display Configuration

**Current Settings:** (VirtualTryOnScreen.tsx)
```javascript
const contentWidth = Math.min(430, width - 24);
const heroHeight = Math.round(contentWidth * 1.7);  // ~731px
resizeMode = "contain";  // Shows FULL image, no cropping
```

**If backend sends full image but it's still cut:**
- Increase `heroHeight` ratio (try 2.0 or 2.2)
- Remove `overflow: 'hidden'` from container
- Check actual image dimensions in console log

---

## Quick Debug Commands

**1. Check if image is full in browser:**
```javascript
// Copy from console and paste in browser address bar:
https://your-cdn.com/results/789-raw.png
```

**2. Verify API response manually:**
```bash
curl -H "Authorization: Bearer <token>" \
  https://api.yoursite.com/virtual-tryon/789
```

**3. Check image dimensions:**
```javascript
// In browser console on the image:
const img = new Image();
img.src = "https://your-cdn.com/results/789-raw.png";
img.onload = () => console.log(img.width, img.height);
// Should be like: 512 x 896 (portrait) or similar
```

---

## Model Schema (VirtualTryOn.model.ts)

```typescript
interface VirtualTryOn {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Image URLs (CRITICAL for debugging)
  modelImageUrl: string | null;           // Ghost image during generation
  garmentImageUrl: string | null;         // Original clothing item
  resultImageUrl: string | null;          // AI generated (RAW)
  processedResultImageUrl: string | null; // Post-processed/enhanced
  
  // Other fields
  wardrobeItemId: string | null;
  outfitId: string | null;
  category: string;
  mode: string;
  reaction: 'liked' | 'disliked' | null;
  rating: number | null;
  isSavedToLookbook: boolean;
  scheduledFor: string | null;
  createdAt: string | null;
}
```
