import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/authorization";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeReview } from "@/lib/firestore/serialization";
import { getUserNames } from "@/lib/firestore/user-relationships";

export async function GET(_request, context) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Review ID is required." }, { status: 400 });
  try {
    const snapshot = await getAdminDb().collection("reviews").doc(id).get();
    if (!snapshot.exists) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    const data = snapshot.data();
    const userNames = await getUserNames(getAdminDb(), [data.fromUserId, data.toUserId]);
    return NextResponse.json({
      item: serializeReview(snapshot.id, data, {
        fromUserName: userNames.get(data.fromUserId) || null,
        toUserName: userNames.get(data.toUserId) || null,
      }),
    });
  } catch (error) {
    console.error("Failed to read review", error);
    return NextResponse.json({ error: "Unable to load this review right now." }, { status: 500 });
  }
}
