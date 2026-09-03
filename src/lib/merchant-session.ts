/**
 * Mirror of pgx_merchant persistMerchantLoginSession.
 * Tokens must be written on the merchant origin (parent :3001), not the iframe.
 */

export const PGX_MERCHANT_LOGIN_MESSAGE = "pgx-merchant-login";

type MerchantLoginUser = {
  roles?: string | null;
  password?: string;
  confirmpassword?: string;
  googleAuthSecret?: string;
  jsonUploadDocuments?: unknown;
  twoFactorEnabled?: boolean | null;
  [key: string]: unknown;
};

export function sanitizeMerchantUser(user: MerchantLoginUser): MerchantLoginUser {
  const roles = String(user.roles || "CUSTOMER").trim() || "CUSTOMER";
  const safe: MerchantLoginUser = { ...user, roles };
  delete safe.password;
  delete safe.confirmpassword;
  delete safe.googleAuthSecret;
  delete safe.jsonUploadDocuments;
  return safe;
}

export function persistMerchantLoginSession(
  user: MerchantLoginUser | null | undefined,
  jwtToken: string | null | undefined,
  store: Storage = sessionStorage,
): void {
  if (!user || !jwtToken) {
    throw new Error("Missing user or token");
  }
  const safeUser = sanitizeMerchantUser(user);
  const json = JSON.stringify(safeUser);
  const roleKey = String(safeUser.roles).toLowerCase();
  store.setItem(`active-${roleKey}`, json);
  store.setItem(`${roleKey}-jwtToken`, jwtToken);
  store.setItem("active-customer", json);
  store.setItem("customer-jwtToken", jwtToken);
  if (String(safeUser.roles).toUpperCase() === "CUSTOMER") {
    store.setItem("customer-settings-id", "-10");
  }
}

export function persistTwoFactorPending(
  user: MerchantLoginUser,
  jwtToken: string | undefined,
  store: Storage = sessionStorage,
): void {
  store.setItem("temp-2fa-user", JSON.stringify(sanitizeMerchantUser(user)));
  if (jwtToken) store.setItem("customer-jwtToken", jwtToken);
}
