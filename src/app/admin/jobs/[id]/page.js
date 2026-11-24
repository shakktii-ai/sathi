import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import RecordDetail from "@/components/admin/record-detail";

export const metadata = { title: "Job details · Sathi Admin" };
export const instant = false;

export default async function JobDetailRoute({ params }) {
  await connection();
  const session = await requireAdmin();
  const { id } = await params;
  return (
    <AdminShell session={session} activePage="Jobs" title="Job details">
      <RecordDetail type="jobs" id={id} />
    </AdminShell>
  );
}
