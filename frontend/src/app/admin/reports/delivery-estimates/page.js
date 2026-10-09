"use client";

import React from "react";
import Link from "next/link";
import { UPCOMING_DELIVERY_ESTIMATES } from "@/data/mockAdminData";
import { ArrowLeft, Truck, Printer, Clock, AlertTriangle } from "lucide-react";

export default function DeliveryEstimatesReportPage() {
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
            Upcoming order delivery transit times calculated based on stock and Texas destination.
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
            <strong className="text-[#222222]">Main Cities (5 Days):</strong> Austin, Dallas, Houston, San Antonio, Fort Worth
          </div>
          <div className="p-2.5 rounded-xl bg-[#F7F7F7]">
            <strong className="text-[#222222]">Regional Texas (7 Days):</strong> El Paso, Lubbock, Corpus Christi, Amarillo, etc.
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
            <strong className="text-amber-950">Out of Stock Buffer:</strong> +3 Days added if item is backordered at order time
          </div>
        </div>
      </div>

      {/* Estimates Table */}
      <div className="border border-[#DDDDDD] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Order ID &amp; Customer</th>
                <th className="py-4 px-4">Texas Destination</th>
                <th className="py-4 px-4">Fulfillment Mode</th>
                <th className="py-4 px-4">WH Stock Status</th>
                <th className="py-4 px-4">Days Formula (Base + Buffer)</th>
                <th className="py-4 px-6 text-right">Estimated Arrival Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {UPCOMING_DELIVERY_ESTIMATES.map((o) => (
                <tr key={o.orderId} className="hover:bg-[#F7F7F7] transition-colors">
                  <td className="py-4 px-6 font-mono">
                    <div className="font-bold text-[#222222] text-sm">{o.orderId}</div>
                    <div className="text-xs text-[#717171]">{o.customerName}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-[#222222]">{o.city}, TX</div>
                    <div className="text-[10px] text-[#717171]">
                      {o.isMainCity ? "Main Metro (5d base)" : "Regional Texas (7d base)"}
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-[#222222]">
                    {o.fulfillmentMode}
                  </td>

                  <td className="py-4 px-4">
                    {o.bufferDays > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {o.stockStatus}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                        {o.stockStatus}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 font-mono">
                    <div className="font-bold text-[#222222]">
                      {o.baseDays} days base {o.bufferDays > 0 && `+ ${o.bufferDays}d buffer`}
                    </div>
                    <div className="text-[10px] text-[#717171]">{o.totalEstDays} days total</div>
                  </td>

                  <td className="py-4 px-6 text-right font-bold text-[#FF385C] text-sm">
                    {o.estArrivalDate}
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
