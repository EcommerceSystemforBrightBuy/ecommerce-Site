"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  PieChart,
  Truck,
  UserCheck,
  ArrowRight,
  BarChart3,
} from "lucide-react";

export default function ReportsHubPage() {
  const reports = [
    {
      id: "1",
      title: "1. Quarterly Sales Report",
      route: "/admin/reports/quarterly-sales",
      desc: "Quarterly sales and revenue breakdown for any given year (2026, 2025, 2024) with average order values.",
      icon: TrendingUp,
      badge: "Required Report #1",
    },
    {
      id: "2",
      title: "2. Top-Selling Products",
      route: "/admin/reports/top-selling",
      desc: "Rankings of top performing products by units sold and gross revenue for a selected period.",
      icon: Award,
      badge: "Required Report #2",
    },
    {
      id: "3",
      title: "3. Category-Wise Order Totals",
      route: "/admin/reports/category-orders",
      desc: "Total number of customer orders per product category.",
      icon: PieChart,
      badge: "Required Report #3",
    },
    {
      id: "4",
      title: "4. Delivery Time Estimates",
      route: "/admin/reports/delivery-estimates",
      desc: "Upcoming order delivery schedule based on stock availability and Texas city destination (5d/7d/+3d).",
      icon: Truck,
      badge: "Required Report #4",
    },
    {
      id: "5",
      title: "5. Customer Summary & Payment Status",
      route: "/admin/reports/customer-summary",
      desc: "Customer-wise lifetime order history and payment status (Card vs COD).",
      icon: UserCheck,
      badge: "Required Report #5",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#EBEBEB] pb-5">
        <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
          Management Analytics &amp; Auditing
        </span>
        <h1 className="text-2xl font-black text-[#222222] mt-0.5">
          System Reports Directory
        </h1>
        <p className="text-xs text-[#717171] mt-0.5">
          BrightBuy Texas management reports required for executive decision making and stock planning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((rep) => {
          const Icon = rep.icon;
          return (
            <Link
              key={rep.id}
              href={rep.route}
              className="border border-[#DDDDDD] rounded-3xl p-6 bg-white hover:border-[#222222] transition-all group flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-rose-50 text-[#FF385C]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] text-[10px] font-bold">
                    {rep.badge}
                  </span>
                </div>

                <h2 className="font-black text-lg text-[#222222] group-hover:text-[#FF385C] transition-colors">
                  {rep.title}
                </h2>

                <p className="text-xs text-[#717171] leading-relaxed">
                  {rep.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EBEBEB] flex items-center justify-between text-xs font-bold text-[#222222]">
                <span>Generate &amp; View Report</span>
                <ArrowRight className="w-4 h-4 text-[#FF385C] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
