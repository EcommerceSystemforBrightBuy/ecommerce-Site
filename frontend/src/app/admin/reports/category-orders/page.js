"use client";

import React from "react";
import Link from "next/link";
import { CATEGORY_ORDERS_REPORT } from "@/data/mockAdminData";
import { ArrowLeft, PieChart, Printer } from "lucide-react";

export default function CategoryOrdersReportPage() {
  const totalOrdersSum = CATEGORY_ORDERS_REPORT.reduce((acc, c) => acc + c.totalOrders, 0);

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
            Management Report #3
          </span>
          <h1 className="text-2xl font-black text-[#222222] mt-0.5">
            Category-Wise Order Volume Report
          </h1>
          <p className="text-xs text-[#717171] mt-0.5">
            Distribution of customer orders across electronic and toy categories.
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

      {/* Category Progress Bars */}
      <div className="border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-[#222222]">
          Category Order Distribution ({totalOrdersSum.toLocaleString()} total orders)
        </h2>

        <div className="space-y-4 pt-2">
          {CATEGORY_ORDERS_REPORT.map((cat) => (
            <div key={cat.category} className="space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-[#222222]">
                <span>{cat.category}</span>
                <span>
                  {cat.totalOrders.toLocaleString()} orders ({cat.percentage}%)
                </span>
              </div>
              <div className="h-4 w-full bg-[#F7F7F7] rounded-full overflow-hidden border border-[#EBEBEB]">
                <div
                  className="h-full bg-[#FF385C] rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Itemized Table */}
      <div className="border border-[#DDDDDD] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Product Category</th>
                <th className="py-4 px-4">Total Order Count</th>
                <th className="py-4 px-4">Share of Platform Orders (%)</th>
                <th className="py-4 px-6 text-right">Category Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {CATEGORY_ORDERS_REPORT.map((c) => (
                <tr key={c.category} className="hover:bg-[#F7F7F7] transition-colors font-semibold">
                  <td className="py-4 px-6 text-[#222222] font-bold text-sm">{c.category}</td>
                  <td className="py-4 px-4 text-[#717171] font-bold">{c.totalOrders} orders</td>
                  <td className="py-4 px-4 text-[#FF385C] font-bold">{c.percentage}%</td>
                  <td className="py-4 px-6 text-right font-mono font-black text-sm text-[#222222]">
                    ${c.revenue.toLocaleString("en-US")}
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
