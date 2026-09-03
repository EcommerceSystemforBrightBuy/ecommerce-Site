"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_STAFF } from "@/data/mockAdminData";
import { ArrowLeft, Save } from "lucide-react";

export default function EditStaffPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();

  const staff = MOCK_STAFF.find((s) => s.id === unwrappedParams.id) || MOCK_STAFF[0];

  const [name, setName] = useState(staff.name);
  const [email, setEmail] = useState(staff.email);
  const [role, setRole] = useState(staff.role);
  const [phone, setPhone] = useState(staff.phone);

  const handleSave = (e) => {
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
          Personnel Record Update
        </span>
        <h1 className="text-2xl font-black text-[#222222] mt-0.5">
          Edit Staff: {staff.name}
        </h1>
      </div>

      <form onSubmit={handleSave} className="border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 text-xs shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#222222] font-bold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            className="py-3 px-8 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Staff Record</span>
          </button>
        </div>
      </form>
    </div>
  );
}
