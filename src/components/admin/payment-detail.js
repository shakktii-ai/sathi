"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CreditCard, UserRound, Users } from "lucide-react";
import EmptyState from "@/components/admin/empty-state";
import { TransactionStatus } from "@/components/admin/payments-page";
import { EMPTY_VALUE, formatCurrency, formatDateTime } from "@/lib/firestore/serialization";

export default function PaymentDetail({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/admin/payments/" + encodeURIComponent(id));
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) setData(result);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load this payment record.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);
  if (loading)
    return (
      <DetailFrame>
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </DetailFrame>
    );
  if (error)
    return (
      <DetailFrame>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
      </DetailFrame>
    );
  if (!data?.item)
    return (
      <DetailFrame>
        <EmptyState
          title="Payment record not found"
          description="This transaction does not exist or is no longer available."
        />
      </DetailFrame>
    );
  const { item, booking, customer, worker } = data;
  return (
    <DetailFrame>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-blue-600">App-recorded transaction</p>
          <h1 className="mt-1 break-all text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
            Payment details
          </h1>
          <p className="mt-2 break-all text-xs text-slate-400">Transaction ID: {item.id}</p>
        </div>
        <TransactionStatus value={item.status} />
      </div>
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <CreditCard size={18} className="mt-1 shrink-0" />
        <p>
          This is an app-recorded, unverified transaction. A succeeded status does not independently confirm that
          payment was completed, and recorded fees are not confirmed Sathi revenue.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-6">
          <DetailPanel title="Transaction information">
            <DetailGrid
              rows={[
                ["Amount", formatCurrency(item.amount)],
                ["Recorded fee", formatCurrency(item.platformFee)],
                ["GST", formatCurrency(item.gst)],
                ["Net amount", formatCurrency(item.netAmount)],
                ["Method", item.method],
                ["Direction", item.direction],
                ["Actor ID", item.actorId],
                ["Description", item.description],
                ["Gateway reference", item.gatewayRef],
                ["Recorded at", formatDateTime(item.createdAt)],
                ["Refunded at", formatDateTime(item.refundedAt)],
              ]}
            />
          </DetailPanel>
          <DetailPanel title="Related booking">
            <RelatedBooking booking={booking} fallbackId={item.bookingId} />
          </DetailPanel>
        </div>
        <div className="space-y-6">
          <DetailPanel title="Customer">
            <RelatedPerson icon={UserRound} label="Customer" person={customer} fallbackId={item.clientId} />
          </DetailPanel>
          <DetailPanel title="Worker">
            <RelatedPerson icon={Users} label="Worker" person={worker} fallbackId={item.workerId} />
          </DetailPanel>
        </div>
      </div>
    </DetailFrame>
  );
}

function DetailFrame({ children }) {
  return (
    <>
      <Link
        href="/admin/payments"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> Back to payments
      </Link>
      {children}
    </>
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
function RelatedBooking({ booking, fallbackId }) {
  return booking ? (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
      <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
        <CalendarDays size={17} />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-700">{booking.jobTitle || "Booking"}</p>
        <p className="mt-1 text-xs text-slate-500">Booking ID: {booking.id}</p>
        <p className="mt-1 text-xs text-slate-500">
          Status: {booking.status || "Unknown"} {"\u00b7"} {formatDateTime(booking.createdAt)}
        </p>
      </div>
    </div>
  ) : (
    <p className="text-sm text-slate-500">No booking record was found for {fallbackId || "this transaction"}.</p>
  );
}
function RelatedPerson({ icon: Icon, label, person, fallbackId }) {
  return person ? (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
      <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={17} />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-700">{person.name || label}</p>
        <p className="mt-1 break-all text-xs text-slate-500">
          {person.email || person.phone || person.phoneNumber || EMPTY_VALUE}
        </p>
        <p className="mt-1 text-xs text-slate-400">Record ID: {person.id}</p>
      </div>
    </div>
  ) : (
    <p className="text-sm text-slate-500">
      No {label.toLowerCase()} record was found for {fallbackId || "this transaction"}.
    </p>
  );
}
