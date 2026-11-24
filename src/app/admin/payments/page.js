import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import PaymentsPage from "@/components/admin/payments-page";

export const metadata = { title: "Payments · Sathi Admin" };
export const instant = false;

export default async function PaymentsRoute() {
  await connection();
  const session = await requireAdmin();
  return (
    <AdminShell session={session} activePage="Payments" title="Payments">
      <PaymentsPage />
    </AdminShell>
  );
}
