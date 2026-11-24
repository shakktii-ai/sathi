import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/authorization";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeBooking, serializeJob, serializeWorker } from "@/lib/firestore/serialization";

export async function GET(_request, context) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Worker ID is required." }, { status: 400 });
  try {
    const db = getAdminDb();
    const workerSnapshot = await db.collection("workers").doc(id).get();
    if (!workerSnapshot.exists) return NextResponse.json({ error: "Worker not found." }, { status: 404 });
    const [assignedJobs, interestedJobs, bookings] = await Promise.all([
      db.collection("jobs").where("assignedWorkerId", "==", id).limit(25).get(),
      db.collection("jobs").where("interestedWorkerIds", "array-contains", id).limit(25).get(),
      db.collection("bookings").where("workerId", "==", id).limit(25).get(),
    ]);
    const jobMap = new Map();
    [...assignedJobs.docs, ...interestedJobs.docs].forEach((doc) =>
      jobMap.set(doc.id, serializeJob(doc.id, doc.data())),
    );
    return NextResponse.json({
      item: serializeWorker(workerSnapshot.id, workerSnapshot.data()),
      jobs: [...jobMap.values()],
      bookings: bookings.docs.map((doc) => serializeBooking(doc.id, doc.data())),
    });
  } catch (error) {
    console.error("Failed to read worker", error);
    return NextResponse.json({ error: "Unable to load this worker right now." }, { status: 500 });
  }
}
