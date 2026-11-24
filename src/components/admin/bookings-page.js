"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, CreditCard, Filter, RefreshCw, Search } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import EmptyState from "@/components/admin/empty-state";
import { formatDate } from "@/lib/firestore/serialization";
import { Pagination, StatusBadge } from "@/components/admin/jobs-page";

export default function BookingsPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    dateFrom: "",
    dateTo: "",
  });
  const [page, setPage] = useState({
    index: 0,
    cursor: null,
    nextCursor: null,
    history: [],
  });
  const [items, setItems] = useState([]);
  const [facets, setFacets] = useState({ statuses: [], paymentStatuses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { search, status, paymentStatus, dateFrom, dateTo } = filters;
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            search,
            status,
            paymentStatus,
            dateFrom,
            dateTo,
            cursor: page.cursor,
          }).filter(([, value]) => value),
        ),
      );
      try {
        const response = await fetch(`/api/admin/bookings?${params}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) {
          setItems(result.items || []);
          setFacets(result.facets || { statuses: [], paymentStatuses: [] });
          setPage((current) => ({
            ...current,
            nextCursor: result.nextCursor || null,
          }));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load bookings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [search, status, paymentStatus, dateFrom, dateTo, page.cursor]);
  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage({ index: 0, cursor: null, nextCursor: null, history: [] });
  }
  function nextPage() {
    if (page.nextCursor)
      setPage((current) => ({
        index: current.index + 1,
        cursor: current.nextCursor,
        nextCursor: null,
        history: [...current.history, current.cursor],
      }));
  }
  function previousPage() {
    if (page.index > 0)
      setPage((current) => ({
        index: current.index - 1,
        cursor: current.history[current.history.length - 1] || null,
        nextCursor: null,
        history: current.history.slice(0, -1),
      }));
  }
  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Bookings</h1>
          <p className="mt-2 text-sm text-slate-500">Track customer-to-worker bookings and recorded payment status.</p>
        </div>
       
      </div>
      <Panel title="All bookings">
        <div className="mb-5 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Search booking ID, job, customer or worker"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <FilterSelect
                label="Status"
                value={filters.status}
                options={facets.statuses}
                onChange={(value) => updateFilter("status", value)}
              />
              <FilterSelect
                label="Payment"
                value={filters.paymentStatus}
                options={facets.paymentStatuses}
                onChange={(value) => updateFilter("paymentStatus", value)}
              />
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    search: "",
                    status: "",
                    paymentStatus: "",
                    dateFrom: "",
                    dateTo: "",
                  })
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-500 hover:bg-slate-50"
              >
                <RefreshCw size={15} /> Reset
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Scheduled date</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-blue-400"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
              className="h-9 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-blue-400"
            />
          </div>
        </div>
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : loading ? (
          <LoadingRows />
        ) : items.length === 0 ? (
          <EmptyState
            title="No bookings found"
            description="Try adjusting the search or filters, or confirm that the bookings collection contains records."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Booking</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Worker</th>
                  <th className="px-4 py-3 font-semibold">Scheduled</th>
                  <th className="px-4 py-3 font-semibold">Recorded amount</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((booking) => (
                  <tr key={booking.id} className="text-sm hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <a
                        href={`/admin/bookings/${booking.id}`}
                        className="font-semibold text-slate-800 hover:text-blue-600"
                      >
                        {booking.jobTitle || "Booking"}
                      </a>
                      {/* <p className="mt-1 text-xs text-slate-400">{booking.id}</p> */}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{booking.clientName || booking.clientId || "\u2014"}</td>
                    <td className="px-4 py-4 text-slate-600">{booking.workerName || booking.workerId || "\u2014"}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(booking.scheduledDate)}
                      <p className="mt-1 text-xs text-slate-400">{booking.scheduledTimeSlot || "\u2014"}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <div>Agreed: {booking.agreedPrice ?? "\u2014"}</div>
                      <div className="mt-1 text-xs text-slate-400">Final: {booking.finalAmount ?? "\u2014"}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <CreditCard size={14} className="text-slate-400" />
                        {booking.paymentStatus || "\u2014"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          index={page.index}
          hasNext={Boolean(page.nextCursor)}
          loading={loading}
          previous={previousPage}
          next={nextPage}
        />
      </Panel>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-36 appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 outline-none focus:border-blue-400"
      >
        <option value="">All {label.toLowerCase()}s</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Filter size={13} className="pointer-events-none absolute right-3 top-3.5 text-slate-400" />
    </label>
  );
}
function LoadingRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((row) => (
        <div key={row} className="h-14 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}
