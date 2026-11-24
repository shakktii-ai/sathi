export function timestampToIso(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") return new Date(value).toISOString();
  if (typeof value === "string") return value;
  return null;
}

function arrayValue(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function locationValue(value) {
  return value ? { latitude: value.latitude ?? null, longitude: value.longitude ?? null } : null;
}

export function serializeUser(id, data) {
  return {
    id,
    name: data.name || null,
    phone: data.phone || data.phoneNumber || null,
    email: data.email || null,
    photoUrl: data.photoUrl || null,
    role: data.role || null,
    isActive: data.isActive ?? null,
    isVerified: data.isVerified ?? null,
    verificationStatus: data.verificationStatus || null,
    verifiedAt: timestampToIso(data.verifiedAt),
    address: data.address || null,
    currentLocation: locationValue(data.currentLocation),
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
    lastActiveAt: timestampToIso(data.lastActiveAt),
    totalBookings: data.totalBookings ?? null,
    preferredLanguage: data.preferredLanguage || null,
    favoriteWorkerIds: arrayValue(data.favoriteWorkerIds),
  };
}

export function serializeWorker(id, data) {
  return {
    id,
    name: data.name || null,
    email: data.email || null,
    phoneNumber: data.phoneNumber || null,
    photoUrl: data.photoUrl || null,
    bio: data.bio || null,
    categories: arrayValue(data.categories),
    skills: arrayValue(data.skills),
    experienceYears: data.experienceYears ?? null,
    avgRating: data.avgRating ?? null,
    totalReviews: data.totalReviews ?? null,
    totalJobsCompleted: data.totalJobsCompleted ?? null,
    totalJobsCancelled: data.totalJobsCancelled ?? null,
    totalEarnings: data.totalEarnings ?? null,
    profileViews: data.profileViews ?? null,
    isActive: data.isActive ?? null,
    isOnline: data.isOnline ?? null,
    isVerified: data.isVerified ?? null,
    verificationStatus: data.verificationStatus || null,
    verifiedAt: timestampToIso(data.verifiedAt),
    createdAt: timestampToIso(data.createdAt),
    lastActiveAt: timestampToIso(data.lastActiveAt),
    currentLocation: locationValue(data.currentLocation),
    serviceRadiusKm: data.serviceRadiusKm ?? null,
    pricing: data.pricing ?? null,
    portfolioImageUrls: arrayValue(data.portfolioImageUrls),
    weeklyAvailability: data.weeklyAvailability ?? null,
    isPromoted: data.isPromoted ?? null,
  };
}

export const EMPTY_VALUE = "\u2014";
export const RANGE_SEPARATOR = "\u2013";

export function formatCurrency(value) {
  if (value == null || value === "" || Number.isNaN(Number(value))) return EMPTY_VALUE;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(
    Number(value),
  );
}

export function formatJobCategory(value) {
  const category =
    typeof value === "string"
      ? value.trim()
      : value && typeof value === "object"
        ? typeof value.name === "string"
          ? value.name.trim()
          : typeof value.title === "string"
            ? value.title.trim()
            : ""
        : "";
  if (!category || /^[A-Za-z0-9]{20}$/.test(category)) return "Category unavailable";
  return category;
}

function categoryValue(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    if (typeof value.name === "string") return value.name;
    if (typeof value.title === "string") return value.title;
  }
  return null;
}

