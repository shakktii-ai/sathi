import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/authorization";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeBooking, serializeTransaction, serializeUser, serializeWorker } from "@/lib/firestore/serialization";

async function getDocument(db, collection, id) {
  if (!id) return null;
  const snapshot = await db.collection(collection).doc(id).get();
  return snapshot.exists ? snapshot : null;
}

export async function GET(_request, context) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Transaction ID is required." }, { status: 400 });

  try {
    const db = getAdminDb();
    const transactionSnapshot = await db.collection("transactions").doc(id).get();
    if (!transactionSnapshot.exists) return NextResponse.json({ error: "Transaction not found." }, { status: 404 });

    const transaction = serializeTransaction(transactionSnapshot.id, transactionSnapshot.data());
    const [bookingSnapshot, customerSnapshot, workerSnapshot] = await Promise.all([
      getDocument(db, "bookings", transaction.bookingId),
      getDocument(db, "users", transaction.clientId),
      getDocument(db, "workers", transaction.workerId),
    ]);

    return NextResponse.json({
      item: transaction,
      booking: bookingSnapshot ? serializeBooking(bookingSnapshot.id, bookingSnapshot.data()) : null,
      customer: customerSnapshot ? serializeUser(customerSnapshot.id, customerSnapshot.data()) : null,
      worker: workerSnapshot ? serializeWorker(workerSnapshot.id, workerSnapshot.data()) : null,
    });
  } catch (error) {
    console.error("Failed to read transaction", error);
    return NextResponse.json({ error: "Unable to load this payment record right now." }, { status: 500 });
  }
}
