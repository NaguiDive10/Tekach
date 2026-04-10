export const ABANDON_INACTIVITY_MINUTES = Number(
  process.env.ABANDON_INACTIVITY_MINUTES ?? "25",
);

export const DEFAULT_ADMIN_CONFIG = {
  recoveryMode: "email" as const,
  voiceCartMinEuros: 50,
  callDelayMinutes: 30,
  discountPercentMax: 0.05,
  cartValueForNegotiationEuros: 1000,
  /** Site par défaut si le webhook n’envoie pas siteId (multi-boutiques). */
  defaultSiteId: "default",
};

export function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
