"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function OnboardStaffPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Store Operations Lead");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push("/admin/staff");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/staff"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#717171] hover:text-[#222222]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Staff Directory</span>
      </Link>

      <div className="border-b border-[#EBEBEB] pb-4">
        <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
          Personnel Onboarding
        </span>
        <h1 className="text-2xl font-black text-[#222222] mt-0.5">
          Onboard New Staff Member
        </h1>
        <p className="text-xs text-[#717171] mt-0.5">
          BrightBuy Central Texas Store &amp; Warehouse (Austin, TX)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 text-xs shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#222222] font-bold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jason Thorne"
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
            />
          </div>

          <div>
            <label className="block text-[#222222] font-bold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jason.t@brightbuy.tx"
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
            />
          </div>

          <div>
            <label className="block text-[#222222] font-bold mb-1">Role Title</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs font-bold text-[#222222]"
            >
              <option value="Central WH Director">Central WH Director</option>
              <option value="Store Operations Lead">Store Operations Lead</option>
              <option value="Logistics Supervisor">Logistics Supervisor</option>
              <option value="Inventory Specialist">Inventory Specialist</option>
              <option value="Customer Care Lead">Customer Care Lead</option>
            </select>
          </div>

          <div>
            <label className="block text-[#222222] font-bold mb-1">Assigned Central Hub</label>
            <input
              type="text"
              disabled
              value="BrightBuy Central Texas Hub (Austin)"
              className="w-full bg-[#EBEBEB] border border-[#DDDDDD] rounded-xl p-3 text-xs font-bold text-[#717171]"
            />
          </div>

          <div>
            <label className="block text-[#222222] font-bold mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(512) 555-0188"
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
            />
          </div>

          <div>
            <label className="block text-[#222222] font-bold mb-1">Avatar Image URL</label>
            <input
              type="text"
              required
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#EBEBEB]">
          <Link
            href="/admin/staff"
            className="py-3 px-6 border border-[#DDDDDD] text-[#222222] font-bold text-xs rounded-xl hover:bg-[#F7F7F7]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="py-3 px-8 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl shadow-md"
          >
            Onboard Staff Member
          </button>
        </div>
      </form>
    </div>
  );
}
