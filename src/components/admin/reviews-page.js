"use client";

import { useEffect, useState } from "react";
import { Filter, RefreshCw, Search, Star } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import EmptyState from "@/components/admin/empty-state";
import { Pagination } from "@/components/admin/jobs-page";
import { formatDate } from "@/lib/firestore/serialization";

export default function ReviewsPage() {
  const [filters, setFilters] = useState({ search: "", rating: "", role: "", category: "", reported: "", edited: "" });
  const [page, setPage] = useState({ index: 0, cursor: null, nextCursor: null, history: [] });
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [facets, setFacets] = useState({ roles: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries({ ...filters, cursor: page.cursor }).filter(([, value]) => value)),
      );
      try {
        const response = await fetch(`/api/admin/reviews?${params}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) {
          setItems(result.items || []);
          setSummary(result.summary || null);
          setFacets(result.facets || { roles: [], categories: [] });
          setPage((current) => ({ ...current, nextCursor: result.nextCursor || null }));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load reviews.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filters, page.cursor]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage({ index: 0, cursor: null, nextCursor: null, history: [] });
  }
  function reset() {
    setFilters({ search: "", rating: "", role: "", category: "", reported: "", edited: "" });
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
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Reviews</h1>
          <p className="mt-2 text-sm text-slate-500">Monitor customer and worker feedback across the marketplace.</p>
        </div>
      </div>
      {/* <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total reviews" value={summary?.total} />
        <Metric
          label="Average rating"
          value={summary?.averageRating == null ? null : `${summary.averageRating.toFixed(1)} / 5`}
        />
        <Metric label="Reported reviews" value={summary?.reported} />
        <Metric label="Edited reviews" value={summary?.edited} />
      </div> */}
      <Panel title="Review directory">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search reviewer, recipient or user ID"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Select
              label="Rating"
              value={filters.rating}
              options={["1", "2", "3", "4", "5"]}
              onChange={(value) => updateFilter("rating", value)}
            />
            <Select
              label="Role"
              value={filters.role}
              options={facets.roles}
              onChange={(value) => updateFilter("role", value)}
            />
            <Select
              label="Category"
              value={filters.category}
              options={facets.categories}
              onChange={(value) => updateFilter("category", value)}
            />
            {/* <Select
              label="Reported"
              value={filters.reported}
              options={["true", "false"]}
              labels={["Reported", "Not reported"]}
              onChange={(value) => updateFilter("reported", value)}
            />
            <Select
              label="Edited"
              value={filters.edited}
              options={["true", "false"]}
              labels={["Edited", "Not edited"]}
              onChange={(value) => updateFilter("edited", value)}
            /> */}
            <button
              type="button"
              onClick={reset}
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
            title="No reviews found"
            description="Try adjusting the filters, or confirm that the reviews collection contains records."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reviewer</th>
                  <th className="px-4 py-3 font-semibold">Reviewed person</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Comment</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  {/* <th className="px-4 py-3 font-semibold">Status</th> */}
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((review) => (
                  <tr key={review.id} className="text-sm hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">
                        {review.fromUserName || review.fromUserId || "Reviewer unavailable"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{review.fromRole || "Role unavailable"}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {review.toUserName || review.toUserId || "Recipient unavailable"}
                    </td>
                    <td className="px-4 py-4">
                      <Stars rating={review.rating} />
                    </td>
                    <td className="px-4 py-4 text-slate-600">{review.category || "Category unavailable"}</td>
                    <td className="max-w-64 px-4 py-4 text-slate-600">
                      <p className="truncate">{review.comment || "No comment"}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-slate-600">{formatDate(review.createdAt)}</td>
                    {/* <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {review.isEdited && <Flag label="Edited" tone="blue" />}
                        {review.isReported ? <Flag label="Reported" tone="red" /> : <Flag label="Clear" tone="green" />}
                      </div>
                    </td> */}
                    <td className="px-4 py-4">
                      <a
                        href={`/admin/reviews/${review.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View
                      </a>
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

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_6px_18px_rgba(20,43,74,0.04)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-4 text-2xl font-semibold text-slate-900">{value == null ? "—" : value}</p>
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
          size={14}
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
function Select({ label, value, options, labels = options, onChange }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 min-w-28 appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 outline-none focus:border-blue-400"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option, index) => (
          <option key={option} value={option}>
            {labels[index] || option}
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
