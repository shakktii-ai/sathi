import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import ReviewDetail from "@/components/admin/review-detail";

export const metadata = { title: "Review details · Sathi Admin" };
export const instant = false;

export default async function ReviewDetailRoute({ params }) {
  await connection();
  const session = await requireAdmin();
  const { id } = await params;
  return (
    <AdminShell session={session} activePage="Reviews" title="Review details">
      <ReviewDetail id={id} />
    </AdminShell>
  );
}
