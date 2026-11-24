import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import WorkersPage from "@/components/admin/workers-page";

export const metadata = { title: "Workers · Sathi Admin" };
export const instant = false;

export default async function WorkersRoute() {
  await connection();
  const session = await requireAdmin();
  return (
    <AdminShell session={session} activePage="Workers" title="Workers management">
      <WorkersPage />
    </AdminShell>
  );
}
