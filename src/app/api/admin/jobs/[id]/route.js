import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminSession } from "@/lib/auth/authorization";
import { serializeJob } from "@/lib/firestore/serialization";
import { getWorkerLabels } from "@/lib/firestore/worker-relationships";

export async function GET(_request, context) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Job ID is required." }, { status: 400 });
  try {
    const snapshot = await getAdminDb().collection("jobs").doc(id).get();
    if (!snapshot.exists) return NextResponse.json({ error: "Job not found." }, { status: 404 });
    const data = snapshot.data();
    const workerLabels = await getWorkerLabels(getAdminDb(), [data.assignedWorkerId]);
    return NextResponse.json({
      item: serializeJob(snapshot.id, data, {
        assignedWorkerName: data.assignedWorkerId ? workerLabels.get(data.assignedWorkerId) : null,
      }),
    });
  } catch (error) {
    console.error("Failed to read job", error);
    return NextResponse.json({ error: "Unable to load this job right now." }, { status: 500 });
  }
}
