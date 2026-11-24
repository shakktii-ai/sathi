import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminSession } from "@/lib/auth/authorization";
import { serializeJob } from "@/lib/firestore/serialization";
import { getWorkerLabels } from "@/lib/firestore/worker-relationships";

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
  const category = params.get("category") || "";
  try {
    let query = getAdminDb().collection("jobs").orderBy("createdAt", "desc").limit(SCAN_SIZE);
    if (cursor) query = query.startAfter(new Date(cursor.createdAt), cursor.id);
    const snapshot = await query.get();
    const rawItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
      record: serializeJob(doc.id, doc.data()),
    }));
    const workerLabels = await getWorkerLabels(
      getAdminDb(),
      rawItems.map(({ record }) => record.assignedWorkerId),
    );
    const labeledItems = rawItems.map(({ id, data }) => {
      const assignedWorkerId = data.assignedWorkerId;
      return {
        id,
        record: serializeJob(id, data, {
          assignedWorkerName: assignedWorkerId ? workerLabels.get(assignedWorkerId) : null,
        }),
      };
    });
    const filtered = labeledItems.filter(({ id, record }) => {
      const haystack = [id, record.title, record.clientName, record.category].filter(Boolean).join(" ").toLowerCase();
      return (
        (!search || haystack.includes(search)) &&
        (!status || record.status === status) &&
        (!category || record.category === category)
      );
    });
    const items = filtered.slice(0, PAGE_SIZE).map(({ record }) => record);
    const facets = {
      statuses: [...new Set(rawItems.map(({ record }) => record.status).filter(Boolean))].sort(),
      categories: [...new Set(rawItems.map(({ record }) => record.category).filter(Boolean))].sort(),
    };
    return NextResponse.json({
      items,
      facets,
      nextCursor: snapshot.size === SCAN_SIZE ? writeCursor(snapshot.docs[snapshot.docs.length - 1]) : null,
    });
  } catch (error) {
    console.error("Failed to read jobs", error);
    return NextResponse.json({ error: "Unable to load jobs right now." }, { status: 500 });
  }
}
