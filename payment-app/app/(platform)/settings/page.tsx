import { redirect } from "next/navigation";
import { getRole } from "@/app/lib/get-role";
import SettingsPanel from "@/app/ui/shared/settings-panel";

export default async function SettingsPage() {
  const role = await getRole();
  if (!role) redirect("/select-role");

  return <SettingsPanel role={role} />;
}
