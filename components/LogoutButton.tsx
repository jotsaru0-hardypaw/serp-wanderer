"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={logout} disabled={loading} className="text-sm text-muted hover:text-fall disabled:opacity-50">
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
