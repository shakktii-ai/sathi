import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import PaymentDetail from "@/components/admin/payment-detail";

export const metadata = { title: "Payment details · Sathi Admin" };
export const instant = false;

export default async function PaymentDetailRoute({ params }) {
  await connection();
  const session = await requireAdmin();
  const { id } = await params;
  return (
    <AdminShell session={session} activePage="Payments" title="Payment details">
      <PaymentDetail id={id} />
    </AdminShell>
  );
}
