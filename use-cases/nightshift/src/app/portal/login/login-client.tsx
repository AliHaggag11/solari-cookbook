"use client";

import { useSearchParams } from "next/navigation";

export default function PortalLoginPage() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="min-h-screen bg-[#e8e4dc] text-[#1a1a18]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <div className="border border-[#c9c3b8] bg-[#f5f2eb] p-8 shadow-none">
          <p className="text-xs uppercase tracking-[0.2em] text-[#6b655c]">
            VendorNet Enterprise Portal
          </p>
          <h1 className="mt-2 font-serif text-2xl">Accounts Payable</h1>
          <p className="mt-2 text-sm text-[#5c574f]">
            Session expires after 15 minutes of inactivity.
          </p>

          <form action="/api/portal/login" method="POST" className="mt-8 space-y-4">
            <label className="block text-sm">
              Username
              <input
                name="username"
                defaultValue="nightshift"
                className="mt-1 w-full border border-[#b8b2a8] bg-white px-3 py-2 text-sm"
                autoComplete="username"
              />
            </label>
            <label className="block text-sm">
              Password
              <input
                name="password"
                type="password"
                defaultValue="close2026"
                className="mt-1 w-full border border-[#b8b2a8] bg-white px-3 py-2 text-sm"
                autoComplete="current-password"
              />
            </label>
            {error && (
              <p className="text-sm text-[#9b2226]">
                Invalid credentials. Contact AP admin.
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-[#1a1a18] px-4 py-2 text-sm text-[#f5f2eb] transition hover:bg-[#333]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-xs text-[#8a847a]">
            Demo portal for Nightshift — no real vendor data.
          </p>
        </div>
      </div>
    </div>
  );
}
