export type AccessTokenProvider = () => string | null | Promise<string | null>;
export type RefreshTokenHook = () => Promise<string | null>;

let accessTokenProvider: AccessTokenProvider | null = null;
let refreshTokenHook: RefreshTokenHook | null = null;

export function setAccessTokenProvider(provider: AccessTokenProvider | null): void {
  accessTokenProvider = provider;
}

export function setRefreshTokenHook(hook: RefreshTokenHook | null): void {
  refreshTokenHook = hook;
}

export async function getAccessToken(): Promise<string | null> {
  return accessTokenProvider ? accessTokenProvider() : null;
}

export async function refreshAccessToken(): Promise<string | null> {
  return refreshTokenHook ? refreshTokenHook() : null;
}
