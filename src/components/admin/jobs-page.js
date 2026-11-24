"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, ChevronLeft, ChevronRight, Filter, MapPin, RefreshCw, Search } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import EmptyState from "@/components/admin/empty-state";
import {
  EMPTY_VALUE,
  formatCurrency,
  formatDate,
  formatJobCategory,
  RANGE_SEPARATOR,
} from "@/lib/firestore/serialization";

export default function JobsPage() {
  const [filters, setFilters] = useState({ search: "", status: "", category: "" });
  const [page, setPage] = useState({ index: 0, cursor: null, nextCursor: null, history: [] });
  const [items, setItems] = useState([]);
  const [facets, setFacets] = useState({ statuses: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { search, status, category } = filters;
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(status && { status }),
        ...(category && { category }),
        ...(page.cursor && { cursor: page.cursor }),
      });
      try {
        const response = await fetch(`/api/admin/jobs?${params}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) {
          setItems(result.items || []);
          setFacets(result.facets || { statuses: [], categories: [] });
          setPage((current) => ({ ...current, nextCursor: result.nextCursor || null }));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load jobs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [search, status, category, page.cursor]);

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
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Jobs</h1>
          <p className="mt-2 text-sm text-slate-500">Review customer-posted jobs without changing worker selection.</p>
        </div>
     
      </div>
      <Panel title="All jobs">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search title, customer, category or job ID"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              label="Status"
              value={filters.status}
              options={facets.statuses}
              onChange={(value) => updateFilter("status", value)}
            />
            <Select
              label="Category"
              value={filters.category}
              options={facets.categories}
              onChange={(value) => updateFilter("category", value)}
            />
            <button
              type="button"
              onClick={() => setFilters({ search: "", status: "", category: "" })}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              <RefreshCw size={15} /> Reset
            </button>
          </div>
        </div>
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : loading ? (
          <LoadingRows />
        ) : items.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Try adjusting the search or filters, or confirm that the jobs collection contains records."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[920px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Job</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Budget</th>
                  <th className="px-4 py-3 font-semibold">Preferred</th>
                  <th className="px-4 py-3 font-semibold">Workers</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((job) => (
                  <tr key={job.id} className="text-sm hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <a href={`/admin/jobs/${job.id}`} className="font-semibold text-slate-800 hover:text-blue-600">
                        {job.title || "Untitled job"}
                      </a>
                      <p className="mt-1 max-w-56 truncate text-xs text-slate-400">{formatJobCategory(job.category)}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{job.clientName || job.clientId || EMPTY_VALUE}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex max-w-44 items-center gap-1.5 truncate text-slate-600">
                        <MapPin size={14} className="shrink-0 text-slate-400" />
                        {job.address || job.landmark || EMPTY_VALUE}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{budget(job)}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(job.preferredDate)}
                      <p className="mt-1 text-xs text-slate-400">{job.preferredTimeSlot || EMPTY_VALUE}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {job.interestedWorkerIds.length}
                      <p className="mt-1 max-w-40 truncate text-xs text-slate-400">
                        {job.assignedWorkerId ? job.assignedWorkerName || "Name unavailable" : "Unassigned"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={job.status} />
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

function Select({ label, value, options, onChange }) {
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
function budget(job) {
  const min = Number(job.budgetMin);
  const max = Number(job.budgetMax);
  const hasMin = job.budgetMin != null && job.budgetMin !== "" && Number.isFinite(min);
  const hasMax = job.budgetMax != null && job.budgetMax !== "" && Number.isFinite(max);
  if (!hasMin && !hasMax) return EMPTY_VALUE;
  if (hasMin && hasMax) return formatCurrency(min) + " " + RANGE_SEPARATOR + " " + formatCurrency(max);
  return formatCurrency(hasMin ? min : max);
}
export function StatusBadge({ value }) {
  const normalized = String(value || "").toLowerCase();
  const tone =
    normalized.includes("complete") ||
    normalized.includes("success") ||
    normalized === "active" ||
    normalized === "verified" ||
    normalized === "assigned" ||
    normalized === "paid"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
      : normalized.includes("cancel") ||
          normalized.includes("fail") ||
          normalized === "inactive" ||
          normalized === "rejected"
        ? "bg-rose-50 text-rose-700 ring-rose-600/10"
        : normalized.includes("pending") || normalized === "open" || normalized.includes("progress")
          ? "bg-amber-50 text-amber-800 ring-amber-600/10"
          : "bg-slate-100 text-slate-600 ring-slate-500/10";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset " +
        tone
      }
    >
      {value || "Unknown"}
    </span>
  );
}
export function Pagination({ index, hasNext, loading, previous, next }) {
  return (
    <div className="mt-5 flex items-center justify-between">
      <p className="text-xs text-slate-400">
        Page {index + 1} {" " + RANGE_SEPARATOR + " "} Showing a bounded page of results.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={index === 0 || loading}
          onClick={previous}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <button
          type="button"
          disabled={!hasNext || loading}
          onClick={next}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
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
