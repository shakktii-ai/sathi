import "server-only";

export async function getWorkerLabels(db, workerIds) {
  const ids = [...new Set(workerIds.filter((id) => typeof id === "string" && id.trim()))];
  const labels = new Map();
  if (!ids.length) return labels;

  const snapshots = await db.getAll(...ids.map((id) => db.collection("workers").doc(id)));
  snapshots.forEach((snapshot, index) => {
    const id = ids[index];
    if (!snapshot.exists) {
      labels.set(id, "Worker not found");
      return;
    }
    const name = snapshot.data()?.name;
    labels.set(id, typeof name === "string" && name.trim() ? name.trim() : "Name unavailable");
  });
  return labels;
}
