import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/authorization";
import { getAdminDb } from "@/lib/firebase/admin";
import { getDateValue, serializeTransaction } from "@/lib/firestore/serialization";

const PAGE_SIZE = 20;
const SCAN_SIZE = 50;
const SUMMARY_STATUSES = ["succeeded", "failed", "pending"];

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

export async function GET(request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const cursor = params.get("cursor") ? readCursor(params.get("cursor")) : null;
  const search = (params.get("search") || "").trim().toLowerCase();
  const status = params.get("status") || "";
  const method = params.get("method") || "";

  try {
    const db = getAdminDb();
    const collection = db.collection("transactions");
    const summaryQueries = [
      count(collection),
      ...SUMMARY_STATUSES.map((value) => count(collection.where("status", "==", value))),
    ];
    let query = collection.orderBy("createdAt", "desc").limit(SCAN_SIZE);
    if (cursor) query = query.startAfter(new Date(cursor.createdAt), cursor.id);

    const [summary, snapshot] = await Promise.all([Promise.all(summaryQueries), query.get()]);
    const [total, succeeded, failed, pending] = summary;
    const rawItems = snapshot.docs.map((doc) => ({ id: doc.id, record: serializeTransaction(doc.id, doc.data()) }));
    const filtered = rawItems.filter(({ id, record }) => {
      const haystack = [id, record.bookingId, record.clientId, record.workerId].filter(Boolean).join(" ").toLowerCase();
      return (
        (!search || haystack.includes(search)) &&
        (!status || record.status === status) &&
        (!method || record.method === method)
      );
    });

    return NextResponse.json({
      items: filtered.slice(0, PAGE_SIZE).map(({ record }) => record),
      summary: { total, succeeded, failed, pending },
      facets: {
        statuses: [...new Set(rawItems.map(({ record }) => record.status).filter(Boolean))].sort(),
        methods: [...new Set(rawItems.map(({ record }) => record.method).filter(Boolean))].sort(),
      },
      nextCursor: snapshot.size === SCAN_SIZE ? writeCursor(snapshot.docs[snapshot.docs.length - 1]) : null,
    });
  } catch (error) {
    console.error("Failed to read transactions", error);
    return NextResponse.json({ error: "Unable to load payment records right now." }, { status: 500 });
  }
}
