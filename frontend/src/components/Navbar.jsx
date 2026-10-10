"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { TEXAS_CITIES } from "@/data/mockData";
import {
  Search,
  Globe,
  Menu,
  User,
  ShoppingBag,
  MapPin,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCartCount, currentUser, selectedCity, setSelectedCity, logoutUser } = useShop();
  const [cityOpen, setCityOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EBEBEB]">
      {/* Top minimal status notification bar */}
      <div className="bg-[#222222] text-white text-[11px] py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF385C] animate-pulse" />
            <span className="font-semibold text-white">Texas Central Warehouse Stock System</span>
            <span className="text-[#717171]">•</span>
            <span className="text-[#DDDDDD]">Statewide 5-Day Delivery &amp; Store Pickup</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[#DDDDDD] text-[11px]">
            <span>Card / Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Main Airbnb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-[#FF385C] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-[#E00B41] transition-colors">
            BB
          </div>
          <div className="hidden sm:block leading-none">
            <span className="font-black text-lg tracking-tight text-[#FF385C]">
              brightbuy
            </span>
            <span className="text-[10px] font-bold text-[#717171] block tracking-widest uppercase">
              texas retail
            </span>
          </div>
        </Link>

        {/* Airbnb Center Search Pill Capsule */}
        <div
          onClick={() => router.push("/products")}
          className="airbnb-pill-search rounded-full py-2 px-4 flex items-center gap-3 cursor-pointer text-xs font-semibold text-[#222222] transition-all hover:shadow-md"
        >
          <span className="hover:text-[#FF385C]">Any Category</span>
          <span className="text-[#DDDDDD] font-normal">|</span>
          <span className="hover:text-[#FF385C]">{selectedCity.name}, TX</span>
          <span className="text-[#DDDDDD] font-normal">|</span>
          <span className="text-[#717171] font-normal hidden md:inline">Central WH Stock</span>
          <div className="w-8 h-8 rounded-full bg-[#FF385C] text-white flex items-center justify-center shrink-0">
            <Search className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Right Tools: City Picker, Host / Customer, User Menu Pill, Cart */}
        <div className="flex items-center gap-3 shrink-0">
          {/* City Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCityOpen(!cityOpen)}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-[#222222] hover:bg-[#F7F7F7] px-3 py-2 rounded-full transition-colors"
            >
              <Globe className="w-4 h-4 text-[#717171]" />
              <span>{selectedCity.name}, TX</span>
            </button>

            {cityOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#DDDDDD] p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#717171] uppercase tracking-wider border-b border-[#EBEBEB] mb-1">
                  Destination City (Texas)
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {TEXAS_CITIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedCity(c);
                        setCityOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        selectedCity.name === c.name
                          ? "bg-[#F7F7F7] text-[#FF385C] font-bold"
                          : "text-[#222222] hover:bg-[#F7F7F7]"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-[#717171]">
                        {c.isMain ? "5-Day Metro" : "7-Day Regional"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Pill */}
          <Link
            href="/cart"
            className="flex items-center gap-2 bg-[#222222] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-full transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-[#FF385C]" />
            <span>{totalCartCount}</span>
          </Link>

          {/* Airbnb User Menu Pill Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 border border-[#DDDDDD] rounded-full px-3 py-1.5 hover:shadow-md transition-all bg-white cursor-pointer"
            >
              <Menu className="w-4 h-4 text-[#717171]" />
              <div className="w-7 h-7 rounded-full bg-[#FF385C] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
            </button>

            {userMenuOpen && (
              <div
                onMouseLeave={() => setUserMenuOpen(false)}
                className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-[#DDDDDD] py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                {currentUser ? (
                  <>
                    <div className="px-4 py-3 border-b border-[#EBEBEB] bg-[#F7F7F7]">
                      <span className="block text-[10px] font-bold text-[#FF385C] uppercase tracking-wider">
                        Signed In Customer
                      </span>
                      <p className="font-bold text-[#222222] text-sm truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-[#717171] truncate">{currentUser.email}</p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        href="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[#222222] font-bold hover:bg-[#F7F7F7] transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <ShoppingBag className="w-4 h-4 text-[#FF385C]" />
                          <span>My Orders</span>
                        </span>
                        <span className="bg-rose-50 text-[#FF385C] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          Track
                        </span>
                      </Link>

                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-[#222222] font-bold hover:bg-[#F7F7F7] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#717171]" />
                        <span>My Account Profile</span>
                      </Link>
                    </div>

                    <div className="border-t border-[#EBEBEB] p-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logoutUser();
                          setUserMenuOpen(false);
                          router.push("/");
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-2xl text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1 space-y-0.5">
                      <Link
                        href="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-[#222222] font-bold hover:bg-[#F7F7F7] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#FF385C]" />
                        <span>Log In</span>
                      </Link>

                      <Link
                        href="/login?mode=signup"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-[#222222] font-bold hover:bg-[#F7F7F7] transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-[#FF385C]" />
                        <span>Sign Up</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
