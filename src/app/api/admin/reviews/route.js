import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/authorization";
import { getAdminDb } from "@/lib/firebase/admin";
import { getDateValue, serializeReview } from "@/lib/firestore/serialization";
import { getUserNames } from "@/lib/firestore/user-relationships";

const PAGE_SIZE = 20;
const SCAN_SIZE = 50;

function readCursor(value) {
  try {
    const cursor = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return Number.isFinite(cursor?.createdAt) && cursor.id ? cursor : null;
  } catch {
    return null;
  }
}

function writeCursor(doc) {
  return Buffer.from(JSON.stringify({ createdAt: getDateValue(doc.data().createdAt), id: doc.id })).toString(
    "base64url",
  );
}

async function count(query) {
  const snapshot = await query.count().get();
  return snapshot.data().count;
}

function matches(record, filters) {
  const searchText = [record.fromUserName, record.toUserName, record.fromUserId, record.toUserId]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return (
    (!filters.search || searchText.includes(filters.search)) &&
    (!filters.rating || String(record.rating) === filters.rating) &&
    (!filters.role || record.fromRole === filters.role) &&
    (!filters.category || record.category === filters.category) &&
    (!filters.reported || String(record.isReported) === filters.reported) &&
    (!filters.edited || String(record.isEdited) === filters.edited)
  );
}

export async function GET(request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const cursor = params.get("cursor") ? readCursor(params.get("cursor")) : null;
  const filters = {
    search: (params.get("search") || "").trim().toLowerCase(),
    rating: params.get("rating") || "",
    role: params.get("role") || "",
    category: params.get("category") || "",
    reported: params.get("reported") || "",
    edited: params.get("edited") || "",
  };

  try {
    const db = getAdminDb();
    const collection = db.collection("reviews");
    const summaryProjection = await collection.select("rating").get();
    const [total, reported, edited] = await Promise.all([
      count(collection),
      count(collection.where("isReported", "==", true)),
      count(collection.where("isEdited", "==", true)),
    ]);
    const ratings = summaryProjection.docs
      .map((doc) => doc.data().rating)
      .filter((rating) => typeof rating === "number" && Number.isFinite(rating));
    const averageRating = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;

    let query = collection.orderBy("createdAt", "desc").limit(SCAN_SIZE);
    if (cursor) query = query.startAfter(new Date(cursor.createdAt), cursor.id);
    const snapshot = await query.get();
    const rawData = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
    const userNames = await getUserNames(
      db,
      rawData.flatMap(({ data }) => [data.fromUserId, data.toUserId]),
    );
    const rawItems = rawData.map(({ id, data }) =>
      serializeReview(id, data, {
        fromUserName: userNames.get(data.fromUserId) || null,
        toUserName: userNames.get(data.toUserId) || null,
      }),
    );
    const filtered = rawItems.filter((record) => matches(record, filters));

    return NextResponse.json({
      items: filtered.slice(0, PAGE_SIZE),
      summary: { total, averageRating, reported, edited },
      facets: {
        roles: [...new Set(rawItems.map((item) => item.fromRole).filter(Boolean))].sort(),
        categories: [...new Set(rawItems.map((item) => item.category).filter(Boolean))].sort(),
      },
      nextCursor: snapshot.size === SCAN_SIZE ? writeCursor(snapshot.docs[snapshot.docs.length - 1]) : null,
    });
  } catch (error) {
    console.error("Failed to read reviews", error);
    return NextResponse.json({ error: "Unable to load reviews right now." }, { status: 500 });
  }
}
