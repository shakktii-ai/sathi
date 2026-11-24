
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  Clock3,
  LockKeyhole,
  Shield,
  ChevronRight,
} from "lucide-react";

import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/client";
import { formatDateTime } from "@/lib/firestore/serialization";

export default function ProfilePage({ session }) {
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, setFirebaseUser);
  }, []);

  const profile = useMemo(
    () => ({
      name:
        session.name ||
        firebaseUser?.displayName ||
        session.email?.split("@")[0] ||
        "Administrator",
      email: session.email || firebaseUser?.email || "Not available",
      phone: firebaseUser?.phoneNumber || "Not available",
      createdAt: firebaseUser?.metadata?.creationTime || null,
      lastLogin: firebaseUser?.metadata?.lastSignInTime || null,
      role:
        session.adminRole === "super_admin"
          ? "Super Administrator"
          : session.adminRole || "Administrator",
    }),
    [firebaseUser, session]
  );

  const initials = profile.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7 pb-8">

      {/* Page Header */}
      <div className="flex flex-col gap-2">
       

        <h1 className="text-[28px] font-bold tracking-tight text-[#142B4A] sm:text-3xl">
          My Profile
        </h1>

        <p className="text-sm text-slate-600">
          Manage your administrator account and security preferences.
        </p>
      </div>

     

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">

        {/* Personal Information */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <UserRound size={19} />
            </div>
            <div>
              <h3 className="font-bold text-[#172033]">
                Personal Information
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                Your administrator account details
              </p>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-7 p-6 sm:grid-cols-2">
            <Info
              icon={UserRound}
              label="Full Name"
              value={profile.name}
            />
            <Info
              icon={Mail}
              label="Email Address"
              value={profile.email}
            />
            <Info
              icon={Phone}
              label="Mobile Number"
              value={profile.phone}
            />
            <Info
              icon={ShieldCheck}
              label="Administrator Role"
              value={profile.role}
            />
          </div>
        </section>

        {/* Account Overview */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <div className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <ShieldCheck size={19} />
            </div>
            <div>
              <h3 className="font-bold text-[#172033]">
                Account Overview
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                Account and access information
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <AccountRow
              icon={CheckCircle2}
              label="Account Status"
              value="Active"
              success
            />
            <AccountRow
              icon={Shield}
              label="Access Level"
              value={profile.role}
            />
            <AccountRow
              icon={CalendarDays}
              label="Account Created"
              value={
                profile.createdAt
                  ? formatDateTime(profile.createdAt)
                  : "Not available"
              }
            />
            <AccountRow
              icon={Clock3}
              label="Last Login"
              value={
                profile.lastLogin
                  ? formatDateTime(profile.lastLogin)
                  : "Not available"
              }
            />
          </div>
        </section>
      </div>

      {/* Security */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <LockKeyhole size={19} />
            </div>
            <div>
              <h3 className="font-bold text-[#172033]">
                Account Security
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                Keep your administrator account secure.
              </p>
            </div>
          </div>

         
        </div>

        <div className="p-6">
          <PasswordSection user={firebaseUser} />
        </div>
      </section>

     
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-600">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-slate-600">
          {label}
        </dt>
        <dd className="mt-1 break-words text-sm font-semibold text-[#172033]">
          {value || "Not available"}
        </dd>
      </div>
    </div>
  );
}

function AccountRow({ icon: Icon, label, value, success }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-600">
          <Icon size={16} />
        </div>
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>
      </div>

      <span
        className={`text-right text-sm font-semibold ${
          success ? "text-emerald-700" : "text-[#172033]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PasswordSection({ user }) {
  const [values, setValues] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [visible, setVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  function update(name, value) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function toggle(name) {
    setVisible((current) => ({
      ...current,
      [name]: !current[name],
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setFeedback({ type: "", message: "" });

    if (!user?.email) {
      return setFeedback({
        type: "error",
        message:
          "Your Firebase email account is unavailable. Sign in again and retry.",
      });
    }

    if (values.next.length < 6) {
      return setFeedback({
        type: "error",
        message: "The new password must be at least 6 characters.",
      });
    }

    if (values.next !== values.confirm) {
      return setFeedback({
        type: "error",
        message: "The new passwords do not match.",
      });
    }

    if (values.current === values.next) {
      return setFeedback({
        type: "error",
        message: "Choose a different password from your current password.",
      });
    }

    setPending(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        values.current
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, values.next);

      setValues({
        current: "",
        next: "",
        confirm: "",
      });

      setFeedback({
        type: "success",
        message: "Your password was updated successfully.",
      });
    } catch (error) {
      const message =
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/wrong-password"
          ? "The current password is incorrect."
          : error?.code === "auth/requires-recent-login"
            ? "Please sign in again before changing your password."
            : "Unable to update the password. Please try again.";

      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <KeyRound size={18} className="mt-0.5 shrink-0 text-blue-700" />
        <div>
          <p className="text-sm font-semibold text-blue-950">
            Password verification required
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            For your security, verify your current password before creating
            a new one.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          <PasswordInput
            label="Current Password"
            value={values.current}
            visible={visible.current}
            onChange={(value) => update("current", value)}
            onToggle={() => toggle("current")}
            autoComplete="current-password"
          />

          <PasswordInput
            label="New Password"
            value={values.next}
            visible={visible.next}
            onChange={(value) => update("next", value)}
            onToggle={() => toggle("next")}
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirm New Password"
            value={values.confirm}
            visible={visible.confirm}
            onChange={(value) => update("confirm", value)}
            onToggle={() => toggle("confirm")}
            autoComplete="new-password"
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm" role="status" aria-live="polite">
            {feedback.message && (
              <span
                className={
                  feedback.type === "success"
                    ? "font-medium text-emerald-700"
                    : "font-medium text-rose-700"
                }
              >
                {feedback.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#142B4A] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4269] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <KeyRound size={16} />
            )}
            {pending ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  visible,
  onChange,
  onToggle,
  autoComplete,
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[#273449]">
        {label}
      </span>

      <span className="relative block">
        <input
          required
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}
