"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingBag,
  Users,
  BarChart3,
  TrendingUp,
  Award,
  PieChart,
  Truck,
  UserCheck,
  Search,
  Bell,
  ArrowUpRight,
  ChevronDown,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [reportsOpen, setReportsOpen] = useState(true);

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Products Catalog", href: "/admin/products", icon: Package },
    { label: "Central Inventory", href: "/admin/inventory", icon: Warehouse },
    { label: "Orders & Delivery", href: "/admin/orders", icon: ShoppingBag },
    { label: "Staff Management", href: "/admin/staff", icon: Users },
  ];

  const reportItems = [
    { label: "1. Quarterly Sales", href: "/admin/reports/quarterly-sales", icon: TrendingUp },
    { label: "2. Top-Selling Products", href: "/admin/reports/top-selling", icon: Award },
    { label: "3. Category Orders", href: "/admin/reports/category-orders", icon: PieChart },
    { label: "4. Delivery Estimates", href: "/admin/reports/delivery-estimates", icon: Truck },
    { label: "5. Customer Summary", href: "/admin/reports/customer-summary", icon: UserCheck },
  ];

  return (
    <div className="min-h-screen flex bg-[#F7F7F7] text-[#222222] font-sans">
      {/* Persistent Airbnb-Styled Dark Charcoal Admin Sidebar */}
      <aside className="w-64 bg-[#1E1E1E] text-white flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30 shadow-xl">
        <div>
          {/* Admin Header / Logo */}
          <div className="p-6 border-b border-[#333333] flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF385C] text-white font-black flex items-center justify-center text-sm shadow-md">
                BB
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                  brightbuy
                </span>
                <span className="text-[10px] font-mono text-[#FF385C] tracking-wider uppercase block font-bold mt-1">
                  Texas Admin Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            <div className="px-3 py-1.5 text-[10px] font-mono text-[#717171] uppercase tracking-wider font-bold">
              System Management
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#FF385C] text-white shadow-md font-bold"
                      : "text-[#B0B0B0] hover:bg-[#2C2C2C] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Management Reports Collapsible Submenu */}
            <div className="pt-4 space-y-1">
              <button
                type="button"
                onClick={() => setReportsOpen(!reportsOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-mono text-[#717171] uppercase tracking-wider font-bold hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[#FF385C]" />
                  <span>Management Reports (5)</span>
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${reportsOpen ? "rotate-180" : ""}`} />
              </button>

              {reportsOpen && (
                <div className="space-y-1 pl-2 border-l-2 border-[#333333] ml-3 mt-1">
                  {reportItems.map((rep) => {
                    const RepIcon = rep.icon;
                    const isRepActive = pathname === rep.href;
                    return (
                      <Link
                        key={rep.href}
                        href={rep.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                          isRepActive
                            ? "bg-white/10 text-[#FF385C] font-bold"
                            : "text-[#A0A0A0] hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <RepIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{rep.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Storefront Switcher */}
        <div className="p-4 border-t border-[#333333] space-y-2 bg-[#171717]">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF385C]" />
              Customer Storefront
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#717171]" />
          </Link>
        </div>
      </aside>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#EBEBEB] px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-[#717171] absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search orders, warehouse SKUs, staff, or reports..."
                className="w-full pl-10 pr-4 py-1.5 bg-[#F7F7F7] border border-[#DDDDDD] rounded-full text-xs text-[#222222] focus:outline-none focus:border-[#222222]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Central WH DB Synced</span>
            </div>

            {/* Admin User Badge */}
            <div className="flex items-center gap-2.5 border-l border-[#EBEBEB] pl-4">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                alt="Elena Rostova"
                className="w-8 h-8 rounded-full object-cover border border-[#DDDDDD]"
              />
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-bold text-[#222222]">Elena Rostova</div>
                <div className="text-[10px] text-[#717171]">Central WH Director</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Children */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
