"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "next/link";
import {
  // BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ArrowLeftRight,
  CircleHelp,
  ClipboardList,
  // CreditCard,
  LayoutDashboard,
  Menu,
  // MessageSquareWarning,
  Search,
  // Settings,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  // Tags,
  Users,
  // UserRoundCog,
  UserRoundCheck,
  // WalletCards,
  X,
  User,
} from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";
import { Panel } from "@/components/ui/panel";
import StatCard from "@/components/admin/stat-card";
import EmptyState from "@/components/admin/empty-state";
import BookingStatusChart from "@/components/admin/booking-status-chart";
import { EMPTY_VALUE, RANGE_SEPARATOR, formatDate, formatDateTime } from "@/lib/firestore/serialization";
import { StatusBadge } from "@/components/admin/jobs-page";
import Image from "next/image";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Jobs", icon: BriefcaseBusiness, href: "/admin/jobs" },
  { label: "Applications", icon: CalendarDays, href: "/admin/bookings" },
  // { label: "Payments", icon: ArrowLeftRight, href: "/admin/payments" },
  { label: "Customers", icon: Users, href: "/admin/customers" },
  { label: "Workers", icon: UserRoundCheck, href: "/admin/workers" },
  { label: "Reviews", icon: Star, href: "/admin/reviews" },
  // { label: "Categories & Services", icon: Tags },
  // { label: "Worker Subscriptions", icon: CreditCard },
  // { label: "Wallets & Payout Accounts", icon: WalletCards },
  // { label: "Reviews & Ratings", icon: Star },
  // { label: "Complaints & Support", icon: MessageSquareWarning },
  // { label: "Reports & Analytics", icon: BarChart3 },
  // { label: "Notifications", icon: Bell },
  // { label: "Admin Users & Roles", icon: UserRoundCog },
  // { label: "Settings", icon: Settings },
];

const stats = [
  ["Total Customers", "totalCustomers", Users, "blue"],
  ["Total Workers", "totalWorkers", UserRoundCheck, "indigo"],
  ["Total Jobs", "totalJobs", BriefcaseBusiness, "violet"],
  ["Open Jobs", "openJobs", ClipboardList, "cyan"],
  ["Total Bookings", "totalBookings", CalendarDays, "emerald"],
  ["Completed", "completedBookings", ShieldCheck, "blue"],
  ["Cancelled", "cancelledBookings", CircleHelp, "rose"],
  ["Pending verifications", "pendingWorkerVerifications", SlidersHorizontal, "amber"],
];

export default function AdminDashboard({ session, overview }) {
  return (
    <AdminShell session={session} activePage="Dashboard" title="Overview">
      <DashboardContent overview={overview} />
    </AdminShell>
  );
}

export function AdminShell({ session, children, activePage, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const displayName = session.name || session.email?.split("@")[0] || "Administrator";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-screen overflow-hidden bg-[#f5f7fb] text-[#172033]">
      <div className="flex h-screen min-h-0">
        <Sidebar open={sidebarOpen} close={() => setSidebarOpen(false)} activePage={activePage} />
        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden lg:pl-[288px]">
          <Topbar displayName={displayName} initials={initials} openMenu={() => setSidebarOpen(true)} title={title} />
          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-[1680px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ overview }) {
  if (!overview)
    return (
      <>
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
            Good to see you, Sathi
          </h1>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
          <p className="font-semibold">Dashboard data is unavailable.</p>
          <p className="mt-1">
            The protected page loaded, but the overview could not be completed. Try refreshing the page.
          </p>
        </div>
      </>
    );
  return (
    <>
      {/* <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Good to see you, Sathi</h1>
        <p className="mt-1 text-sm text-slate-500">A clear view of marketplace activity and performance.</p>
      </div> */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, key, Icon, accent]) => (
          <StatCard key={label} label={label} value={overview.stats[key]} icon={Icon} accent={accent} />
        ))}
      </section>
      <section className="mt-6 grid gap-6 ">
        {/* <Panel title="Booking status" eyebrow="Performance">
          <BookingStatusChart data={overview.bookingStatuses} />
        </Panel> */}
        <RecentJobs jobs={overview.recentJobs} />
      </section>
      <section className="mt-6">
        <RecentBookings bookings={overview.recentBookings} />
      </section>
    </>
  );
}

