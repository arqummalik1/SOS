export const API_ENDPOINTS = {
  auth: {
    requestOtp: '/auth/send-otp',
    resendOtp: '/auth/resend-otp',
    verifyOtp: '/auth/verify-otp',
    refreshToken: '/auth/refresh-token',
    /** Legacy; prefer `session.logout` for app session end. */
    logout: '/auth/logout',
  },
  /** Session: POST `/logout` — Bearer only, no body (Hoppscotch). */
  session: {
    logout: '/logout',
  },
  onboarding: {
    status: '/onboarding/status',
    profileImage: '/onboarding/profile-image',
    fullBodyImage: '/onboarding/full-body-image',
    basicDetails: '/onboarding/basic-details',
    bodyShape: '/onboarding/body-shape',
    skinToneStyle: '/onboarding/skin-tone-style',
    complete: '/onboarding/complete',
  },
  user: {
    profileSetup: '/users/me/profile-setup',
  },
  /** Profile: GET + PUT `/profile` (Hoppscotch). */
  profile: {
    detail: '/profile',
  },
  wardrobe: {
    outfits: '/wardrobe/outfits',
    savedOutfits: '/wardrobe/saved-outfits',
    folders: '/wardrobe/folders',
    items: '/wardrobe/items',
    itemSearch: '/wardrobe/search',
  },
  payment: {
    upiVerify: '/payments/upi/verify',
    upiPay: '/payments/upi/pay',
    cardCharge: '/payments/card/charge',
    netBankingCharge: '/payments/net-banking/charge',
    paypalCharge: '/payments/paypal/charge',
  },
} as const;
