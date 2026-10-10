"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";

const inputClass =
  "w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]";

// Profile page: shows the customer's details and lets them change phone + delivery address
// (GET /api/customers/:id is used on load, PUT /api/customers/:id on save).
export default function AccountPage() {
  const { currentUser, authReady, updateUser, logoutUser } = useShop();

  const [cities, setCities] = useState([]);
  const [phone, setPhone] = useState("");
  const [cityId, setCityId] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const customerId = currentUser?.customerId;

  // Load the freshest profile from the database + the city list
  useEffect(() => {
    if (!customerId) return;

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/cities`)
      .then((res) => res.json())
      .then(setCities)
      .catch((err) => console.error("Error fetching cities:", err));

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/customers/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        setPhone(data.user.phone || "");
        setCityId(data.user.cityId || "");
        setAddressLine(data.user.addressLine || "");
        setPostalCode(data.user.postalCode || "");
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, [customerId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          city_id: cityId,
          address_line: addressLine,
          postal_code: postalCode,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage({ type: "error", text: result.error || "Could not save your profile." });
        return;
      }

      updateUser(result.user);
      setMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      console.error("Profile update error:", err);
      setMessage({ type: "error", text: "Could not reach the server. Please check that the backend is running." });
    } finally {
      setSaving(false);
    }
  };

  if (!authReady) {
    return <div className="p-12 text-center text-xs text-[#717171]">Loading profile...</div>;
  }

  if (!currentUser) {
    return (
      <main className="max-w-md mx-auto px-4 sm:px-6 py-14 text-center space-y-4">
        <h1 className="text-xl font-black text-[#222222]">Sign in to see your profile</h1>
        <Link
          href="/login?redirect=/account"
          className="inline-block bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold px-6 py-3 rounded-xl"
        >
          Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div className="border-b border-[#EBEBEB] pb-5">
        <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
          My Account
        </span>
        <h1 className="text-2xl font-black text-[#222222] mt-0.5">{currentUser.name}</h1>
        <p className="text-xs text-[#717171] mt-1 font-mono">{currentUser.email}</p>
      </div>

      <form onSubmit={handleSave} className="border border-[#DDDDDD] rounded-3xl p-6 space-y-4 text-xs bg-white shadow-sm">
        <div>
          <label className="block text-[#222222] font-bold mb-1 text-xs">Phone Number</label>
          <input
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-[#222222] font-bold mb-1 text-xs">Texas City</label>
          <select
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

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-[#222222] font-bold mb-1 text-xs">Street Address</label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
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
              className={inputClass}
            />
          </div>
        </div>

        {message.text && (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={`p-3 rounded-xl border font-semibold ${
              message.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E00B41] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="flex items-center justify-between text-xs">
        <Link href="/cart" className="font-bold text-[#FF385C] underline">
          Go to Cart
        </Link>
        <button type="button" onClick={logoutUser} className="font-bold text-[#717171] hover:text-[#222222]">
          Sign Out
        </button>
      </div>
    </main>
  );
}
