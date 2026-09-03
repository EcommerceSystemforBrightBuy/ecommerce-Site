"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { TEXAS_CITIES } from "@/data/mockData";
import { User, Shield, CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { loginUser } = useShop();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Austin");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    const newUser = {
      id: `cust-${Date.now()}`,
      name: fullName || "Registered Texas Customer",
      email: email,
      city: city,
      phone: phone,
      isRegistered: true,
      memberSince: new Date().getFullYear().toString(),
    };
    loginUser(newUser);
    router.push("/products");
  };

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div className="border-b border-[#EBEBEB] pb-5">
        <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
          Account Creation
        </span>
        <h1 className="text-2xl font-black text-[#222222] mt-0.5">
          Register Customer Profile
        </h1>
        <p className="text-xs text-[#717171] mt-1">
          Mandatory for order confirmation and atomic inventory reservation.
        </p>
      </div>

      <form onSubmit={handleRegister} className="border border-[#DDDDDD] rounded-3xl p-6 space-y-4 text-xs bg-white shadow-sm">
        <div>
          <label className="block text-[#222222] font-bold mb-1 text-xs">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Amanda Chen"
            className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
          />
        </div>

        <div>
          <label className="block text-[#222222] font-bold mb-1 text-xs">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="amanda@texasmail.com"
            className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[#222222] font-bold mb-1 text-xs">
              Texas Residence City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs font-bold text-[#222222]"
            >
              {TEXAS_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#222222] font-bold mb-1 text-xs">
              Phone Number
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(512) 555-0199"
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
            />
          </div>
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
            placeholder="Create password"
            className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
          />
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F7F7] text-xs text-[#717171] space-y-1">
          <div className="font-bold text-[#222222]">Texas Customer Privileges</div>
          <div>• Direct stock reservation at Central Warehouse</div>
          <div>• Delivery tracking across all Texas cities</div>
          <div>• 24-Hour store pickup access</div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <span>Complete Customer Registration</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-[#717171]">
        Already have a registered account?{" "}
        <Link href="/login" className="font-bold text-[#FF385C] underline">
          Sign In
        </Link>
      </div>
    </main>
  );
}
