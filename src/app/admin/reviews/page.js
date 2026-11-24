import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import ReviewsPage from "@/components/admin/reviews-page";

export const metadata = { title: "Reviews · Sathi Admin" };
export const instant = false;

export default async function ReviewsRoute() {
  await connection();
  const session = await requireAdmin();
  return (
    <AdminShell session={session} activePage="Reviews" title="Reviews management">
      <ReviewsPage />
    </AdminShell>
  );
}
