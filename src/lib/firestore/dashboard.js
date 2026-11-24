import "server-only";
import { getAdminDb } from "../firebase/admin.js";
import { serializeBooking, serializeJob } from "./serialization.js";

// These values were verified from the current Firestore data before implementation.
const CUSTOMER_ROLE = "client";
const OPEN_JOB_STATUS = "open";
const COMPLETED_BOOKING_STATUS = "completed";
const PENDING_WORKER_VERIFICATION_STATUS = "pending";

async function count(query) {
  const snapshot = await query.count().get();
  return snapshot.data().count;
}

function statusCounts(snapshot) {
  return snapshot.docs.reduce((counts, document) => {
    const status = document.data().status;
    if (typeof status === "string" && status) counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
}

function overviewJob(document) {
  const job = serializeJob(document.id, document.data());
  return {
    id: job.id,
    title: job.title,
    category: job.category,
    clientName: job.clientName,
    status: job.status,
    createdAt: job.createdAt,
  };
}

function overviewBooking(document) {
  const booking = serializeBooking(document.id, document.data());
  return {
    id: booking.id,
    jobTitle: booking.jobTitle,
    clientName: booking.clientName,
    workerName: booking.workerName,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    createdAt: booking.createdAt,
    scheduledDate: booking.scheduledDate,
  };
}

function recentActivity(jobs, bookings) {
  return [
    ...jobs.map((job) => ({
      id: `job-${job.id}`,
      type: "Job posted",
      title: job.title || "Untitled job",
      detail: job.clientName || "Customer not recorded",
      status: job.status,
      createdAt: job.createdAt,
    })),
    ...bookings.map((booking) => ({
      id: `booking-${booking.id}`,
      type: "Booking created",
      title: booking.jobTitle || "Booking",
      detail: booking.clientName || booking.workerName || "Participant not recorded",
      status: booking.status,
      createdAt: booking.createdAt,
    })),
  ]
    .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0))
    .slice(0, 5);
}

export async function getAdminOverview() {
  const db = getAdminDb();
  const jobs = db.collection("jobs");
  const bookings = db.collection("bookings");
  const workers = db.collection("workers");
  const users = db.collection("users");
  const [
    totalCustomers,
    totalWorkers,
    totalJobs,
    totalBookings,
    openJobs,
    completedBookings,
    pendingWorkerVerifications,
    recentJobsSnapshot,
    recentBookingsSnapshot,
    bookingStatusSnapshot,
  ] = await Promise.all([
    count(users.where("role", "==", CUSTOMER_ROLE)),
    count(workers),
    count(jobs),
    count(bookings),
    count(jobs.where("status", "==", OPEN_JOB_STATUS)),
    count(bookings.where("status", "==", COMPLETED_BOOKING_STATUS)),
    count(workers.where("verificationStatus", "==", PENDING_WORKER_VERIFICATION_STATUS)),
    jobs.orderBy("createdAt", "desc").limit(5).get(),
    bookings.orderBy("createdAt", "desc").limit(5).get(),
    bookings.select("status").get(),
  ]);

  const recentJobs = recentJobsSnapshot.docs.map(overviewJob);
  const recentBookings = recentBookingsSnapshot.docs.map(overviewBooking);
  const bookingStatuses = statusCounts(bookingStatusSnapshot);

  return {
    stats: {
      totalCustomers,
      totalWorkers,
      totalJobs,
      openJobs,
      totalBookings,
      completedBookings,
      cancelledBookings: bookingStatuses.cancelled || 0,
      pendingWorkerVerifications,
    },
    bookingStatuses: Object.entries(bookingStatuses).map(([name, value]) => ({ name, value })),
    recentJobs,
    recentBookings,
    recentActivity: recentActivity(recentJobs, recentBookings),
  };
}
