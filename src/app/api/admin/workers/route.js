import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/authorization";
import { getAdminDb } from "@/lib/firebase/admin";
import { serializeWorker } from "@/lib/firestore/serialization";
import { getWorkerReviewStats } from "@/lib/firestore/worker-review-stats";

const SCAN_SIZE = 50;
function readCursor(value) {
  try {
    const cursor = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return cursor?.createdAt && cursor?.id ? cursor : null;
  } catch {
    return null;
  }
}
function writeCursor(doc) {
  const createdAt = doc.data().createdAt;
  const millis = typeof createdAt?.toMillis === "function" ? createdAt.toMillis() : Date.parse(String(createdAt || ""));
  return Buffer.from(JSON.stringify({ createdAt: Number.isNaN(millis) ? null : millis, id: doc.id })).toString(
    "base64url",
  );
}

export async function GET(request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const cursor = params.get("cursor") ? readCursor(params.get("cursor")) : null;
  const search = (params.get("search") || "").trim().toLowerCase();
  const active = params.get("active") || "";
  const online = params.get("online") || "";
  const verificationStatus = params.get("verificationStatus") || "";
  const category = params.get("category") || "";
  try {
    let query = getAdminDb().collection("workers").orderBy("createdAt", "desc").limit(SCAN_SIZE);
    if (cursor) query = query.startAfter(new Date(cursor.createdAt), cursor.id);
    const snapshot = await query.get();
    const db = getAdminDb();
    const rawItems = snapshot.docs.map((doc) => ({ id: doc.id, record: serializeWorker(doc.id, doc.data()) }));
    const filtered = rawItems.filter(({ id, record }) => {
      const haystack = [id, record.name, record.phoneNumber, record.email, ...record.categories]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (
        (!search || haystack.includes(search)) &&
        (!active || record.isActive === (active === "true")) &&
        (!online || record.isOnline === (online === "true")) &&
        (!verificationStatus || record.verificationStatus === verificationStatus) &&
        (!category || record.categories.includes(category))
      );
    });
    const reviewStats = await getWorkerReviewStats(
      db,
      filtered.map(({ id }) => id),
    );
    const items = filtered.map(({ id, record }) => ({
      ...record,
      totalReviews: reviewStats.get(id)?.totalReviews || 0,
      avgRating: reviewStats.get(id)?.averageRating || 0,
    }));
    const facets = {
      verificationStatuses: [
        ...new Set(rawItems.map(({ record }) => record.verificationStatus).filter(Boolean)),
      ].sort(),
      categories: [...new Set(rawItems.flatMap(({ record }) => record.categories))].sort(),
    };
    return NextResponse.json({
      items,
      facets,
      nextCursor: snapshot.size === SCAN_SIZE ? writeCursor(snapshot.docs[snapshot.docs.length - 1]) : null,
    });
  } catch (error) {
    console.error("Failed to read workers", error);
    return NextResponse.json({ error: "Unable to load workers right now." }, { status: 500 });
  }
}
