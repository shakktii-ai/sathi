import "server-only";

export async function getUserNames(db, userIds) {
  const ids = [...new Set(userIds.filter((id) => typeof id === "string" && id.trim()))];
  const names = new Map();
  if (!ids.length) return names;

  const snapshots = await db.getAll(...ids.map((id) => db.collection("users").doc(id)));
  snapshots.forEach((snapshot, index) => {
    if (!snapshot.exists) return;
    const name = snapshot.data()?.name;
    if (typeof name === "string" && name.trim()) names.set(ids[index], name.trim());
  });
  return names;
}
