import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import ProfilePage from "@/components/admin/profile-page";

export const metadata = { title: "Administrator profile · Sathi Admin" };
export const instant = false;

export default async function AdminProfileRoute() {
  await connection();
  const session = await requireAdmin();
  return (
    <AdminShell session={session} activePage="Profile" title="Administrator profile">
      <ProfilePage session={session} />
    </AdminShell>
  );
}
