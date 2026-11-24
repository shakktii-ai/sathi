import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { AdminShell } from "@/components/admin/admin-dashboard";
import BookingsPage from "@/components/admin/bookings-page";

export const metadata = { title: "Bookings · Sathi Admin" };
export const instant = false;

export default async function BookingsRoute() {
  await connection();
  const session = await requireAdmin();
  return (
    <AdminShell session={session} activePage="Bookings" title="Bookings management">
      <BookingsPage />
    </AdminShell>
  );
}
