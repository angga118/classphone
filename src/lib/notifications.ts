export const ADMIN_NOTIFICATION_TYPES = ["NEW_LISTING", "PRODUCT_CONVERTED"];

export const USER_NOTIFICATION_TYPES = [
  "LISTING_APPROVED",
  "LISTING_REJECTED",
  "LISTING_DEAL",
  "LISTING_COMPLETED",
];

export function notificationTypesForRole(role: string | undefined): string[] {
  return role === "ADMIN" ? ADMIN_NOTIFICATION_TYPES : USER_NOTIFICATION_TYPES;
}