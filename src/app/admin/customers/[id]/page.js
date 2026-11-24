import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import PeopleDetail from "@/components/admin/people-detail";

export const metadata = { title: "Customer profile · Sathi Admin" };
export const instant = false;

export default async function CustomerDetailRoute({ params }) {
  await connection();
  const session = await requireAdmin();
  const { id } = await params;
  return (
    <AdminShell session={session} activePage="Customers" title="Customer profile">
      <PeopleDetail type="customers" id={id} />
    </AdminShell>
  );
}
