import { DEFAULT_ADMIN_CONFIG } from "@/lib/config";

type AdminLike = Pick<typeof DEFAULT_ADMIN_CONFIG, "defaultSiteId">;

export function resolveRecoverySiteId(
  body: { siteId?: string },
  adminConfig: AdminLike,
): string {
  const fromBody = body.siteId?.trim();
  if (fromBody) return fromBody;
  const fromAdmin = adminConfig.defaultSiteId?.trim();
  if (fromAdmin) return fromAdmin;
  return process.env.DEFAULT_SITE_ID?.trim() || "default";
}
