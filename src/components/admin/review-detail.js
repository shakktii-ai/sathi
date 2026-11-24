"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import EmptyState from "@/components/admin/empty-state";
import { formatDateTime } from "@/lib/firestore/serialization";

export default function ReviewDetail({ id }) {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/reviews/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) setItem(result.item);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || "Unable to load this review.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  if (error)
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>;
  if (!item)
    return (
      <div className="space-y-5">
        <Skeleton />
        <Skeleton />
      </div>
    );
  return (
    <div>
      <Link
        href="/admin/reviews"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> Back to reviews
      </Link>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          {/* <p className="text-sm font-medium text-blue-600">Review details</p> */}
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">
            {item.fromUserName || item.fromUserId || "Review"}
          </h1>
          {/* <p className="mt-2 break-all text-xs text-slate-400">Document ID: {item.id}</p> */}
        </div>
        {/* <div className="flex items-center gap-2">
          <Flag label={item.isReported ? "Reported" : "Clear"} tone={item.isReported ? "red" : "green"} />
          {item.isEdited && <Flag label="Edited" tone="blue" />}
        </div> */}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <Panel title="Review information">
          <div className="mb-5 flex items-center gap-2">
            <Stars rating={item.rating} />
            <span className="text-sm font-semibold text-slate-700">
              {item.rating == null ? "Rating unavailable" : `${item.rating} / 5`}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {item.comment || "No comment recorded."}
          </p>
          <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Info label="Reviewer" value={item.fromUserName || item.fromUserId} />
            <Info label="Reviewer role" value={item.fromRole} />
            <Info label="Reviewed person" value={item.toUserName || item.toUserId} />
            <Info label="Category" value={item.category} />
            {/* <Info label="Booking ID" value={item.bookingId} />
            <Info label="Job ID" value={item.jobId} /> */}
            <Info label="Created" value={formatDateTime(item.createdAt)} />
            <Info label="Edited" value={item.editedAt ? formatDateTime(item.editedAt) : "Not edited"} />
          </dl>
        </Panel>
        <Panel title="Report status">
          <Info label="Status" value={item.isReported ? "Reported" : "Not reported"} />
          <div className="mt-5">
            <Info label="Report reason" value={item.reportReason || "No report reason recorded."} />
          </div>
        </Panel>
      </div>
      {item.photoUrls.length > 0 && (
        <div className="mt-6">
          <Panel title="Review photos">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {item.photoUrls.map((url) => (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  key={url}
                  className="aspect-video overflow-hidden rounded-xl bg-slate-100"
                >
                  <img src={url} alt="Review attachment" className="size-full object-cover" />
                </a>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
function Info({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-700">{value || "—"}</dd>
    </div>
  );
}
function Stars({ rating }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={rating == null ? "Rating unavailable" : `${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={rating != null && star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
    </span>
  );
}
function Flag({ label, tone }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${tones[tone]}`}>{label}</span>;
}
function Skeleton() {
  return <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />;
}
