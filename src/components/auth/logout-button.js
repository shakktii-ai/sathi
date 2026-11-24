"use client";

import { LogOut, LoaderCircle } from "lucide-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { firebaseAuth } from "@/lib/firebase/client";

export default function LogoutButton({ showLabel = false }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      await signOut(firebaseAuth).catch(() => {});
      router.replace("/login");
      router.refresh();
    }
  }
  return (
    <button
      onClick={logout}
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-lg border border-[#dbe3ec] bg-white px-3 py-2 text-sm font-semibold text-[#40506a] hover:border-[#b9c8d8] disabled:opacity-60 ${showLabel ? "w-full justify-start border-0 px-3 hover:bg-slate-50" : ""}`}
    >
      {pending ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />} {showLabel && "Sign out"}
    </button>
  );
}
