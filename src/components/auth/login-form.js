"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/firebase/client";
import Image from "next/image";

const messages = { session_expired: "Your session expired. Please sign in again." };

export default function LoginForm({ initialReason }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialReason ? messages[initialReason] : "");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      const idToken = await credential.user.getIdToken(true);
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const result = await response.json();
      if (!response.ok) {
        await signOut(firebaseAuth);
        throw new Error(result.error || "This account cannot access Sathi Admin.");
      }
      router.replace("/admin");
      router.refresh();
    } catch (authError) {
      const code = authError?.code || "";
      setError(
        code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")
          ? "The email or password is incorrect."
          : authError.message || "Unable to sign in. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-[#e1e7ef] bg-white p-7 shadow-[0_24px_70px_rgba(29,51,84,0.09)] sm:p-9">
    <div className="mb-8 text-center">
  <h2 className="text-2xl font-bold tracking-tight text-[#152238]">
    Welcome back
  </h2>
  <p className="mt-2 text-sm text-[#748096]">
    Sign in to access your Sathi admin dashboard.
  </p>
</div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#40506a]">Work email</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-xl border border-[#dbe3ec] bg-[#fbfcfe] px-4 text-sm outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
            placeholder="admin@sathi.example"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#40506a]">Password</span>
          <span className="relative block">
            <input
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#dbe3ec] bg-[#fbfcfe] px-4 pr-12 text-sm outline-none transition focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-3 grid size-6 place-items-center text-[#8290a3]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[#f4d5d2] bg-[#fff5f4] px-3 py-2.5 text-sm leading-5 text-[#a4473d]"
          >
            {error}
          </p>
        )}
        <button
          disabled={pending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] text-sm font-semibold text-white transition hover:bg-[#0b625c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <LoaderCircle size={17} className="animate-spin" /> Verifying access…
            </>
          ) : (
            <>
              <KeyRound size={17} /> Sign in securely
            </>
          )}
        </button>
      </form>
     
    </div>
  );
}
