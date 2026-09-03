"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { Lock, User, ArrowRight, UserCheck, Shield } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/products";

  const { currentUser, loginUser, logoutUser } = useShop();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const DEMO_USERS = [
    {
      id: "cust-01",
      name: "David Martinez",
      email: "david.m@austinmail.com",
      city: "Austin",
      phone: "(512) 555-0199",
      isRegistered: true,
    },
    {
      id: "cust-02",
      name: "Sarah Jenkins",
      email: "sarah.j@dallascorp.com",
      city: "Dallas",
      phone: "(214) 555-0144",
      isRegistered: true,
    },
    {
      id: "cust-03",
      name: "Marcus Sterling",
      email: "m.sterling@houstontech.org",
      city: "Houston",
      phone: "(713) 555-0182",
      isRegistered: true,
    },
  ];

  const handleManualLogin = (e) => {
    e.preventDefault();
    const user = {
      id: `cust-${Date.now()}`,
      name: email.split("@")[0] || "Registered Customer",
      email: email || "customer@brightbuy.tx",
      city: "Austin",
      phone: "(512) 555-0100",
      isRegistered: true,
    };
    loginUser(user);
    router.push(redirect);
  };

  const handleDemoLogin = (user) => {
    loginUser(user);
    router.push(redirect);
  };

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div className="border-b border-[#EBEBEB] pb-5">
        <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
          Authentication
        </span>
        <h1 className="text-2xl font-black text-[#222222] mt-0.5">
          Sign In to BrightBuy
        </h1>
        <p className="text-xs text-[#717171] mt-1">
          Registered accounts are required for checkout and atomic warehouse reservation.
        </p>
      </div>

      {currentUser ? (
        <div className="border border-[#DDDDDD] rounded-3xl p-6 space-y-4 text-xs bg-white shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
            <UserCheck className="w-4 h-4 text-[#FF385C]" />
            <span>Currently Signed In</span>
          </div>
          <div className="space-y-1 text-[#717171]">
            <div>Name: <strong className="text-[#222222]">{currentUser.name}</strong></div>
            <div>Email: <span className="font-mono text-[#222222]">{currentUser.email}</span></div>
            <div>City: <span className="text-[#222222] font-semibold">{currentUser.city}, TX</span></div>
          </div>
          <div className="flex items-center gap-3 pt-3">
            <Link
              href="/cart"
              className="flex-1 py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white text-center font-bold rounded-xl transition-colors shadow-sm text-xs"
            >
              Continue to Cart
            </Link>
            <button
              type="button"
              onClick={logoutUser}
              className="px-4 py-3 border border-[#DDDDDD] text-[#222222] font-bold rounded-xl hover:bg-[#F7F7F7] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1-Click Fast Sign In Profiles */}
          <div className="border border-[#DDDDDD] rounded-3xl p-5 space-y-3 bg-white shadow-sm">
            <div className="text-[11px] font-bold text-[#717171] uppercase tracking-wider">
              1-Click Demo Customer Profiles
            </div>
            <div className="space-y-2">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleDemoLogin(user)}
                  className="w-full p-3 border border-[#DDDDDD] rounded-2xl hover:border-[#222222] text-left transition-colors flex items-center justify-between text-xs bg-[#F7F7F7]"
                >
                  <div>
                    <div className="font-bold text-[#222222]">{user.name}</div>
                    <div className="text-xs text-[#717171]">{user.email}</div>
                  </div>
                  <span className="text-xs font-bold text-[#FF385C]">
                    {user.city}, TX &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#EBEBEB] w-full" />
            <span className="bg-white px-3 text-xs font-bold text-[#717171] uppercase">
              OR LOGIN WITH EMAIL
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleManualLogin} className="border border-[#DDDDDD] rounded-3xl p-6 space-y-4 text-xs bg-white shadow-sm">
            <div>
              <label className="block text-[#222222] font-bold mb-1 text-xs">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shopper@texasmail.com"
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <div>
              <label className="block text-[#222222] font-bold mb-1 text-xs">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold rounded-xl transition-colors shadow-md"
            >
              Sign In to Customer Account
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-2 text-center text-xs text-[#717171] space-y-2">
            <div>
              Don't have an account?{" "}
              <Link href="/register" className="font-bold text-[#FF385C] underline">
                Register Customer
              </Link>
            </div>
            <div>
              <Link href="/products" className="text-xs text-[#717171] hover:text-[#222222]">
                Continue Browsing as Guest &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#717171]">Loading authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
