"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function EditStaffPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();

  const [staff, setStaff] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [hub, setHub] = useState("");
  const [avatar, setAvatar] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/staff");
        if (!response.ok) throw new Error("Could not load staff record.");
        const staffList = await response.json();
        const record = staffList.find((item) => item.id === unwrappedParams.id);
        if (!record) throw new Error("Staff member not found.");
        setStaff(record);
        setName(record.name || "");
        setEmail(record.email || "");
        setRole(record.role || "");
        setPhone(record.phone || "");
        setHub(record.hub || "");
        setAvatar(record.avatar || "");
      } catch (fetchError) {
        console.error("Staff fetch error:", fetchError);
        setError(fetchError.message || "Could not load staff record.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [unwrappedParams.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`http://localhost:8000/api/staff/${unwrappedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, phone, hub, avatar_url: avatar, password }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Could not update staff member.");
      }

      router.push("/admin/staff");
    } catch (saveError) {
      console.error("Staff update error:", saveError);
      setError(saveError.message || "Could not update staff member.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-[#717171]">Loading staff record...</p>;

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
          Edit Staff: {staff ? staff.name : ""}
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

          <div>
            <label className="block text-[#222222] font-bold mb-1">Assigned Central Hub</label>
            <input
              type="text"
              required
              value={hub}
              onChange={(e) => setHub(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
            />
          </div>

          <div>
            <label className="block text-[#222222] font-bold mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
            />
          </div>

          <div>
            <label className="block text-[#222222] font-bold mb-1">New Password (optional)</label>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs font-bold text-rose-700">
            {error}
          </p>
        )}

        <div className="pt-4 flex justify-end gap-3 border-t border-[#EBEBEB]">
          <Link
            href="/admin/staff"
            className="py-3 px-6 border border-[#DDDDDD] text-[#222222] font-bold text-xs rounded-xl hover:bg-[#F7F7F7]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !staff}
            className="py-3 px-8 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Update Staff Record"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
