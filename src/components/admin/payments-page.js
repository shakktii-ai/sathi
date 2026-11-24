"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, CreditCard, Filter, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import EmptyState from "@/components/admin/empty-state";
import StatCard from "@/components/admin/stat-card";
import { Pagination } from "@/components/admin/jobs-page";
import { EMPTY_VALUE, formatCurrency, formatDateTime } from "@/lib/firestore/serialization";

const initialSummary = { total: 0, succeeded: 0, failed: 0, pending: 0 };

export default function PaymentsPage() {
  const [filters, setFilters] = useState({ search: "", status: "", method: "" });
  const [page, setPage] = useState({ index: 0, cursor: null, nextCursor: null, history: [] });
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(initialSummary);
  const [facets, setFacets] = useState({ statuses: [], methods: [] });
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
        const response = await fetch("/api/admin/payments?" + params);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) {
          setItems(result.items || []);
          setSummary(result.summary || initialSummary);
          setFacets(result.facets || { statuses: [], methods: [] });
          setPage((current) => ({ ...current, nextCursor: result.nextCursor || null }));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load payment records.");
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
    setFilters({ search: "", status: "", method: "" });
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
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Payments</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review app-recorded transaction activity. These records are unverified and do not confirm completed payment.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          <ShieldAlert size={14} /> App-recorded only
        </span>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total transactions" value={summary.total} icon={ArrowLeftRight} accent="blue" />
        <StatCard label="Succeeded records" value={summary.succeeded} icon={CreditCard} accent="emerald" />
        <StatCard label="Failed records" value={summary.failed} icon={CreditCard} accent="rose" />
        <StatCard label="Pending records" value={summary.pending} icon={CreditCard} accent="amber" />
      </div>
      <Panel title="Transaction records">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search transaction, booking, customer or worker ID"
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
              label="Method"
              value={filters.method}
              options={facets.methods}
              onChange={(value) => updateFilter("method", value)}
            />
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
          <EmptyState title="No transaction records found" description="Try adjusting the search or filters." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Transaction</th>
                  <th className="px-4 py-3 font-semibold">Booking</th>
                  <th className="px-4 py-3 font-semibold">Participants</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="text-sm hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <a
                        href={"/admin/payments/" + item.id}
                        className="font-semibold text-slate-800 hover:text-blue-600"
                      >
                        {item.id}
                      </a>
                      <p className="mt-1 text-xs text-slate-400">{item.direction || "Direction unavailable"}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{item.bookingId || EMPTY_VALUE}</td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      <div>Client: {item.clientId || EMPTY_VALUE}</div>
                      <div className="mt-1">Worker: {item.workerId || EMPTY_VALUE}</div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-4 text-slate-600">{item.method || EMPTY_VALUE}</td>
                    <td className="px-4 py-4">
                      <TransactionStatus value={item.status} />
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">{formatDateTime(item.createdAt)}</td>
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
        className="h-10 min-w-32 appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 outline-none focus:border-blue-400"
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
export function TransactionStatus({ value }) {
  const normalized = String(value || "").toLowerCase();
  const colors =
    normalized === "succeeded"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "failed"
        ? "bg-rose-50 text-rose-700"
        : normalized === "pending"
          ? "bg-amber-50 text-amber-800"
          : "bg-slate-100 text-slate-600";
  return (
    <span className={"inline-flex rounded-full px-2.5 py-1 text-xs font-semibold " + colors}>{value || "Unknown"}</span>
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
