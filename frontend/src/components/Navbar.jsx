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
  LayoutGrid,
  ArrowRight,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCartCount, currentUser, selectedCity, setSelectedCity, logoutUser } = useShop();
  const [cityOpen, setCityOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  const handleAllProductsClick = () => {
    setIsExpanding(true);
    setTimeout(() => {
      router.push("/products");
      setTimeout(() => setIsExpanding(false), 500);
    }, 280);
  };

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

        {/* Animated Expanding All Products Button */}
        <button
          type="button"
          onClick={handleAllProductsClick}
          className={`group relative overflow-hidden flex items-center justify-center gap-3 py-2.5 rounded-full font-black text-xs transition-all duration-300 ease-out shadow-xs border cursor-pointer ${
            isExpanding
              ? "w-64 bg-[#FF385C] text-white border-[#FF385C] shadow-lg scale-105"
              : "w-44 hover:w-56 bg-[#F7F7F7] hover:bg-white text-[#222222] hover:text-[#FF385C] border-[#DDDDDD] hover:border-[#FF385C] hover:shadow-md"
          }`}
          title="Browse All Products"
        >
          {/* Subtle background shimmer / ripple */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
              isExpanding ? "bg-white text-[#FF385C] scale-110" : "bg-[#FF385C] text-white group-hover:scale-105"
            }`}
          >
            <LayoutGrid
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                isExpanding ? "rotate-90" : "group-hover:rotate-12"
              }`}
            />
          </div>

          <span className="tracking-wide uppercase text-[11px] font-black truncate">
            {isExpanding ? "Loading Catalog..." : "All Products"}
          </span>

          <ArrowRight
            className={`w-3.5 h-3.5 transition-transform duration-300 shrink-0 ${
              isExpanding
                ? "translate-x-1.5"
                : "text-[#717171] group-hover:text-[#FF385C] group-hover:translate-x-1"
            }`}
          />
        </button>

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

          {/* Cart Pill with Dynamic Micro-Animation */}
          <Link
            href="/cart"
            className="group relative flex items-center gap-2 bg-[#222222] hover:bg-black active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#FF385C] group-hover:scale-115 transition-transform duration-200" />
            <span className="font-mono text-xs">{totalCartCount}</span>
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF385C] animate-ping" />
            )}
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
