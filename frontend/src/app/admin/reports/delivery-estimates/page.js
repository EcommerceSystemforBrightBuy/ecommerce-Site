"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, AlertTriangle } from "lucide-react";

export default function DeliveryEstimatesReportPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/reports/delivery-estimates`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setRows(data); setError(""); })
      .catch(() => setError("Could not load report data"))
      .finally(() => setLoading(false));
  }, []);

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
            Management Report #4
          </span>
          <h1 className="text-2xl font-black text-[#222222] mt-0.5">
            Delivery Time Estimates Report
          </h1>
          <p className="text-xs text-[#717171] mt-0.5">
            Upcoming order delivery estimates based on stock and Texas destination.
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

      {/* Rules Notice */}
      <div className="border border-[#DDDDDD] rounded-2xl p-4 bg-white text-xs space-y-2">
        <div className="font-bold text-[#222222]">BrightBuy Texas Logistics Formula:</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[#717171]">
          <div className="p-2.5 rounded-xl bg-[#F7F7F7]">
            <strong className="text-[#222222]">Main Cities (5 Days)</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F7F7F7]">
            <strong className="text-[#222222]">Other Cities (7 Days)</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
            <strong className="text-amber-950">Out of Stock Buffer:</strong> +3 days if backordered at order time
          </div>
        </div>
      </div>

      {loading && <p className="text-xs text-[#717171]">Loading...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {!loading && !error && rows.length === 0 && (
        <p className="text-xs text-[#717171]">No upcoming deliveries.</p>
      )}

      {/* Estimates Table */}
      <div className="border border-[#DDDDDD] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Order ID &amp; Customer</th>
                <th className="py-4 px-4">Texas Destination</th>
                <th className="py-4 px-4">Fulfillment Mode</th>
                <th className="py-4 px-4">Delivery Status</th>
                <th className="py-4 px-4">Days Remaining</th>
                <th className="py-4 px-6 text-right">Estimated Arrival Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {rows.map((o) => (
                <tr key={o.order_id} className="hover:bg-[#F7F7F7] transition-colors">
                  <td className="py-4 px-6 font-mono">
                    <div className="font-bold text-[#222222] text-sm">{o.order_id}</div>
                    <div className="text-xs text-[#717171]">{o.customer_name}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-[#222222]">
                      {o.city_name ? `${o.city_name}, TX` : "-"}
                    </div>
                    <div className="text-[10px] text-[#717171]">
                      {o.city_name
                        ? o.is_main_city
                          ? "Main Metro (5d base)"
                          : "Regional Texas (7d base)"
                        : "No address on file"}
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-[#222222]">{o.delivery_mode}</td>

                  <td className="py-4 px-4 capitalize font-semibold text-[#222222]">
                    {o.delivery_status}
                  </td>

                  <td className="py-4 px-4">
                    {o.days_remaining < 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Overdue by {Math.abs(o.days_remaining)}d
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        {o.days_remaining} days
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right font-bold text-[#FF385C] text-sm">
                    {o.estimated_delivery_date}
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
