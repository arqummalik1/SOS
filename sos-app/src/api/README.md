# API Integration Foundation

This folder is the centralized networking layer for the app.

## Structure

- `config.ts`: runtime API configuration (`EXPO_PUBLIC_API_BASE_URL`, timeout).
- `endpoints.ts`: single source of truth for endpoint paths.
- `client.ts`: HTTP client with:
  - auth header injection
  - timeout handling
  - standardized response parsing
  - normalized errors
  - automatic access token refresh on `401`
- `errors.ts`: app-level `ApiError` model and error mapping.
- `tokenManager.ts`: access/refresh token persistence in AsyncStorage.
- `types.ts`: shared request/response typing helpers.

## How to Add a New API Call

1. Add endpoint path in `endpoints.ts`.
2. Add typed method in a feature service under `src/services`.
3. Consume that service from context/viewmodel/hook.
4. Avoid calling `fetch` directly in screens.

## Auth Refresh Flow

1. Request fails with `401`.
2. `apiClient` uses refresh token from `tokenManager`.
3. If refresh succeeds, request is retried once.
4. If refresh fails, tokens are cleared and an auth error is thrown.

## Error Handling Contract

All thrown network errors should be `ApiError` with:

- `code`: categorized error (`NETWORK_ERROR`, `TIMEOUT`, `UNAUTHORIZED`, etc.).
- `message`: user-safe message.
- `status`: optional HTTP status code.
- `isRetryable`: whether retry can be offered.

Use `toApiError(...)` when normalizing unknown exceptions in hooks/viewmodels.
