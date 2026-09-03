"use client";

import React from "react";
import Link from "next/link";
import {
  UPCOMING_DELIVERY_ESTIMATES,
  QUARTERLY_SALES_DATA,
  TOP_SELLING_PRODUCTS,
} from "@/data/mockAdminData";
import { PRODUCTS } from "@/data/mockData";
import {
  TrendingUp,
  ShoppingBag,
  Warehouse,
  Users,
  BarChart3,
  ArrowRight,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const currentSales = QUARTERLY_SALES_DATA["2026"];
  const total2026Revenue = currentSales.reduce((acc, q) => acc + q.revenue, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-6">
        <div>
          <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
            BrightBuy Texas Executive Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222] mt-0.5">
            Database &amp; Logistics Overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="bg-[#222222] hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors"
          >
            + Add New Product
          </Link>
          <Link
            href="/admin/staff/new"
            className="bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors shadow-sm"
          >
            + Onboard Staff
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Sales */}
        <div className="bg-white border border-[#DDDDDD] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#717171]">
            <span className="text-xs font-bold uppercase tracking-wider">2026 YTD Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#222222]">
            ${total2026Revenue.toLocaleString("en-US")}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            +24.8% growth vs 2025
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="bg-white border border-[#DDDDDD] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#717171]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Texas Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#222222]">6,160</div>
          <div className="text-[11px] text-[#717171]">Across 12 Texas Municipalities</div>
        </div>

        {/* Metric 3: Warehouse SKUs */}
        <div className="bg-white border border-[#DDDDDD] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#717171]">
            <span className="text-xs font-bold uppercase tracking-wider">Central WH SKUs</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#222222]">14 Active SKUs</div>
          <div className="text-[11px] text-amber-700 font-bold">2 SKUs on Backorder (+3d buffer)</div>
        </div>

        {/* Metric 4: Staff */}
        <div className="bg-white border border-[#DDDDDD] rounded-3xl p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#717171]">
            <span className="text-xs font-bold uppercase tracking-wider">Active Staff</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#222222]">5 Personnel</div>
          <div className="text-[11px] text-[#717171]">Assigned to 5 Texas Store Hubs</div>
        </div>
      </div>

      {/* Reports Quick Access Ribbon */}
      <div className="border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF385C]" />
            <h2 className="text-base font-bold text-[#222222]">
              Management System Reports (5 Required Reports)
            </h2>
          </div>
          <Link
            href="/admin/reports"
            className="text-xs font-bold text-[#FF385C] hover:underline flex items-center gap-1"
          >
            <span>View Reports Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Link
            href="/admin/reports/quarterly-sales"
            className="p-3.5 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] hover:border-[#222222] transition-colors space-y-1 block"
          >
            <div className="text-[10px] font-bold text-[#FF385C] uppercase">Report 1</div>
            <div className="text-xs font-bold text-[#222222]">Quarterly Sales</div>
          </Link>

          <Link
            href="/admin/reports/top-selling"
            className="p-3.5 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] hover:border-[#222222] transition-colors space-y-1 block"
          >
            <div className="text-[10px] font-bold text-[#FF385C] uppercase">Report 2</div>
            <div className="text-xs font-bold text-[#222222]">Top-Selling Products</div>
          </Link>

          <Link
            href="/admin/reports/category-orders"
            className="p-3.5 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] hover:border-[#222222] transition-colors space-y-1 block"
          >
            <div className="text-[10px] font-bold text-[#FF385C] uppercase">Report 3</div>
            <div className="text-xs font-bold text-[#222222]">Category Orders</div>
          </Link>

          <Link
            href="/admin/reports/delivery-estimates"
            className="p-3.5 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] hover:border-[#222222] transition-colors space-y-1 block"
          >
            <div className="text-[10px] font-bold text-[#FF385C] uppercase">Report 4</div>
            <div className="text-xs font-bold text-[#222222]">Delivery Estimates</div>
          </Link>

          <Link
            href="/admin/reports/customer-summary"
            className="p-3.5 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] hover:border-[#222222] transition-colors space-y-1 block"
          >
            <div className="text-[10px] font-bold text-[#FF385C] uppercase">Report 5</div>
            <div className="text-xs font-bold text-[#222222]">Customer Summary</div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Recent Orders & Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Recent Texas Orders */}
        <div className="lg:col-span-8 border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
            <h2 className="text-sm font-bold text-[#222222]">
              Recent Texas Orders Processing
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#717171] hover:text-[#222222]"
            >
              View All Orders &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#EBEBEB] overflow-x-auto">
            {UPCOMING_DELIVERY_ESTIMATES.map((order) => (
              <div key={order.orderId} className="py-3 flex items-center justify-between text-xs min-w-[500px]">
                <div>
                  <div className="font-bold text-[#222222]">{order.orderId}</div>
                  <div className="text-[11px] text-[#717171]">
                    {order.customerName} • Destination: {order.city}, TX ({order.fulfillmentMode})
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {order.estArrivalDate}
                  </span>
                  <div className="text-[10px] text-[#717171] mt-0.5">
                    {order.totalEstDays} Days total transit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: Warehouse Stock Alert */}
        <div className="lg:col-span-4 border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
            <h2 className="text-sm font-bold text-[#222222] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock SKUs</span>
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-[#717171] hover:text-[#222222]"
            >
              Inventory &rarr;
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="font-bold text-amber-900">WH-APX-16-BLU-1TB</div>
              <div className="text-[11px] text-amber-800">
                ApexPro 16 (Deep Marine 1TB) • <strong>0 units left</strong> (+3d buffer active)
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="font-bold text-amber-900">WH-TOY-RBO-PRO-KIT</div>
              <div className="text-[11px] text-amber-800">
                RoboMaster Pro Kit • <strong>0 units left</strong> (+3d buffer active)
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] space-y-1">
              <div className="font-bold text-[#222222]">WH-DRN-FLC-COMB</div>
              <div className="text-[11px] text-[#717171]">
                HoverGlide Fly More Combo • <strong>3 units left</strong> (Low threshold)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
