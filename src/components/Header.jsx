"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  MapPin,
  Search,
  User,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Store,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { TEXAS_CITIES } from "@/data/mockData";

export default function Header({
  cartCount,
  onOpenCart,
  selectedCity,
  onSelectCity,
  currentUser,
  onOpenAuth,
  searchQuery,
  onSearchChange,
}) {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top Texas Announcement Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-blue-400 font-semibold uppercase tracking-wider text-[11px] bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">
              <Sparkles className="w-3 h-3" />
              Texas Retail Network
            </span>
            <span>Central Warehouse Dispatch • Statewide Delivery & Store Pickup</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              Main Cities 5-Day Delivery
            </span>
            <span className="hidden md:inline-block text-slate-600">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-[11px]">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              5 Texas Pickup Hubs
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-lg tracking-tight">
              BB
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Bright<span className="text-blue-600">Buy</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">
                  Texas
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium tracking-wide">
                Electronics & STEM Toys
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search gadgets, smartphones, robotic toys, audio..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Right Actions: City Selector, User Status, Cart Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Texas City Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/70 transition-colors"
                title="Select delivery city in Texas"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Delivering to:</span>
                <span className="text-slate-900 font-bold">{selectedCity.name}, TX</span>
                <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    Select Destination City (Texas)
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {TEXAS_CITIES.map((city) => (
                      <button
                        key={city.name}
                        onClick={() => {
                          onSelectCity(city);
                          setCityDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg text-left transition-colors ${
                          selectedCity.name === city.name
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${city.isMain ? "text-blue-600" : "text-slate-400"}`} />
                          <span>{city.name}</span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            city.isMain
                              ? "bg-blue-100/70 text-blue-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {city.isMain ? "5-Day Main City" : "7-Day Standard"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Login/Guest Status */}
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all text-slate-700 hover:border-slate-300 bg-white shadow-2xs"
            >
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-[10px] text-slate-600 leading-tight">
                  {currentUser ? "Registered Customer" : "Guest Mode"}
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser ? currentUser.name : "Sign In to Checkout"}
                </div>
              </div>
            </button>

            {/* Cart Trigger Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl shadow-sm transition-all font-semibold text-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 bg-white text-blue-700 font-extrabold text-[11px] rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-slate-800"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
