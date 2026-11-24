"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  MapPin,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  EMPTY_VALUE,
  RANGE_SEPARATOR,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatJobCategory,
} from "@/lib/firestore/serialization";
import { StatusBadge } from "@/components/admin/jobs-page";
import EmptyState from "@/components/admin/empty-state";

export default function RecordDetail({ type, id }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/admin/${type}/${encodeURIComponent(id)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) setItem(result.item);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load this record.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [type, id]);
  if (loading)
    return (
      <DetailFrame backHref={`/admin/${type}`}>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </DetailFrame>
    );
  if (error)
    return (
      <DetailFrame backHref={`/admin/${type}`}>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
      </DetailFrame>
    );
  if (!item)
    return (
      <DetailFrame backHref={`/admin/${type}`}>
        <EmptyState
          title="Record not found"
          description="The requested record does not exist or is no longer available."
        />
      </DetailFrame>
    );
  return type === "jobs" ? <JobDetail item={item} /> : <BookingDetail item={item} />;
}

function DetailFrame({ backHref, children }) {
  return (
    <>
      <a
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> Back to list
      </a>
      {children}
    </>
  );
}
function JobDetail({ item }) {
  return (
    <DetailFrame backHref="/admin/jobs">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-blue-600">Job details</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[26px]">
            {item.title || "Untitled job"}
          </h1>
          {/* <p className="mt-2 break-all text-xs text-slate-400">Document ID: {item.id}</p> */}
        </div>
        <StatusBadge value={item.status} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-6">
          <DetailPanel title="Job information">
            <DetailGrid
              rows={[
                ["Category", formatJobCategory(item.category)],
                ["Sub-category", item.subCategory],
                ["Post type", item.postType],
                ["Customer", item.clientName || item.clientId],
                ["Budget", budget(item)],
                ["Preferred date", formatDate(item.preferredDate)],
                ["Preferred time", item.preferredTimeSlot],
                ["Created", formatDateTime(item.createdAt)],
                ["Updated", formatDateTime(item.updatedAt)],
              ]}
            />
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Description</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {item.description || "No description recorded."}
              </p>
            </div>
          </DetailPanel>
          <DetailPanel title="Location">
            <DetailGrid
              rows={[
                ["Address", item.address],
                ["Landmark", item.landmark],
                [
                  "Coordinates",
                  item.geoPoint
                    ? `${item.geoPoint.latitude ?? EMPTY_VALUE}, ${item.geoPoint.longitude ?? EMPTY_VALUE}`
                    : null,
                ],
              ]}
            />
          </DetailPanel>
          {item.imageUrls.length > 0 && (
            <DetailPanel title="Job images">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {item.imageUrls.map((url) => (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    key={url}
                    className="group aspect-video overflow-hidden rounded-xl bg-slate-100"
                  >
                    <img
                      src={url}
                      alt="Job attachment"
                      className="size-full object-cover transition group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </DetailPanel>
          )}
        </div>
        <div className="space-y-6">
          <DetailPanel title="Worker interest">
            <DetailGrid
              rows={[
                ["Interested workers", item.interestedWorkerIds.length],
                ["Notified workers", item.notifiedWorkerIds.length],
                [
                  "Assigned worker",
                  item.assignedWorkerId ? item.assignedWorkerName || "Name unavailable" : "Not assigned",
                ],
              ]}
            />
          </DetailPanel>
          {item.cancellationReason && (
            <DetailPanel title="Cancellation">
              <div className="flex gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                <XCircle size={18} className="shrink-0" />
                <p>{item.cancellationReason}</p>
              </div>
            </DetailPanel>
          )}
        </div>
      </div>
    </DetailFrame>
  );
}
function BookingDetail({ item }) {
  return (
    <DetailFrame backHref="/admin/bookings">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          {/* <p className="text-sm font-medium text-blue-600">Booking details</p> */}
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[26px]">
            {item.jobTitle || "Booking"}
          </h1>
          {/* <p className="mt-2 break-all text-xs text-slate-400">Document ID: {item.id}</p> */}
        </div>
        <StatusBadge value={item.status} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-6">
          <DetailPanel title="Booking information">
            <DetailGrid
              rows={[
                ["Job ID", item.jobId],
                ["Category", formatJobCategory(item.category)],
                ["Customer", item.clientName || item.clientId],
                ["Worker", item.workerName || item.workerId],
                ["Scheduled date", formatDate(item.scheduledDate)],
                ["Scheduled time", item.scheduledTimeSlot],
                ["Created", formatDateTime(item.createdAt)],
                ["Updated", formatDateTime(item.updatedAt)],
              ]}
            />
          </DetailPanel>
          <DetailPanel title="Recorded payment">
            <DetailGrid
              rows={[
                ["Agreed price", item.agreedPrice],
                ["Final amount", item.finalAmount],
                ["Payment status", item.paymentStatus],
                ["Payment method", item.paymentMethod],
                ["Pricing type", item.pricingType],
                ["Transaction ID", item.transactionId],
              ]}
            />
          </DetailPanel>
          <DetailPanel title="Location">
            <DetailGrid
              rows={[
                ["Job address", item.jobAddress],
                ["Coordinates", coordinates(item.jobLocation)],
              ]}
            />
          </DetailPanel>
        </div>
        <div className="space-y-6">
          <DetailPanel title="Booking timeline">
            <Timeline item={item} />
          </DetailPanel>
          <DetailPanel title="Review status">
            <DetailGrid
              rows={[
                ["Customer reviewed", booleanLabel(item.clientReviewed)],
                ["Worker reviewed", booleanLabel(item.workerReviewed)],
              ]}
            />
          </DetailPanel>
          {item.cancellationReason && (
            <DetailPanel title="Cancellation">
              <div className="flex gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                <XCircle size={18} className="shrink-0" />
                <p>
                  {item.cancellationReason}
                  {item.cancelledBy ? ` ${RANGE_SEPARATOR} Cancelled by ${item.cancelledBy}` : ""}
                </p>
              </div>
            </DetailPanel>
          )}
        </div>
      </div>
    </DetailFrame>
  );
}
function DetailPanel({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
      <h2 className="mb-5 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
function DetailGrid({ rows }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</dt>
          <dd className="mt-1 break-words text-sm text-slate-600">{value || EMPTY_VALUE}</dd>
        </div>
      ))}
    </dl>
  );
}
function Timeline({ item }) {
  const steps = [
    ["Accepted", item.acceptedAt, CheckCircle2],
    ["Started", item.startedAt, Clock3],
    ["Completed", item.completedAt, CheckCircle2],
    ["Cancelled", item.cancelledAt, XCircle],
  ];
  return (
    <ol className="space-y-4">
      {steps.map(([label, value, Icon]) => (
        <li key={label} className={`flex items-start gap-3 ${value ? "text-slate-700" : "text-slate-300"}`}>
          <span className="mt-0.5">
            <Icon size={17} />
          </span>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="mt-0.5 text-xs text-slate-400">{value ? formatDateTime(value) : "Not recorded"}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
function booleanLabel(value) {
  return value === true ? "Complete" : value === false ? "Not completed" : "Not recorded";
}
function coordinates(value) {
  if (!value || typeof value !== "object") return null;
  const latitude = value.latitude ?? value._lat;
  const longitude = value.longitude ?? value._long;
  if (latitude == null && longitude == null) return null;
  return `${latitude ?? EMPTY_VALUE}, ${longitude ?? EMPTY_VALUE}`;
}
function budget(item) {
  const min = Number(item.budgetMin);
  const max = Number(item.budgetMax);
  const hasMin = item.budgetMin != null && item.budgetMin !== "" && Number.isFinite(min);
  const hasMax = item.budgetMax != null && item.budgetMax !== "" && Number.isFinite(max);
  if (!hasMin && !hasMax) return EMPTY_VALUE;
  if (hasMin && hasMax)
    return (
      formatCurrency(min) +
      " " +
      RANGE_SEPARATOR +
      " " +
      formatCurrency(max) +
      (item.budgetType ? " (" + item.budgetType + ")" : "")
    );
  return formatCurrency(hasMin ? min : max);
}
