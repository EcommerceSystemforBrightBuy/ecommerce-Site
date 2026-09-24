"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TOP_SELLING_PRODUCTS } from "@/data/mockAdminData";
import { ArrowLeft, Award, Calendar, Printer } from "lucide-react";

export default function TopSellingProductsReportPage() {
  const [period, setPeriod] = useState("ytd");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#717171] hover:text-[#222222]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Reports Directory</span>
      </Link>

      {/* Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-5">
        <div>
          <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
            Management Report #2
          </span>
          <h1 className="text-2xl font-black text-[#222222] mt-0.5">
            Top-Selling Products Report
          </h1>
          <p className="text-xs text-[#717171] mt-0.5">
            Product performance rankings by volume sold and revenue generated.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[#DDDDDD] rounded-full px-4 py-2 text-xs">
            <Calendar className="w-4 h-4 text-[#FF385C]" />
            <span className="font-bold text-[#222222]">Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent font-bold text-[#222222] focus:outline-none cursor-pointer"
            >
              <option value="month">This Month</option>
              <option value="quarter">Last Quarter (Q2 2026)</option>
              <option value="ytd">Year-to-Date (2026)</option>
              <option value="all">All Time</option>
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

      {/* Ranked Table */}
      <div className="border border-[#DDDDDD] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Product Title &amp; Brand</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Top-Selling Variant SKU</th>
                <th className="py-4 px-4">Units Sold</th>
                <th className="py-4 px-6 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {TOP_SELLING_PRODUCTS.map((p) => (
                <tr key={p.id} className="hover:bg-[#F7F7F7] transition-colors">
                  <td className="py-4 px-6 font-black text-sm text-[#222222]">
                    <div className="w-7 h-7 rounded-full bg-[#222222] text-white flex items-center justify-center font-bold text-xs">
                      #{p.rank}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-bold text-[#222222] text-sm">{p.name}</div>
                    <div className="text-[11px] text-[#717171]">Brand: {p.brand}</div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] text-[10px] font-bold">
                      {p.categories.join(", ")}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-[#222222]">
                    {p.topVariantSku}
                  </td>

                  <td className="py-4 px-4 font-bold text-emerald-700 text-sm">
                    {p.unitsSold} units
                  </td>

                  <td className="py-4 px-6 text-right font-mono font-black text-sm text-[#222222]">
                    ${p.revenue.toLocaleString("en-US")}
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
