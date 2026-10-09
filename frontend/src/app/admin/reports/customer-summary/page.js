"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Printer, CreditCard, Banknote } from "lucide-react";

export default function CustomerSummaryReportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/reports/customer-summary`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setCustomers(data); setError(""); })
      .catch(() => setError("Could not load report data"))
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.customer_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#717171] hover:text-[#222222]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Reports Directory</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-5">
        <div>
          <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
            Management Report #5
          </span>
          <h1 className="text-2xl font-black text-[#222222] mt-0.5">
            Customer Order Summary &amp; Payment Status
          </h1>
          <p className="text-xs text-[#717171] mt-0.5">
            Customer lifetime order totals and card vs COD payment status.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="p-2.5 rounded-full border border-[#DDDDDD] bg-white text-[#222222] hover:bg-[#F7F7F7] self-start sm:self-auto"
          title="Print Report"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="border border-[#DDDDDD] rounded-2xl p-4 bg-white flex items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#717171] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F7F7] border border-[#DDDDDD] rounded-full text-xs text-[#222222] focus:outline-none"
          />
        </div>
        <div className="text-xs font-bold text-[#717171]">
          Registered Customers: {customers.length}
        </div>
      </div>

      {loading && <p className="text-xs text-[#717171]">Loading...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Table */}
      <div className="border border-[#DDDDDD] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Customer Profile</th>
                <th className="py-4 px-4">Lifetime Orders</th>
                <th className="py-4 px-4">Total Spent ($)</th>
                <th className="py-4 px-4">Payment Methods</th>
                <th className="py-4 px-6 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {filteredCustomers.map((c) => (
                <tr key={c.customer_id} className="hover:bg-[#F7F7F7] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-[#222222] text-sm">{c.customer_name}</div>
                    <div className="text-xs text-[#717171] font-mono">{c.email}</div>
                  </td>

                  <td className="py-4 px-4 font-bold text-[#222222] text-sm">
                    {c.total_orders} {c.total_orders === 1 ? "order" : "orders"}
                  </td>

                  <td className="py-4 px-4 font-mono font-black text-sm text-[#222222]">
                    ${c.lifetime_spend.toFixed(2)}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-[#F7F7F7] border border-[#DDDDDD] text-[10px] font-bold inline-flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> Card: {c.card_orders}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#F7F7F7] border border-[#DDDDDD] text-[10px] font-bold inline-flex items-center gap-1">
                        <Banknote className="w-3 h-3" /> COD: {c.cod_orders}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        {c.paid_orders} paid
                      </span>
                      {c.pending_payments > 0 && (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                          {c.pending_payments} pending
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
