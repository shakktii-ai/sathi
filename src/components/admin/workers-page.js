"use client";

import { useEffect, useState } from "react";
import { BriefcaseBusiness, Filter, RefreshCw, Search, UserRoundCheck } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import EmptyState from "@/components/admin/empty-state";
import { formatDate } from "@/lib/firestore/serialization";
import { Pagination, StatusBadge } from "@/components/admin/jobs-page";

export default function WorkersPage() {
  const [filters, setFilters] = useState({
    search: "",
    active: "",
    online: "",
    verificationStatus: "",
    category: "",
  });
  const [page, setPage] = useState({
    index: 0,
    cursor: null,
    nextCursor: null,
    history: [],
  });
  const [items, setItems] = useState([]);
  const [facets, setFacets] = useState({
    verificationStatuses: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { search, active, online, verificationStatus, category } = filters;
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries({
            search,
            active,
            online,
            verificationStatus,
            category,
            cursor: page.cursor,
          }).filter(([, value]) => value),
        ),
      );
      try {
        const response = await fetch(`/api/admin/workers?${params}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) {
          setItems(result.items || []);
          setFacets(result.facets || { verificationStatuses: [], categories: [] });
          setPage((current) => ({
            ...current,
            nextCursor: result.nextCursor || null,
          }));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load workers.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [search, active, online, verificationStatus, category, page.cursor]);
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
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Workers</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review worker activity, verification and service profile information.
          </p>
        </div>
      </div>
      <Panel title="Worker directory" eyebrow="Workers management">
        <div className="mb-5 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Search name, phone, email or category"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <Select
                label="Active"
                value={filters.active}
                options={["true", "false"]}
                labels={["Active", "Inactive"]}
                onChange={(value) => updateFilter("active", value)}
              />
              <Select
                label="Online"
                value={filters.online}
                options={["true", "false"]}
                labels={["Online", "Offline"]}
                onChange={(value) => updateFilter("online", value)}
              />
              <Select
                label="Verification"
                value={filters.verificationStatus}
                options={facets.verificationStatuses}
                onChange={(value) => updateFilter("verificationStatus", value)}
              />
              <Select
                label="Category"
                value={filters.category}
                options={facets.categories}
                onChange={(value) => updateFilter("category", value)}
              />
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    search: "",
                    active: "",
                    online: "",
                    verificationStatus: "",
                    category: "",
                  });
                  setPage({
                    index: 0,
                    cursor: null,
                    nextCursor: null,
                    history: [],
                  });
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-500 hover:bg-slate-50"
              >
                <RefreshCw size={15} /> Reset
              </button>
            </div>
          </div>
        </div>
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : loading ? (
          <LoadingRows />
        ) : items.length === 0 ? (
          <EmptyState
            title="No workers found"
            description="Try adjusting the filters, or confirm that the workers collection contains records."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Worker</th>
                  <th className="px-4 py-3 font-semibold">Categories</th>
                  <th className="px-4 py-3 font-semibold">Experience</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Jobs completed</th>
                  <th className="px-4 py-3 font-semibold">Activity</th>
                  <th className="px-4 py-3 font-semibold">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((worker) => (
                  <tr key={worker.id} className="text-sm hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <a
                        href={`/admin/workers/${worker.id}`}
                        className="font-semibold text-slate-800 hover:text-blue-600"
                      >
                        {worker.name || "Unnamed worker"}
                      </a>
                      <p className="mt-1 text-xs text-slate-400">{worker.email || worker.phoneNumber || worker.id}</p>
                    </td>
                    <td className="max-w-48 px-4 py-4 text-slate-600">
                      {worker.categories.length ? worker.categories.join(", ") : "\u2014"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {worker.experienceYears ?? "\u2014"}
                      {worker.experienceYears !== null ? " yrs" : ""}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {Number.isFinite(Number(worker.avgRating)) ? Number(worker.avgRating).toFixed(1) : "0"}
                      <p className="mt-1 text-xs text-slate-400">{worker.totalReviews || 0} reviews</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{worker.totalJobsCompleted ?? "\u2014"}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1.5">
                        <StatusBadge
                          value={
                            worker.isActive === true ? "Active" : worker.isActive === false ? "Inactive" : "Unknown"
                          }
                        />
                        <StatusBadge
                          value={
                            worker.isOnline === true ? "Online" : worker.isOnline === false ? "Offline" : "Unknown"
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {worker.verificationStatus || (worker.isVerified === true ? "Verified" : "\u2014")}
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
            {labels[index]}
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
