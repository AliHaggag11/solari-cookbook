"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PORTAL_INVOICES } from "@/lib/portal/data";

export default function PortalDashboardPage() {
  const [received, setReceived] = useState<Record<string, string>>({});

  const pending = useMemo(
    () => PORTAL_INVOICES.filter((i) => !received[i.id]),
    [received],
  );

  return (
    <div className="min-h-screen bg-[#e8e4dc] text-[#1a1a18]">
      <header className="border-b border-[#c9c3b8] bg-[#f5f2eb] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6b655c]">
              VendorNet
            </p>
            <h1 className="font-serif text-xl">Invoice receipt queue</h1>
          </div>
          <Link href="/portal/login" className="text-sm text-[#5c574f] underline">
            Sign out
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 border border-[#c9c3b8] bg-[#f5f2eb] p-4 text-sm">
          <strong>{pending.length}</strong> invoices awaiting receipt confirmation.
          Nested tables below — no API export available.
        </div>

        <div className="overflow-x-auto border border-[#c9c3b8] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#ebe6dc] text-xs uppercase tracking-wide">
              <tr>
                <th className="p-3">Vendor</th>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">PDF</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {PORTAL_INVOICES.map((inv) => (
                <tr
                  key={inv.id}
                  data-invoice-id={inv.id}
                  className="border-t border-[#e0dbd2]"
                >
                  <td className="p-3">{inv.vendor}</td>
                  <td className="p-3">{inv.invoiceNumber}</td>
                  <td className="p-3">{inv.date}</td>
                  <td className="p-3">${inv.amount.toFixed(2)}</td>
                  <td className="p-3">
                    <a
                      href={`/portal/invoices/${inv.id}/pdf`}
                      className="text-[#1a1a18] underline"
                      download
                    >
                      Download
                    </a>
                  </td>
                  <td className="p-3">
                    {received[inv.id] ? (
                      <span data-confirmation={received[inv.id]}>
                        {received[inv.id]}
                      </span>
                    ) : (
                      <button
                        type="button"
                        data-action="receive"
                        className="border border-[#1a1a18] px-2 py-1 text-xs hover:bg-[#1a1a18] hover:text-white"
                        onClick={() =>
                          setReceived((r) => ({
                            ...r,
                            [inv.id]: `CONF-${inv.invoiceNumber}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
                          }))
                        }
                      >
                        Mark received
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Nested summary table — intentionally hostile layout */}
          <div className="border-t border-[#c9c3b8] p-4">
            <p className="mb-2 text-xs uppercase text-[#6b655c]">
              Line-item detail (expand per vendor)
            </p>
            <table className="w-full text-xs">
              <tbody>
                {PORTAL_INVOICES.slice(0, 4).map((inv) => (
                  <tr key={`detail-${inv.id}`} className="border-t border-[#eee]">
                    <td className="p-2 font-medium">{inv.vendor}</td>
                    <td className="p-2">
                      {inv.lineItems.map((l) => l.description).join("; ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
