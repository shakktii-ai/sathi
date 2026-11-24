import "server-only";

const IN_QUERY_LIMIT = 30;

export async function getWorkerReviewStats(db, workerIds) {
  const ids = [...new Set(workerIds.filter((id) => typeof id === "string" && id.trim()))];
  const stats = new Map(ids.map((id) => [id, { totalReviews: 0, ratingTotal: 0, ratedReviews: 0 }]));
  if (!ids.length) return stats;

  const chunks = [];
  for (let index = 0; index < ids.length; index += IN_QUERY_LIMIT)
    chunks.push(ids.slice(index, index + IN_QUERY_LIMIT));
  const snapshots = await Promise.all(
    chunks.map((chunk) => db.collection("reviews").where("toUserId", "in", chunk).select("toUserId", "rating").get()),
  );

  snapshots
    .flatMap((snapshot) => snapshot.docs)
    .forEach((document) => {
      const data = document.data();
      const workerId = data.toUserId;
      const current = stats.get(workerId);
      if (!current) return;
      current.totalReviews += 1;
      if (typeof data.rating === "number" && Number.isFinite(data.rating)) {
        current.ratingTotal += data.rating;
        current.ratedReviews += 1;
      }
    });

  stats.forEach((value) => {
    value.averageRating = value.ratedReviews ? value.ratingTotal / value.ratedReviews : 0;
    delete value.ratingTotal;
    delete value.ratedReviews;
  });
  return stats;
}
