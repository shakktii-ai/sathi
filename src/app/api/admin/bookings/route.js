import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminSession } from "@/lib/auth/authorization";
import { getDateValue, serializeBooking } from "@/lib/firestore/serialization";

const PAGE_SIZE = 20;
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
  const status = params.get("status") || "";
  const paymentStatus = params.get("paymentStatus") || "";
  const dateFrom = params.get("dateFrom") ? Date.parse(params.get("dateFrom")) : null;
  const dateTo = params.get("dateTo") ? Date.parse(`${params.get("dateTo")}T23:59:59.999`) : null;
  try {
    let query = getAdminDb().collection("bookings").orderBy("createdAt", "desc").limit(SCAN_SIZE);
    if (cursor) query = query.startAfter(new Date(cursor.createdAt), cursor.id);
    const snapshot = await query.get();
    const rawItems = snapshot.docs.map((doc) => ({ id: doc.id, record: serializeBooking(doc.id, doc.data()) }));
    const filtered = rawItems.filter(({ id, record }) => {
      const haystack = [id, record.jobTitle, record.clientName, record.workerName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const scheduled = getDateValue(record.scheduledDate);
      return (
        (!search || haystack.includes(search)) &&
        (!status || record.status === status) &&
        (!paymentStatus || record.paymentStatus === paymentStatus) &&
        (!dateFrom || (scheduled !== null && scheduled >= dateFrom)) &&
        (!dateTo || (scheduled !== null && scheduled <= dateTo))
      );
    });
    const items = filtered.slice(0, PAGE_SIZE).map(({ record }) => record);
    const facets = {
      statuses: [...new Set(rawItems.map(({ record }) => record.status).filter(Boolean))].sort(),
      paymentStatuses: [...new Set(rawItems.map(({ record }) => record.paymentStatus).filter(Boolean))].sort(),
    };
    return NextResponse.json({
      items,
      facets,
      nextCursor: snapshot.size === SCAN_SIZE ? writeCursor(snapshot.docs[snapshot.docs.length - 1]) : null,
    });
  } catch (error) {
    console.error("Failed to read bookings", error);
    return NextResponse.json({ error: "Unable to load bookings right now." }, { status: 500 });
  }
}
