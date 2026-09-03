"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QUARTERLY_SALES_DATA } from "@/data/mockAdminData";
import { ArrowLeft, TrendingUp, Calendar, Printer } from "lucide-react";

export default function QuarterlySalesReportPage() {
  const [selectedYear, setSelectedYear] = useState("2026");

  const quarterlyData = QUARTERLY_SALES_DATA[selectedYear] || QUARTERLY_SALES_DATA["2026"];
  const totalYearRevenue = quarterlyData.reduce((acc, q) => acc + q.revenue, 0);
  const totalYearOrders = quarterlyData.reduce((acc, q) => acc + q.orders, 0);
  const avgOrderValue = totalYearRevenue / (totalYearOrders || 1);

  const maxRevenue = Math.max(...quarterlyData.map((q) => q.revenue));

  return (
    <div className="space-y-6">
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#717171] hover:text-[#222222]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Reports Directory</span>
      </Link>

      {/* Header & Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-5">
        <div>
          <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
            Management Report #1
          </span>
          <h1 className="text-2xl font-black text-[#222222] mt-0.5">
            Quarterly Sales Report
          </h1>
          <p className="text-xs text-[#717171] mt-0.5">
            Financial performance and order volume breakdown for Texas operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#DDDDDD] rounded-full px-4 py-2 text-xs">
            <Calendar className="w-4 h-4 text-[#FF385C]" />
            <span className="font-bold text-[#222222]">Select Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent font-black text-[#222222] focus:outline-none cursor-pointer"
            >
              <option value="2026">2026 (Current)</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-full border border-[#DDDDDD] bg-white text-[#222222] hover:bg-[#F7F7F7]"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Year Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="border border-[#DDDDDD] rounded-3xl p-5 bg-white space-y-1 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#717171]">
            Total Gross Revenue ({selectedYear})
          </div>
          <div className="text-2xl font-black text-[#222222]">
            ${totalYearRevenue.toLocaleString("en-US")}
          </div>
        </div>

        <div className="border border-[#DDDDDD] rounded-3xl p-5 bg-white space-y-1 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#717171]">
            Total Completed Orders
          </div>
          <div className="text-2xl font-black text-[#222222]">
            {totalYearOrders.toLocaleString("en-US")} orders
          </div>
        </div>

        <div className="border border-[#DDDDDD] rounded-3xl p-5 bg-white space-y-1 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#717171]">
            Average Order Value (AOV)
          </div>
          <div className="text-2xl font-black text-[#222222]">
            ${avgOrderValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Visual Quarterly Bar Chart Representation */}
      <div className="border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-[#222222]">
          Quarterly Revenue Breakdown ({selectedYear})
        </h2>

        <div className="space-y-4 pt-2">
          {quarterlyData.map((q) => {
            const percentage = Math.round((q.revenue / maxRevenue) * 100);
            return (
              <div key={q.quarter} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-[#222222]">
                  <span>{q.quarter}</span>
                  <span>${q.revenue.toLocaleString("en-US")}</span>
                </div>
                <div className="h-4 w-full bg-[#F7F7F7] rounded-full overflow-hidden border border-[#EBEBEB]">
                  <div
                    className="h-full bg-[#FF385C] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#717171]">
                  <span>{q.orders} orders processed</span>
                  <span>AOV: ${q.avgOrderValue.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itemized Table */}
      <div className="border border-[#DDDDDD] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Quarter</th>
                <th className="py-4 px-4">Total Orders</th>
                <th className="py-4 px-4">Average Order Value</th>
                <th className="py-4 px-6 text-right">Quarterly Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {quarterlyData.map((q) => (
                <tr key={q.quarter} className="hover:bg-[#F7F7F7] transition-colors font-semibold">
                  <td className="py-4 px-6 text-[#222222] font-bold text-sm">{q.quarter}</td>
                  <td className="py-4 px-4 text-[#717171]">{q.orders}</td>
                  <td className="py-4 px-4 text-[#717171] font-mono">${q.avgOrderValue.toFixed(2)}</td>
                  <td className="py-4 px-6 text-right font-mono font-black text-sm text-[#222222]">
                    ${q.revenue.toLocaleString("en-US")}
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
