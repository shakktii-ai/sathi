"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, RefreshCw, Search, UserRound } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import EmptyState from "@/components/admin/empty-state";
import { formatDate } from "@/lib/firestore/serialization";
import { Pagination, StatusBadge } from "@/components/admin/jobs-page";

export default function CustomersPage() {
  const [filters, setFilters] = useState({ search: "", accountStatus: "", verificationStatus: "" });
  const [page, setPage] = useState({ index: 0, cursor: null, nextCursor: null, history: [] });
  const [items, setItems] = useState([]);
  const [facets, setFacets] = useState({ verificationStatuses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { search, accountStatus, verificationStatus } = filters;
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries({ search, accountStatus, verificationStatus, cursor: page.cursor }).filter(
            ([, value]) => value,
          ),
        ),
      );
      try {
        const response = await fetch(`/api/admin/customers?${params}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!cancelled) {
          setItems(result.items || []);
          setFacets(result.facets || { verificationStatuses: [] });
          setPage((current) => ({ ...current, nextCursor: result.nextCursor || null }));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load customers.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [search, accountStatus, verificationStatus, page.cursor]);
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
          
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Customers</h1>
          <p className="mt-2 text-sm text-slate-500">Manage customer accounts, activity, and verification.</p>
        </div>
     
      </div>
      <Panel title="Customer directory" eyebrow="Customers management">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search name, phone or email"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              label="Account"
              value={filters.accountStatus}
              options={["active", "inactive"]}
              onChange={(value) => updateFilter("accountStatus", value)}
            />
            <Select
              label="Verification"
              value={filters.verificationStatus}
              options={facets.verificationStatuses}
              onChange={(value) => updateFilter("verificationStatus", value)}
            />
            <button
              type="button"
              onClick={() => {
                setFilters({ search: "", accountStatus: "", verificationStatus: "" });
                setPage({ index: 0, cursor: null, nextCursor: null, history: [] });
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              <RefreshCw size={15} /> Reset
            </button>
          </div>
        </div>
        {error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            {error}
            {error.includes("SATHI_CUSTOMER_ROLE_VALUES") && (
              <p className="mt-2 text-xs">
                Configure this server-only variable with the exact customer role values from the existing Firebase
                project, for example a comma-separated list.
              </p>
            )}
          </div>
        ) : loading ? (
          <LoadingRows />
        ) : items.length === 0 ? (
          <EmptyState
            title="No customers found"
            description="Try adjusting the filters, or confirm that authorized customer role values are configured."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Account</th>
                  <th className="px-4 py-3 font-semibold">Verification</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((customer) => (
                  <tr key={customer.id} className="text-sm hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <a
                        href={`/admin/customers/${customer.id}`}
                        className="font-semibold text-slate-800 hover:text-blue-600"
                      >
                        {customer.name || "Unnamed customer"}
                      </a>
                      {/* <p className="mt-1 text-xs text-slate-400">{customer.id}</p> */}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{customer.phone || "\u2014"}</td>
                    <td className="px-4 py-4 text-slate-600">{customer.email || "\u2014"}</td>
                    <td className="px-4 py-4">
                      <StatusBadge
                        value={
                          customer.isActive === true ? "Active" : customer.isActive === false ? "Inactive" : "Unknown"
                        }
                      />
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {customer.verificationStatus || (customer.isVerified === true ? "Verified" : "\u2014")}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(customer.createdAt)}</td>
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
        <option value="">All {label.toLowerCase()}</option>
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
