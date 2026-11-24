import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import CustomersPage from "@/components/admin/customers-page";

export const metadata = { title: "Customers · Sathi Admin" };
export const instant = false;

export default async function CustomersRoute() {
  await connection();
  const session = await requireAdmin();
  return (
    <AdminShell session={session} activePage="Customers" title="Customers management">
      <CustomersPage />
    </AdminShell>
  );
}