function ActivityList({ items }) {
  return items.length ? (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
          <span
            className={`mt-0.5 grid size-8 place-items-center rounded-lg ${item.type === "Job posted" ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-600"}`}
          >
            {item.type === "Job posted" ? <BriefcaseBusiness size={15} /> : <CalendarDays size={15} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-700">{item.title}</p>
            <p className="mt-1 text-xs text-slate-400">
              {item.type} {RANGE_SEPARATOR} {item.detail}
            </p>
          </div>
          <span className="whitespace-nowrap text-[11px] text-slate-400">{formatDateTime(item.createdAt)}</span>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState title="No recent activity" description="No jobs or bookings have been recorded yet." />
  );
}
function RecentJobs({ jobs }) {
  return (
    <Panel
      title="Recent jobs"
      action={
        <Link href="/admin/jobs" className="text-sm font-semibold text-[#008f79] hover:text-[#00715f]">
          View all ↗
        </Link>
      }
    >
      {jobs.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Job</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="text-sm">
                  <td className="py-3 pr-3">
                    <a href={`/admin/jobs/${job.id}`} className="font-semibold text-slate-700 hover:text-blue-600">
                      {job.title || "Untitled job"}
                    </a>
                    <p className="mt-1 text-xs text-slate-400">{job.category || "No category"}</p>
                  </td>
                  <td className="py-3 pr-3 text-slate-500">{job.clientName || EMPTY_VALUE}</td>
                  <td className="py-3 pr-3">
                    <StatusBadge value={job.status} />
                  </td>
                  <td className="py-3 text-right text-xs text-slate-400">{formatDate(job.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No jobs found" description="The jobs collection has no records." />
      )}
    </Panel>
  );
}
function RecentBookings({ bookings }) {
  return (
    <Panel
      title="Recent bookings"
      action={
        <Link href="/admin/bookings" className="text-sm font-semibold text-[#008f79] hover:text-[#00715f]">
          View all ↗
        </Link>
      }
    >
      {bookings.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Booking</th>
                <th className="pb-3 font-semibold">Worker</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="text-sm">
                  <td className="py-3 pr-3">
                    <a
                      href={`/admin/bookings/${booking.id}`}
                      className="font-semibold text-slate-700 hover:text-blue-600"
                    >
                      {booking.jobTitle || "Booking"}
                    </a>
                  </td>
                  <td className="py-3 pr-3 text-slate-500">{booking.workerName || EMPTY_VALUE}</td>
                  <td className="py-3 pr-3">
                    <StatusBadge value={booking.paymentStatus || "Unknown"} />
                  </td>
                  <td className="py-3 pr-3">
                    <StatusBadge value={booking.status} />
                  </td>
                  <td className="py-3 text-right text-xs text-slate-400">
                    {formatDate(booking.scheduledDate || booking.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No bookings found" description="The bookings collection has no records." />
      )}
    </Panel>
  );
}
function Sidebar({ open, close, activePage }) {
  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-30 bg-slate-950/30 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[288px] flex-col border-r border-white/10 bg-[#142B4A] transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            {/* <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 p-1.5">
              <img src="/logo_without_brandname.png" alt="Sathi" className="size-full object-contain" />
            </div>
            <div>
              <p className="font-semibold tracking-tight text-white">Sathi</p>
              <p className="text-[11px] text-slate-300">Admin portal</p>
            </div> */}
             <Image
                  src="/logo_without_bg.png"
                  alt="Sathi Logo"
                  width={120}
                  height={120}
                  priority
                  className="h-24 w-24 object-contain"
                />
          </div>
          <button
            onClick={close}
            className="grid size-8 place-items-center rounded-lg text-slate-300 hover:bg-white/10 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {/* <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">Navigation</p> */}
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.label} item={item} close={close} activePage={activePage} />
            ))}
          </nav>
        </div>
        {/* <div className="shrink-0 border-t border-white/10 p-3">
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div> */}
      </aside>
    </>
  );
}

function NavItem({ item, close, activePage }) {
  const Icon = item.icon;
  if (item.href)
    return (
      <a
        href={item.href}
        onClick={close}
        className={`flex min-w-0 items-center gap-3 whitespace-nowrap rounded-lg border-l-2 px-3 py-2.5 text-sm transition ${activePage === item.label ? "border-[#16c7a1] bg-white/10 font-semibold text-white" : "border-transparent font-medium text-slate-300 hover:bg-white/5 hover:text-white"}`}
      >
        <Icon className="shrink-0" size={17} strokeWidth={activePage === item.label ? 2 : 1.8} />
        <span className="min-w-0 flex-1">{item.label}</span>
      </a>
    );
  return (
    <button
      type="button"
      title={`${item.label} coming soon`}
      className="group flex w-full min-w-0 items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
    >
      <Icon className="shrink-0" size={17} strokeWidth={1.8} />
      <span className="min-w-0 flex-1">{item.label}</span>
      <span className="shrink-0 whitespace-nowrap rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-300">
        Soon
      </span>
    </button>
  );
}

function Topbar({ displayName, initials, openMenu, title }) {
  return (
    <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-[0_1px_0_rgba(226,232,240,0.8)] backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={openMenu}
          className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Sathi Admin</p>
          <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
        </div>
      </div>
      <div className="hidden max-w-md flex-1 px-8 md:block">
        <label className="relative block">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            aria-label="Search"
            placeholder="Search across the portal"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </label>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* <button
          type="button"
          title="Notifications coming soon"
          className="relative grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-50"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-blue-600" />
        </button> */}
        <div className="hidden h-7 w-px bg-slate-200 sm:block" />
        <ProfileMenu displayName={displayName} initials={initials} />
      </div>
    </header>
  );
}

function ProfileMenu({ displayName, initials }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
          {initials}
        </span>
        <span className="hidden min-w-0 xl:block">
          <span className="block max-w-32 truncate text-xs font-semibold text-slate-700">{displayName}</span>
          <span className="block text-[11px] text-slate-400">Administrator</span>
        </span>
        <ChevronDown
          size={15}
          className={`hidden text-slate-400 transition-transform sm:block ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_30px_rgba(20,43,74,0.12)]"
          role="menu"
        >
          <Link
            href="/admin/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            role="menuitem"
          >
            <User size={16} />
            <span>Profile</span>
          </Link>

          <div className="my-1 border-t border-slate-100" />

          <LogoutButton showLabel />
        </div>
      )}
    </div>
  );
}

function ComingSoonLabel() {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
      Coming soon
    </span>
  );
}
