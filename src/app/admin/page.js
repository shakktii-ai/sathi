import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/authorization";
import { getAdminOverview } from "@/lib/firestore/dashboard";
import AdminDashboard from "@/components/admin/admin-dashboard";

export const metadata = { title: "Dashboard · Sathi Admin" };
export const instant = false;

export default async function AdminPage() {
  await connection();
  const session = await requireAdmin();
  let overview = null;
  try {
    overview = await getAdminOverview();
  } catch (error) {
    console.error("Failed to load admin overview", error);
  }
  return <AdminDashboard session={session} overview={overview} />;
}
