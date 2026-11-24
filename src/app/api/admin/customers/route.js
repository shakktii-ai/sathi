import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/authorization";
import { getAdminDb } from "@/lib/firebase/admin";
import { getCustomerRoleValues } from "@/lib/firestore/customer-config";
import { serializeUser } from "@/lib/firestore/serialization";

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
  let customerRoles;
  try {
    customerRoles = getCustomerRoleValues();
  } catch (error) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 503 });
  }
  const params = new URL(request.url).searchParams;
  const cursor = params.get("cursor") ? readCursor(params.get("cursor")) : null;
  const search = (params.get("search") || "").trim().toLowerCase();
  const accountStatus = params.get("accountStatus") || "";
  const verificationStatus = params.get("verificationStatus") || "";
  try {
    let query = getAdminDb().collection("users").orderBy("createdAt", "desc").limit(SCAN_SIZE);
    if (cursor) query = query.startAfter(new Date(cursor.createdAt), cursor.id);
    const snapshot = await query.get();
    const rawItems = snapshot.docs.map((doc) => ({ id: doc.id, record: serializeUser(doc.id, doc.data()) }));
    const filtered = rawItems.filter(({ id, record }) => {
      const haystack = [id, record.name, record.phone, record.email].filter(Boolean).join(" ").toLowerCase();
      return (
        customerRoles.includes(record.role) &&
        (!search || haystack.includes(search)) &&
        (!accountStatus || (accountStatus === "active" ? record.isActive === true : record.isActive === false)) &&
        (!verificationStatus || record.verificationStatus === verificationStatus)
      );
    });
    const facets = {
      verificationStatuses: [
        ...new Set(
          rawItems
            .filter(({ record }) => customerRoles.includes(record.role))
            .map(({ record }) => record.verificationStatus)
            .filter(Boolean),
        ),
      ].sort(),
    };
    return NextResponse.json({
      items: filtered.map(({ record }) => record),
      facets,
      customerRoleValues: customerRoles,
      nextCursor: snapshot.size === SCAN_SIZE ? writeCursor(snapshot.docs[snapshot.docs.length - 1]) : null,
    });
  } catch (error) {
    console.error("Failed to read customers", error);
    return NextResponse.json({ error: "Unable to load customers right now." }, { status: 500 });
  }
}
