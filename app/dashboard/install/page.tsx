import { redirect } from "next/navigation";

export default function LegacyDashboardInstallRedirect() {
  redirect("/admin/dashboard/install");
}
