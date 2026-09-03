"use client";

import React, { useState } from "react";
import {
  X,
  User,
  ShieldCheck,
  UserCheck,
  MapPin,
  Lock,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { TEXAS_CITIES } from "@/data/mockData";

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) {
  const [tab, setTab] = useState("signin"); // 'signin' | 'register'

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Austin");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  // Preset demo registered customers for rapid evaluation
  const DEMO_CUSTOMERS = [
    {
      id: "cust-01",
      name: "David Martinez",
      email: "david.m@austinmail.com",
      city: "Austin",
      isRegistered: true,
      memberSince: "2024",
    },
    {
      id: "cust-02",
      name: "Sarah Jenkins",
      email: "sarah.j@dallascorp.com",
      city: "Dallas",
      isRegistered: true,
      memberSince: "2025",
    },
    {
      id: "cust-03",
      name: "Marcus Sterling",
      email: "m.sterling@houstontech.org",
      city: "Houston",
      isRegistered: true,
      memberSince: "2023",
    },
  ];

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      id: `cust-tx-${Date.now()}`,
      name: fullName || "New Texas Shopper",
      email: email || "customer@brightbuy.tx",
      city: city || "Austin",
      phone: phone || "(512) 555-0100",
      isRegistered: true,
      memberSince: "2026",
    };
    onLogin(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              BB
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Customer Account &amp; Guest Access
              </h3>
              <p className="text-[11px] text-slate-500">
                BrightBuy Texas Digital Commerce
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Current status info */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  currentUser
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {currentUser ? <UserCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {currentUser ? currentUser.name : "Guest Mode (Browsing Only)"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {currentUser
                    ? `Registered Customer (${currentUser.city}, TX)`
                    : "Must register to place orders"}
                </div>
              </div>
            </div>

            {currentUser && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50"
              >
                Sign Out
              </button>
            )}
          </div>

          {!currentUser ? (
            <>
              {/* Tab Selector */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTab("signin")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tab === "signin"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Quick Sign In (1-Click)
                </button>
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    tab === "register"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Register Customer
                </button>
              </div>

              {tab === "signin" ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-600">
                    Select a simulated Texas customer profile to authenticate immediately:
                  </div>

                  <div className="space-y-2">
                    {DEMO_CUSTOMERS.map((cust) => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => {
                          onLogin(cust);
                          onClose();
                        }}
                        className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between text-left group"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                            {cust.name}
                          </div>
                          <div className="text-[11px] text-slate-500">{cust.email}</div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800">
                          {cust.city}, TX
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Amanda Chen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@texasmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Texas City
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-blue-600"
                      >
                        {TEXAS_CITIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        placeholder="(512) 555-0100"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Complete Customer Registration
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-2 text-emerald-900">
              <div className="font-bold text-sm">Account Status: Active Registered Customer</div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                You have full access to cart checkout, atomic warehouse reservation, and instant
                Texas order placement with saved addresses.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