export function serializeJob(id, data, related = {}) {
  return {
    id,
    address: data.address || null,
    assignedWorkerId: data.assignedWorkerId || null,
    assignedWorkerName: related.assignedWorkerName || null,
    budgetMax: data.budgetMax ?? null,
    budgetMin: data.budgetMin ?? null,
    budgetType: data.budgetType || null,
    cancellationReason: data.cancellationReason || null,
    category: categoryValue(data.category),
    clientId: data.clientId || null,
    clientName: data.clientName || null,
    createdAt: timestampToIso(data.createdAt),
    description: data.description || null,
    geoPoint: data.geoPoint
      ? { latitude: data.geoPoint.latitude ?? null, longitude: data.geoPoint.longitude ?? null }
      : null,
    imageUrls: arrayValue(data.imageUrls),
    interestedWorkerIds: arrayValue(data.interestedWorkerIds),
    isPromoted: data.isPromoted ?? null,
    landmark: data.landmark || null,
    notifiedWorkerIds: arrayValue(data.notifiedWorkerIds),
    postType: data.postType || null,
    preferredDate: timestampToIso(data.preferredDate) || data.preferredDate || null,
    preferredTimeSlot: data.preferredTimeSlot || null,
    status: data.status || null,
    subCategory: data.subCategory || null,
    title: data.title || null,
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export function serializeBooking(id, data) {
  return {
    id,
    acceptedAt: timestampToIso(data.acceptedAt),
    agreedPrice: data.agreedPrice ?? null,
    cancellationReason: data.cancellationReason || null,
    cancelledAt: timestampToIso(data.cancelledAt),
    cancelledBy: data.cancelledBy || null,
    category: data.category || null,
    clientId: data.clientId || null,
    clientName: data.clientName || null,
    clientPhotoUrl: data.clientPhotoUrl || null,
    clientReviewed: data.clientReviewed ?? null,
    completedAt: timestampToIso(data.completedAt),
    createdAt: timestampToIso(data.createdAt),
    finalAmount: data.finalAmount ?? null,
    jobAddress: data.jobAddress || null,
    jobId: data.jobId || null,
    jobLocation: data.jobLocation || null,
    jobTitle: data.jobTitle || null,
    paymentMethod: data.paymentMethod || null,
    paymentStatus: data.paymentStatus || null,
    pricingType: data.pricingType || null,
    scheduledDate: timestampToIso(data.scheduledDate) || data.scheduledDate || null,
    scheduledTimeSlot: data.scheduledTimeSlot || null,
    startedAt: timestampToIso(data.startedAt),
    status: data.status || null,
    transactionId: data.transactionId || null,
    updatedAt: timestampToIso(data.updatedAt),
    workerId: data.workerId || null,
    workerName: data.workerName || null,
    workerPhotoUrl: data.workerPhotoUrl || null,
    workerReviewed: data.workerReviewed ?? null,
    workerLiveLocation: data.workerLiveLocation
      ? { latitude: data.workerLiveLocation.latitude ?? null, longitude: data.workerLiveLocation.longitude ?? null }
      : null,
  };
}

export function serializeTransaction(id, data) {
  return {
    id,
    bookingId: typeof data.bookingId === "string" ? data.bookingId : null,
    clientId: typeof data.clientId === "string" ? data.clientId : null,
    workerId: typeof data.workerId === "string" ? data.workerId : null,
    actorId: typeof data.actorId === "string" ? data.actorId : null,
    amount: data.amount ?? null,
    platformFee: data.platformFee ?? null,
    gst: data.gst ?? null,
    netAmount: data.netAmount ?? null,
    method: typeof data.method === "string" ? data.method : null,
    direction: typeof data.direction === "string" ? data.direction : null,
    status: typeof data.status === "string" ? data.status : null,
    gatewayRef: typeof data.gatewayRef === "string" ? data.gatewayRef : null,
    description: typeof data.description === "string" ? data.description : null,
    createdAt: timestampToIso(data.createdAt),
    refundedAt: timestampToIso(data.refundedAt),
  };
}

export function serializeReview(id, data, related = {}) {
  return {
    id,
    bookingId: typeof data.bookingId === "string" ? data.bookingId : null,
    jobId: typeof data.jobId === "string" ? data.jobId : null,
    category: typeof data.category === "string" ? data.category : null,
    comment: typeof data.comment === "string" ? data.comment : null,
    createdAt: timestampToIso(data.createdAt),
    editedAt: timestampToIso(data.editedAt),
    fromRole: typeof data.fromRole === "string" ? data.fromRole : null,
    fromUserId: typeof data.fromUserId === "string" ? data.fromUserId : null,
    fromUserName: related.fromUserName || null,
    isEdited: data.isEdited === true,
    isReported: data.isReported === true,
    reportReason: typeof data.reportReason === "string" ? data.reportReason : null,
    photoUrls: arrayValue(data.photoUrls).filter((value) => typeof value === "string"),
    rating: typeof data.rating === "number" && Number.isFinite(data.rating) ? data.rating : null,
    toUserId: typeof data.toUserId === "string" ? data.toUserId : null,
    toUserName: related.toUserName || null,
  };
}

export function getDateValue(value) {
  const iso = timestampToIso(value);
  const parsed = iso ? Date.parse(iso) : Date.parse(String(value || ""));
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatDate(value) {
  const parsed = getDateValue(value);
  return parsed === null ? EMPTY_VALUE : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(parsed);
}

export function formatDateTime(value) {
  const parsed = getDateValue(value);
  return parsed === null
    ? EMPTY_VALUE
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}
