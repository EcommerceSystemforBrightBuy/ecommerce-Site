"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { ArrowRight } from "lucide-react";

const inputClass =
  "w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/products";
  const { loginUser } = useShop();

  const [cities, setCities] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cityId, setCityId] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/cities`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load cities");
        return res.json();
      })
      .then((data) => {
        setCities(data);
        if (data.length > 0) setCityId(data[0].city_id);
      })
      .catch((err) => {
        console.error("Error fetching cities:", err);
        setError("Could not load the city list. Please check that the backend is running.");
      });
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          phone,
          city_id: cityId,
          address_line: addressLine,
          postal_code: postalCode,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Registration failed. Please try again.");
        return;
      }

      await loginUser(result.user); 
      router.push(redirect);
    } catch (err) {
      console.error("Register error:", err);
      setError("Could not reach the server. Please check that the backend is running.");
    } finally {
      setSubmitting(false);
    }
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[#222222] font-bold mb-1 text-xs">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Amanda"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[#222222] font-bold mb-1 text-xs">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Chen"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-[#222222] font-bold mb-1 text-xs">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="amanda@texasmail.com"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[#222222] font-bold mb-1 text-xs">
              Texas Residence City
            </label>
            <select
              required
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs font-bold text-[#222222]"
            >
              {cities.map((c) => (
                <option key={c.city_id} value={c.city_id}>
                  {c.city_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#222222] font-bold mb-1 text-xs">Phone Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(512) 555-0199"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-[#222222] font-bold mb-1 text-xs">Street Address</label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="4500 Tech Ridge Blvd"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[#222222] font-bold mb-1 text-xs">ZIP Code</label>
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="78753"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[#222222] font-bold mb-1 text-xs">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[#222222] font-bold mb-1 text-xs">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className={inputClass}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F7F7] text-xs text-[#717171] space-y-1">
          <div className="font-bold text-[#222222]">Texas Customer Privileges</div>
          <div>• Direct stock reservation at Central Warehouse</div>
          <div>• Delivery tracking across all Texas cities</div>
          <div>• 24-Hour store pickup access</div>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-semibold">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || cities.length === 0}
          className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E00B41] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <span>{submitting ? "Creating account..." : "Complete Customer Registration"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-[#717171]">
        Already have a registered account?{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="font-bold text-[#FF385C] underline"
        >
          Sign In
        </Link>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#717171]">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
