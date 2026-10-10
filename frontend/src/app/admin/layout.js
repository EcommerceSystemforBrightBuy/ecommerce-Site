"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ChevronDown,
  LogOut,
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

const ALL_NAV_ITEMS = [
  { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products Catalog", href: "/admin/products", icon: Package },
  { label: "Central Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "Orders & Delivery", href: "/admin/orders", icon: ShoppingBag },
  { label: "Staff Management", href: "/admin/staff", icon: Users },
];

const ALL_REPORT_ITEMS = [
  { label: "1. Quarterly Sales", href: "/admin/reports/quarterly-sales", icon: TrendingUp },
  { label: "2. Top-Selling Products", href: "/admin/reports/top-selling", icon: Award },
  { label: "3. Category Orders", href: "/admin/reports/category-orders", icon: PieChart },
  { label: "4. Delivery Estimates", href: "/admin/reports/delivery-estimates", icon: Truck },
  { label: "5. Customer Summary", href: "/admin/reports/customer-summary", icon: UserCheck },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [reportsOpen, setReportsOpen] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const [isCustomerAccount, setIsCustomerAccount] = useState(false);

  useEffect(() => {
    try {
      const storedAdmin = window.localStorage.getItem("brightbuy_admin_user");
      const storedCustomer = window.localStorage.getItem("brightbuy_user");

      // Check if user is actively logged in as a customer
      let customerLoggedIn = false;
      if (storedCustomer) {
        const parsedCust = JSON.parse(storedCustomer);
        if (parsedCust?.customerId || parsedCust?.email) {
          customerLoggedIn = true;
        }
      }

      if (customerLoggedIn) {
        setIsCustomerAccount(true);
        setAdminUser(null);
      } else if (storedAdmin) {
        const parsedAdmin = JSON.parse(storedAdmin);
        if (parsedAdmin.role === "customer") {
          setIsCustomerAccount(true);
          setAdminUser(null);
        } else {
          setIsCustomerAccount(false);
          setAdminUser(parsedAdmin);
        }
      } else {
        setIsCustomerAccount(false);
        setAdminUser(null);
      }
    } catch {
      setAdminUser(null);
    } finally {
      setCheckedAuth(true);
    }
  }, [pathname]);

  // Handle redirection inside useEffect to prevent setState/Router updates during render
  useEffect(() => {
    if (checkedAuth && pathname !== "/admin/login") {
      if (isCustomerAccount || !adminUser || adminUser.role === "customer") {
        router.replace("/admin/login");
      }
    }
  }, [checkedAuth, isCustomerAccount, adminUser, pathname, router]);

  // If on admin login page, bypass layout shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 1. While checking auth during hydration, render loading spinner (DO NOT render children!)
  if (!checkedAuth) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4 text-[#222222] font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#FF385C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#717171]">Verifying Staff Access Rights...</p>
        </div>
      </div>
    );
  }

  // 2. Security Guard: Block Customer accounts & unauthenticated users from viewing Admin Portal
  if (isCustomerAccount || !adminUser || adminUser.role === "customer") {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4 text-[#222222] font-sans">
        <div className="bg-white border border-red-200 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block">
              Security Access Denied
            </span>
            <h1 className="text-2xl font-black text-[#222222] mt-1">
              Staff Portal Restricted
            </h1>
            <p className="text-xs text-[#717171] mt-2 leading-relaxed">
              Customer accounts and unauthenticated users are strictly prohibited from accessing Texas Central Warehouse Operations &amp; Admin management tools.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/admin/login"
              className="w-full py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl transition-colors inline-block shadow-md"
            >
              Sign In with Staff Credentials
            </Link>
            <Link
              href="/"
              className="w-full py-3 bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#222222] font-bold text-xs rounded-xl transition-colors inline-block border border-[#DDDDDD]"
            >
              Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Allowed Tabs based on Staff Role & Job Title
  const getRoleTabAccess = (user) => {
    if (!user) return { navs: ALL_NAV_ITEMS, reports: ALL_REPORT_ITEMS };
    const role = (user.role || "").toLowerCase();
    const title = (user.jobTitle || "").toLowerCase();

    // 1. Super Admin / System Administrator
    if (
      role === "admin" ||
      title.includes("admin") ||
      title.includes("director") ||
      title.includes("system administrator")
    ) {
      return { navs: ALL_NAV_ITEMS, reports: ALL_REPORT_ITEMS };
    }

    // 2. Inventory Manager / Specialist
    if (role === "inventory_manager" || title.includes("inventory")) {
      const allowedNavs = ALL_NAV_ITEMS.filter((item) =>
        ["/admin", "/admin/products", "/admin/inventory"].includes(item.href)
      );
      const allowedReports = ALL_REPORT_ITEMS.filter((item) =>
        ["/admin/reports/category-orders", "/admin/reports/delivery-estimates"].includes(item.href)
      );
      return { navs: allowedNavs, reports: allowedReports };
    }

    // 3. Courier / Logistics Specialist
    if (
      role === "courier_staff" ||
      title.includes("logistics") ||
      title.includes("courier") ||
      title.includes("dispatch")
    ) {
      const allowedNavs = ALL_NAV_ITEMS.filter((item) =>
        ["/admin", "/admin/orders"].includes(item.href)
      );
      const allowedReports = ALL_REPORT_ITEMS.filter((item) =>
        ["/admin/reports/delivery-estimates"].includes(item.href)
      );
      return { navs: allowedNavs, reports: allowedReports };
    }

    // 4. Sales Analyst / Report Analyst
    if (role === "sales_analyst" || title.includes("analyst") || title.includes("sales")) {
      const allowedNavs = ALL_NAV_ITEMS.filter((item) =>
        ["/admin", "/admin/orders"].includes(item.href)
      );
      return { navs: allowedNavs, reports: ALL_REPORT_ITEMS };
    }

    // 5. Default Warehouse Staff
    const allowedNavs = ALL_NAV_ITEMS.filter((item) =>
      ["/admin", "/admin/inventory", "/admin/orders"].includes(item.href)
    );
    const allowedReports = ALL_REPORT_ITEMS.filter((item) =>
      ["/admin/reports/delivery-estimates"].includes(item.href)
    );
    return { navs: allowedNavs, reports: allowedReports };
  };

  const { navs: allowedNavItems, reports: allowedReportItems } = getRoleTabAccess(adminUser);

  // Check if current URL is forbidden for this user's role
  const isAllowedPath = () => {
    if (pathname === "/admin") return true;
    const isNavAllowed = allowedNavItems.some(
      (item) => item.href !== "/admin" && pathname.startsWith(item.href)
    );
    const isReportAllowed = allowedReportItems.some((rep) => pathname === rep.href);
    return isNavAllowed || isReportAllowed;
  };

  const handleSignOut = () => {
    window.localStorage.removeItem("brightbuy_admin_user");
    setAdminUser(null);
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-[#F7F7F7] text-[#222222] font-sans">
      {/* Persistent Dark Charcoal Admin Sidebar */}
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
                  Staff Operations Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Menu (Filtered by RBAC Role) */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            <div className="px-3 py-1.5 text-[10px] font-mono text-[#717171] uppercase tracking-wider font-bold">
              Allowed Modules ({allowedNavItems.length})
            </div>

            {allowedNavItems.map((item) => {
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

            {/* Management Reports Submenu (Filtered by RBAC Role) */}
            {allowedReportItems.length > 0 && (
              <div className="pt-4 space-y-1">
                <button
                  type="button"
                  onClick={() => setReportsOpen(!reportsOpen)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-mono text-[#717171] uppercase tracking-wider font-bold hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-[#FF385C]" />
                    <span>Reports ({allowedReportItems.length})</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform ${reportsOpen ? "rotate-180" : ""}`} />
                </button>

                {reportsOpen && (
                  <div className="space-y-1 pl-2 border-l-2 border-[#333333] ml-3 mt-1">
                    {allowedReportItems.map((rep) => {
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
            )}
          </nav>
        </div>

        {/* Staff User Profile Footer */}
        {adminUser && (
          <div className="p-4 border-t border-[#333333] bg-[#141414] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FF385C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{adminUser.name}</div>
                <div className="text-[10px] font-semibold text-[#FF385C] truncate">
                  {adminUser.jobTitle || adminUser.role}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2 bg-[#252525] hover:bg-[#333333] text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#333333]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Staff Sign Out</span>
            </button>
          </div>
        )}
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
              <span>RBAC Policy Enforced</span>
            </div>

            {/* Staff User Badge */}
            {adminUser && (
              <div className="flex items-center gap-2.5 border-l border-[#EBEBEB] pl-4">
                <div className="w-8 h-8 rounded-full bg-[#FF385C] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden md:block leading-tight">
                  <div className="text-xs font-bold text-[#222222]">{adminUser.name}</div>
                  <div className="text-[10px] text-[#FF385C] font-semibold">{adminUser.jobTitle || adminUser.role}</div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="ml-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#FF385C] border border-rose-200 font-bold text-xs rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Children with Access Control Guard */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {!isAllowedPath() ? (
            <div className="bg-white border border-red-200 rounded-3xl p-8 max-w-2xl mx-auto my-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                Access Permission Denied
              </span>
              <h2 className="text-2xl font-black text-[#222222]">
                Tab Restricted for Your Role
              </h2>
              <p className="text-xs text-[#717171] leading-relaxed max-w-md mx-auto">
                Your staff profile (<strong className="text-[#222222]">{adminUser?.jobTitle || adminUser?.role}</strong>) does not have access permissions for this module. Unwanted tabs have been hidden from your sidebar.
              </p>
              <Link
                href="/admin"
                className="inline-block bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold px-6 py-3 rounded-full transition-colors shadow-sm"
              >
                Return to My Staff Dashboard
              </Link>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
