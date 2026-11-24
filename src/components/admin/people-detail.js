"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Star,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/firestore/serialization";
import { StatusBadge } from "@/components/admin/jobs-page";
import EmptyState from "@/components/admin/empty-state";

export default function PeopleDetail({ type, id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/admin/${type}/${encodeURIComponent(id)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) setData(result);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load this profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [type, id]);
  const backHref = `/admin/${type}`;
  if (loading)
    return (
      <DetailFrame href={backHref}>
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </DetailFrame>
    );
  if (error)
    return (
      <DetailFrame href={backHref}>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
      </DetailFrame>
    );
  if (!data?.item)
    return (
      <DetailFrame href={backHref}>
        <EmptyState
          title="Profile not found"
          description="This profile does not exist or is not an authorized profile type."
        />
      </DetailFrame>
    );
  return type === "customers" ? <CustomerProfile data={data} /> : <WorkerProfile data={data} />;
}

function DetailFrame({ href, children }) {
  return (
    <>
      <a
        href={href}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> Back to list
      </a>
      {children}
    </>
  );
}
function ProfileHeader({ item, type }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
      <div className="flex items-start gap-4">
        <Avatar item={item} />
        <div>
          {/* <p className="text-sm font-medium text-blue-600">
            {type === "customers" ? "Customer profile" : "Worker profile"}
          </p> */}
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-[26px]">
            {item.name || `Unnamed ${type === "customers" ? "customer" : "worker"}`}
          </h1>
          {/* <p className="mt-2 break-all text-xs text-slate-400">Document ID: {item.id}</p> */}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Profile verification workflow coming soon"
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#b8e5d9] bg-[#e8f5f3] px-3 py-2 text-xs font-semibold text-[#0f766e] opacity-100 disabled:cursor-not-allowed disabled:opacity-100"
        >
          <ShieldCheck size={14} /> Verify
        </button>
        {/* <div className="flex flex-wrap gap-2">
          <StatusBadge value={item.isActive === true ? "Active" : item.isActive === false ? "Inactive" : "Unknown"} />
          {type === "workers" && (
            <StatusBadge value={item.isOnline === true ? "Online" : item.isOnline === false ? "Offline" : "Unknown"} />
          )}
          <StatusBadge value={item.verificationStatus || (item.isVerified === true ? "Verified" : "Not verified")} />
        </div> */}
      </div>
    </div>
  );
}
function Avatar({ item }) {
  return item.photoUrl ? (
    <img src={item.photoUrl} alt="" className="size-12 rounded-xl object-cover" />
  ) : (
    <span className="grid size-12 place-items-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
      {(item.name || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}
function CustomerProfile({ data }) {
  const { item } = data;
  const address = addressFields(item.address);
  return (
    <DetailFrame href="/admin/customers">
      <ProfileHeader item={item} type="customers" />
      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <div className="space-y-6">
          <ProfilePanel title="Account details">
            <DetailGrid
              rows={[
                ["Phone", item.phone],
                ["Email", item.email],
                ["Role", item.role],
                ["Preferred language", item.preferredLanguage],
                ["Registered", formatDateTime(item.createdAt)],
                ["Last active", formatDateTime(item.lastActiveAt)],
                ["Total bookings", item.totalBookings],
              ]}
            />
          </ProfilePanel>
          <ProfilePanel title="Contact and location">
            <DetailGrid
              rows={[
                ["Full address", address.fullAddress],
                ["City", address.city],
                ["State", address.state],
                ["Pincode", address.pincode],
                ["Landmark", address.landmark],
                [
                  "Coordinates",
                  item.currentLocation
                    ? `${item.currentLocation.latitude ?? "\u2014"}, ${item.currentLocation.longitude ?? "\u2014"}`
                    : null,
                ],
                ["Verified at", formatDateTime(item.verifiedAt)],
              ]}
            />
          </ProfilePanel>
        </div>
        <div className="space-y-6">
          <RelatedJobs jobs={data.jobs || []} />
          <RelatedBookings bookings={data.bookings || []} />
        </div>
      </div>
    </DetailFrame>
  );
}
function addressFields(address) {
  if (typeof address === "string")
    return { fullAddress: address, city: null, state: null, pincode: null, landmark: null };
  if (!address || typeof address !== "object")
    return { fullAddress: null, city: null, state: null, pincode: null, landmark: null };
  return {
    fullAddress: typeof address.fullAddress === "string" ? address.fullAddress : null,
    city: typeof address.city === "string" ? address.city : null,
    state: typeof address.state === "string" ? address.state : null,
    pincode:
      typeof address.pincode === "string" || typeof address.pincode === "number" ? String(address.pincode) : null,
    landmark: typeof address.landmark === "string" ? address.landmark : null,
  };
}
function WorkerProfile({ data }) {
  const { item } = data;
  return (
    <DetailFrame href="/admin/workers">
      <ProfileHeader item={item} type="workers" />
      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <div className="space-y-6">
          <ProfilePanel title="Worker profile">
            <p className="text-sm leading-6 text-slate-600">{item.bio || "No bio recorded."}</p>
            <DetailGrid
              rows={[
                ["Email", item.email],
                ["Phone", item.phoneNumber],
                ["Experience", item.experienceYears === null ? null : `${item.experienceYears} years`],
                ["Categories", item.categories.length ? item.categories.join(", ") : null],
                ["Skills", item.skills.length ? item.skills.join(", ") : null],
                ["Verified at", formatDateTime(item.verifiedAt)],
              ]}
            />
          </ProfilePanel>
          <ProfilePanel title="Performance">
            <DetailGrid
              rows={[
                ["Average rating", item.avgRating],
                ["Total reviews", item.totalReviews],
                ["Jobs completed", item.totalJobsCompleted],
                ["Jobs cancelled", item.totalJobsCancelled],
                ["Profile views", item.profileViews],
                ["Service radius", item.serviceRadiusKm === null ? null : `${item.serviceRadiusKm} km`],
              ]}
            />
          </ProfilePanel>
          <ProfilePanel title="Weekly availability">
            <WeeklyAvailability availability={item.weeklyAvailability} />
          </ProfilePanel>
          <ProfilePanel title="Current location">
            <CurrentLocation location={item.currentLocation} />
          </ProfilePanel>
          <ProfilePanel title="Pricing">
            <PricingDetails pricing={item.pricing} />
          </ProfilePanel>
        </div>
        <div className="space-y-6">
          <ProfilePanel title="Portfolio">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {item.portfolioImageUrls.length ? (
                item.portfolioImageUrls.map((url) => (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    key={url}
                    className="aspect-video overflow-hidden rounded-xl bg-slate-100"
                  >
                    <img src={url} alt="Worker portfolio" className="size-full object-cover" />
                  </a>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState
                    title="No portfolio images"
                    description="No portfolioImageUrls are recorded for this worker."
                  />
                </div>
              )}
            </div>
          </ProfilePanel>
          <RelatedJobs jobs={data.jobs || []} />
          <RelatedBookings bookings={data.bookings || []} />
        </div>
      </div>
    </DetailFrame>
  );
}

const WEEKDAYS = [
  ["monday", "Monday"],
  ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"],
  ["thursday", "Thursday"],
  ["friday", "Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"],
];

function WeeklyAvailability({ availability }) {
  const source = availability && typeof availability === "object" && !Array.isArray(availability) ? availability : {};
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
      {WEEKDAYS.map(([key, label]) => {
        const day = source[key] || source[label] || null;
        const isAvailable = day && typeof day === "object" && day.isAvailable === true;
        const isUnavailable = day && typeof day === "object" && day.isAvailable === false;
        return (
          <div key={key} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <span className="flex items-center gap-2 text-sm">
              {isAvailable ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <span className="text-emerald-700">
                    {formatTime(day.startTime)} {"\u2013"} {formatTime(day.endTime)}
                  </span>
                </>
              ) : isUnavailable ? (
                <>
                  <XCircle size={15} className="text-slate-400" />
                  <span className="text-slate-500">Unavailable</span>
                </>
              ) : (
                <span className="text-slate-400">Not specified</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
function CurrentLocation({ location }) {
  const validLocation = location && typeof location === "object" && !Array.isArray(location);
  if (!validLocation || (location.latitude == null && location.longitude == null))
    return <p className="text-sm text-slate-500">Location not available.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <CoordinateCard label="Latitude" value={location.latitude} />
      <CoordinateCard label="Longitude" value={location.longitude} />
    </div>
  );
}

function CoordinateCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</p>
      <p className="mt-2 break-all font-mono text-sm text-slate-700">
        {value == null ? "Not specified" : String(value)}
      </p>
    </div>
  );
}

function PricingDetails({ pricing }) {
  const source = pricing && typeof pricing === "object" && !Array.isArray(pricing) ? pricing : {};
  return (
    <DetailGrid
      rows={[
        ["Pricing type", source.type || source.pricingType],
        ["Hourly rate", formatCurrency(source.hourlyRate)],
        ["Minimum job price", formatCurrency(source.minJobPrice)],
        ["Maximum job price", formatCurrency(source.maxJobPrice)],
      ]}
    />
  );
}

function formatCurrency(value) {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "Not specified";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(
    Number(value),
  );
}

function formatTime(value) {
  if (typeof value !== "string" || !value.trim()) return "Not specified";
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return trimmed;
  const hours = Number(match[1]);
  const minutes = match[2];
  if (hours > 23) return trimmed;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes} ${suffix}`;
}
function ProfilePanel({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
      <h2 className="mb-5 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
function DetailGrid({ rows }) {
  return (
    <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</dt>
          <dd className="mt-1 break-words text-sm text-slate-600">{value || "\u2014"}</dd>
        </div>
      ))}
    </dl>
  );
}
function RelatedJobs({ jobs }) {
  return (
    <ProfilePanel title="Related jobs">
      <div className="space-y-2">
        {jobs.length ? (
          jobs.map((job) => (
            <a
              href={`/admin/jobs/${job.id}`}
              key={job.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <BriefcaseBusiness size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-700">
                  {job.title || "Untitled job"}
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  {job.category || "No category"} {"\u00b7"} {formatDate(job.createdAt)}
                </span>
              </span>
              <StatusBadge value={job.status} />
            </a>
          ))
        ) : (
          <EmptyState title="No related jobs" description="No verified job relationship was found for this profile." />
        )}
      </div>
    </ProfilePanel>
  );
}
function RelatedBookings({ bookings }) {
  return (
    <ProfilePanel title="Related bookings">
      <div className="space-y-2">
        {bookings.length ? (
          bookings.map((booking) => (
            <a
              href={`/admin/bookings/${booking.id}`}
              key={booking.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <CalendarDays size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-700">
                  {booking.jobTitle || "Booking"}
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  {formatDate(booking.scheduledDate)} {"\u00b7"} {booking.id}
                </span>
              </span>
              <StatusBadge value={booking.status} />
            </a>
          ))
        ) : (
          <EmptyState
            title="No related bookings"
            description="No verified booking relationship was found for this profile."
          />
        )}
      </div>
    </ProfilePanel>
  );
}
