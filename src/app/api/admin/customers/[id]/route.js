import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/authorization";
import { getAdminDb } from "@/lib/firebase/admin";
import { getCustomerRoleValues } from "@/lib/firestore/customer-config";
import { serializeBooking, serializeJob, serializeUser } from "@/lib/firestore/serialization";

export async function GET(_request, context) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Customer ID is required." }, { status: 400 });
  let customerRoles;
  try {
    customerRoles = getCustomerRoleValues();
  } catch (error) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 503 });
  }
  try {
    const db = getAdminDb();
    const userSnapshot = await db.collection("users").doc(id).get();
    if (!userSnapshot.exists || !customerRoles.includes(userSnapshot.data().role))
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    const [jobsSnapshot, bookingsSnapshot] = await Promise.all([
      db.collection("jobs").where("clientId", "==", id).limit(25).get(),
      db.collection("bookings").where("clientId", "==", id).limit(25).get(),
    ]);
    return NextResponse.json({
      item: serializeUser(userSnapshot.id, userSnapshot.data()),
      jobs: jobsSnapshot.docs.map((doc) => serializeJob(doc.id, doc.data())),
      bookings: bookingsSnapshot.docs.map((doc) => serializeBooking(doc.id, doc.data())),
    });
  } catch (error) {
    console.error("Failed to read customer", error);
    return NextResponse.json({ error: "Unable to load this customer right now." }, { status: 500 });
  }
}
