"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  Warehouse,
  Truck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  AlertCircle,
  UserCheck,
} from "lucide-react";

const DEMO_STAFF_PERSONAS = [
  {
    roleId: "admin",
    name: "Sarah Connor (Super Admin)",
    jobTitle: "System Administrator",
    email: "admin@brightbuy.com",
    roleLabel: "Full System Access",
    badgeColor: "bg-rose-50 text-[#FF385C] border-rose-200",
    icon: ShieldCheck,
    description: "Full permissions: Staff Management, Products, Stock, Orders & Reports",
  },
  {
    roleId: "inventory_manager",
    name: "Marcus Vance (Inventory Lead)",
    jobTitle: "Inventory Specialist",
    email: "inventory@brightbuy.com",
    roleLabel: "Stock & Catalog",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    icon: Warehouse,
    description: "Access to Products Catalog, Central Stock, & Inventory Reports",
  },
  {
    roleId: "courier_staff",
    name: "David Miller (Logistics Dispatch)",
    jobTitle: "Logistics Specialist",
    email: "courier@brightbuy.com",
    roleLabel: "Orders & Dispatch",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    icon: Truck,
    description: "Access to Orders Queue, Dispatch Management, & Delivery Estimates",
  },
  {
    roleId: "sales_analyst",
    name: "Elena Rostova (Business Analyst)",
    jobTitle: "Sales Analyst",
    email: "analyst@brightbuy.com",
    roleLabel: "Analytics & Reports",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    icon: TrendingUp,
    description: "Access to Orders & All 5 Business Intelligence Reports",
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@brightbuy.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Check for Demo Persona Fallback
        const demoMatch = DEMO_STAFF_PERSONAS.find(
          (p) => p.email.toLowerCase() === email.trim().toLowerCase()
        );

        if (demoMatch) {
          const fallbackStaff = {
            userId: `STAFF-${Date.now()}`,
            name: demoMatch.name,
            email: demoMatch.email,
            role: demoMatch.roleId,
            jobTitle: demoMatch.jobTitle,
            hub: "BrightBuy Central Texas Hub (Austin)",
          };
          window.localStorage.setItem("brightbuy_admin_user", JSON.stringify(fallbackStaff));
          router.push("/admin");
          return;
        }

        setError(result.error || "Authentication failed. Invalid staff credentials.");
        setLoading(false);
        return;
      }

      window.localStorage.setItem("brightbuy_admin_user", JSON.stringify(result.user));
      router.push("/admin");
    } catch (err) {
      console.error("Admin login error:", err);
      const demoMatch = DEMO_STAFF_PERSONAS.find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (demoMatch) {
        const fallbackStaff = {
          userId: `STAFF-${Date.now()}`,
          name: demoMatch.name,
          email: demoMatch.email,
          role: demoMatch.roleId,
          jobTitle: demoMatch.jobTitle,
          hub: "BrightBuy Central Texas Hub (Austin)",
        };
        window.localStorage.setItem("brightbuy_admin_user", JSON.stringify(fallbackStaff));
        router.push("/admin");
        return;
      }
      setError("Could not connect to server. Please verify backend service is running.");
      setLoading(false);
    }
  };

  const selectPersona = (persona) => {
    setEmail(persona.email);
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#222222] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Branding & Persona Selection */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF385C] text-white font-black flex items-center justify-center text-lg shadow-md">
              BB
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-[#222222] block leading-none">
                brightbuy
              </span>
              <span className="text-[10px] font-bold text-[#FF385C] uppercase tracking-widest block mt-0.5">
                Texas Central Operations Hub
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#222222]">
              Staff &amp; Admin Portal
            </h1>
            <p className="text-xs text-[#717171] mt-2 leading-relaxed">
              Role-Based Access Control (RBAC) workspace for warehouse inventory management, product catalog maintenance, and Texas courier dispatch.
            </p>
          </div>

          {/* Persona Selection Buttons */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#717171] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF385C]" />
              Select Demo Staff Persona to Test RBAC Permissions:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_STAFF_PERSONAS.map((p) => {
                const Icon = p.icon;
                const isSelected = email.toLowerCase() === p.email.toLowerCase();
                return (
                  <button
                    key={p.roleId}
                    type="button"
                    onClick={() => selectPersona(p)}
                    className={`text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-white border-[#FF385C] ring-2 ring-[#FF385C]/20 shadow-md"
                        : "bg-white border-[#DDDDDD] hover:border-[#222222]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#222222]">
                        <Icon className="w-3.5 h-3.5 text-[#FF385C]" />
                        <span>{p.jobTitle}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                        {p.roleLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#717171] truncate">{p.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Clean White Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-[#DDDDDD] rounded-3xl p-8 shadow-xl space-y-6">
            <div className="border-b border-[#EBEBEB] pb-4">
              <h2 className="text-lg font-bold text-[#222222] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#FF385C]" />
                <span>Staff Credentials Sign In</span>
              </h2>
              <p className="text-xs text-[#717171] mt-0.5">
                Log into your authorized operational workspace.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#222222] mb-1.5 text-xs">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#717171] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl pl-10 pr-4 py-3 text-[#222222] text-xs focus:outline-none focus:border-[#FF385C]"
                    placeholder="staff@brightbuy.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#222222] mb-1.5 text-xs">
                  Staff Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#717171] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl pl-10 pr-4 py-3 text-[#222222] text-xs focus:outline-none focus:border-[#FF385C]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E00B41] disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <span>{loading ? "Authenticating..." : "Enter Operations Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#EBEBEB]">
              <span className="text-[11px] text-[#717171]">
                Texas Central Hub • Authorized Staff Personnel Only
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
