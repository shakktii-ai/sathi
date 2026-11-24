import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminSession } from "@/lib/auth/authorization";
import { serializeBooking } from "@/lib/firestore/serialization";

export async function GET(_request, context) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
  try {
    const snapshot = await getAdminDb().collection("bookings").doc(id).get();
    if (!snapshot.exists) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    return NextResponse.json({ item: serializeBooking(snapshot.id, snapshot.data()) });
  } catch (error) {
    console.error("Failed to read booking", error);
    return NextResponse.json({ error: "Unable to load this booking right now." }, { status: 500 });
  }
}
