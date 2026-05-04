"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAllUsers, useLogin } from "@/hooks";

export default function LoginPage() {
  const { data: users, isLoading } = useAllUsers();
  const login = useLogin();
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!selected) return;
    try {
      const res = await login.mutateAsync(selected);
      const user = users?.find((u: any) => u.id === selected);
      router.push(`/${user?.projectSlug}/chat`);
    } catch { setError("Login failed. Please try again."); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Debales AI</h1>
          <p className="text-gray-500 text-sm mt-1">Multi-tenant AI Sales Assistant · Demo Login</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {users?.map((u: any) => (
              <label key={u.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected === u.id ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"}`}>
                <input type="radio" name="user" value={u.id} checked={selected === u.id} onChange={() => setSelected(u.id)} className="sr-only" />
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">{u.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  <p className="text-xs text-gray-400">{u.project} · <span className={u.role === "admin" ? "text-indigo-600 font-medium" : ""}>{u.role}</span></p>
                </div>
              </label>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={!selected || login.isPending}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {login.isPending ? "Logging in..." : "Log in as selected user"}
        </button>
      </div>
    </div>
  );
}
