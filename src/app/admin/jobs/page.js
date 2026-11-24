import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import JobsPage from "@/components/admin/jobs-page";

export const metadata = { title: "Jobs · Sathi Admin" };
export const instant = false;

export default async function JobsRoute() {
  await connection();
  const session = await requireAdmin();
  return (
    <AdminShell session={session} activePage="Jobs" title="Jobs management">
      <JobsPage />
    </AdminShell>
  );
}
